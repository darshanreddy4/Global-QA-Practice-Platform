export type LogEntry = { type: "info" | "pass" | "fail"; message: string };
export type Logger = (entry: LogEntry) => void;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Elements queried out of the iframe's document belong to the IFRAME's own window realm, so
// `instanceof HTMLInputElement` (checked against the parent window's constructor) always fails
// cross-realm. Use tagName duck-typing instead, and reach the native value setter generically.
function isFormField(el: Element): el is HTMLInputElement | HTMLTextAreaElement {
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA";
}
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const descriptor = Object.getOwnPropertyDescriptor(el, "value");
  const protoDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value");
  const setter = protoDescriptor?.set ?? descriptor?.set;
  setter ? setter.call(el, value) : (el.value = value);
}

function waitForFrameLoad(iframeEl: HTMLIFrameElement, url: string): Promise<void> {
  return new Promise((resolve) => {
    const onLoad = () => {
      iframeEl.removeEventListener("load", onLoad);
      resolve();
    };
    iframeEl.addEventListener("load", onLoad);
    iframeEl.src = url;
  });
}

type CyStep = { describe: string; run: (subject: Element[], doc: Document) => Element[] | Promise<Element[]> };

/**
 * Mirrors real Cypress's command-queue model: calling `cy.get(...)` / `.click()` etc. does NOT
 * execute anything immediately \u2014 it enqueues a step, exactly like real Cypress does internally
 * (which is how Cypress lets you write `cy.get(x).click()` with no `await` anywhere). The whole
 * script's queue is drained in order, one step at a time, AFTER the synchronous script body
 * finishes running, which is what gives Cypress its characteristic "replay" execution.
 */
export class CyChain {
  private steps: CyStep[] = [];
  constructor(private ctx: CyContext, initial: CyStep) {
    this.steps.push(initial);
    ctx.register(this);
  }
  private push(describe: string, run: CyStep["run"]): this {
    this.steps.push({ describe, run });
    return this;
  }
  contains(text: string) {
    return this.push(`.contains('${text}')`, (subject, doc) => {
      const pool = subject.length ? subject.flatMap((el) => Array.from(el.querySelectorAll("*"))) : Array.from(doc.querySelectorAll("body *"));
      const match = pool.find((el) => el.children.length === 0 && el.textContent?.trim() === text) ?? pool.find((el) => el.textContent?.trim().includes(text));
      if (!match) throw new Error(`.contains('${text}') found no matching element`);
      return [match];
    });
  }
  find(selector: string) {
    return this.push(`.find('${selector}')`, (subject) => {
      const base = subject[0];
      if (!base) throw new Error(`.find('${selector}') has no element to search within`);
      return Array.from(base.querySelectorAll(selector));
    });
  }
  first() {
    return this.push(".first()", (subject) => (subject.length ? [subject[0]] : []));
  }
  last() {
    return this.push(".last()", (subject) => (subject.length ? [subject[subject.length - 1]] : []));
  }
  eq(i: number) {
    return this.push(`.eq(${i})`, (subject) => (subject[i] ? [subject[i]] : []));
  }
  click() {
    return this.push(".click()", (subject) => {
      const el = subject[0];
      if (!el) throw new Error(".click() found no element to click");
      if (typeof (el as HTMLElement).click !== "function") throw new Error(".click() target is not a clickable HTMLElement");
      (el as HTMLElement).click();
      return subject;
    });
  }
  type(text: string) {
    return this.push(`.type('${text}')`, (subject) => {
      const el = subject[0] as HTMLInputElement | HTMLTextAreaElement | undefined;
      if (!el || !isFormField(el)) {
        throw new Error(".type() target is not an input/textarea");
      }
      setNativeValue(el, (el.value || "") + text);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return subject;
    });
  }
  clear() {
    return this.push(".clear()", (subject) => {
      const el = subject[0] as HTMLInputElement | HTMLTextAreaElement | undefined;
      if (!el || !isFormField(el)) {
        throw new Error(".clear() target is not an input/textarea");
      }
      setNativeValue(el, "");
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return subject;
    });
  }
  should(chainer: string, expected?: unknown) {
    return this.push(`.should('${chainer}'${expected !== undefined ? `, '${String(expected)}'` : ""})`, (subject) => {
      const el = subject[0] as (HTMLInputElement & { disabled?: boolean; checked?: boolean }) | undefined;
      switch (chainer) {
        case "exist":
          if (!el) throw new Error("expected element to exist");
          break;
        case "not.exist":
          if (el) throw new Error("expected element to not exist");
          break;
        case "be.visible": {
          if (!el) throw new Error("expected element to exist");
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          if (style.display === "none" || style.visibility === "hidden" || (rect.width === 0 && rect.height === 0)) {
            throw new Error("expected element to be visible");
          }
          break;
        }
        case "be.disabled":
          if (!el?.disabled) throw new Error("expected element to be disabled");
          break;
        case "be.enabled":
          if (!el || el.disabled) throw new Error("expected element to be enabled");
          break;
        case "be.checked":
          if (!el?.checked) throw new Error("expected element to be checked");
          break;
        case "have.text":
          if (el?.textContent?.trim() !== expected) throw new Error(`expected text "${el?.textContent?.trim()}" to equal "${String(expected)}"`);
          break;
        case "contain.text":
          if (!el?.textContent?.includes(String(expected))) throw new Error(`expected text "${el?.textContent}" to contain "${String(expected)}"`);
          break;
        case "have.value":
          if (el?.value !== expected) throw new Error(`expected value "${el?.value}" to equal "${String(expected)}"`);
          break;
        case "have.length":
          if (subject.length !== Number(expected)) throw new Error(`expected ${subject.length} elements, got ${String(expected)}`);
          break;
        default:
          throw new Error(`Unsupported should() assertion: "${chainer}"`);
      }
      return subject;
    });
  }
  async run(doc: Document, log: Logger) {
    let subject: Element[] = [];
    for (const step of this.steps) {
      try {
        subject = await step.run(subject, doc);
        log({ type: "pass", message: `cy${step.describe}` });
      } catch (e) {
        log({ type: "fail", message: `cy${step.describe} \u2014 ${e instanceof Error ? e.message : String(e)}` });
        throw e;
      }
      await delay(120);
    }
  }
}

export class CyContext {
  private chains: CyChain[] = [];
  constructor(private iframeEl: HTMLIFrameElement) {}
  register(chain: CyChain) {
    this.chains.push(chain);
  }
  private get doc(): Document {
    const d = this.iframeEl.contentDocument;
    if (!d) throw new Error("Preview frame is not ready yet.");
    return d;
  }
  visit(url: string) {
    return new CyChain(this, {
      describe: `.visit('${url}')`,
      run: async () => {
        await waitForFrameLoad(this.iframeEl, url);
        return [];
      },
    });
  }
  get(selector: string) {
    return new CyChain(this, {
      describe: `.get('${selector}')`,
      run: (_subject, doc) => {
        const found = Array.from(doc.querySelectorAll(selector));
        if (found.length === 0) throw new Error(`found 0 elements for '${selector}'`);
        return found;
      },
    });
  }
  contains(text: string) {
    return new CyChain(this, {
      describe: `.contains('${text}')`,
      run: (_subject, doc) => {
        const all = Array.from(doc.querySelectorAll("body *"));
        const match = all.find((el) => el.children.length === 0 && el.textContent?.trim() === text) ?? all.find((el) => el.textContent?.trim().includes(text));
        if (!match) throw new Error(`found no element containing '${text}'`);
        return [match];
      },
    });
  }
  /** Drains every top-level chain created so far, in the order they were constructed. */
  async runAll(log: Logger) {
    for (const chain of this.chains) {
      await chain.run(this.doc, log);
    }
  }
}
