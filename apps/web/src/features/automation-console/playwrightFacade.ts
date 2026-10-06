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
  const protoDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value");
  const setter = protoDescriptor?.set;
  setter ? setter.call(el, value) : (el.value = value);
}

type Resolver = (doc: Document) => Element[];

/**
 * Mirrors real Playwright's async locator model: every action/assertion returns a real Promise
 * and is awaited explicitly in the user's script, exactly like real Playwright code. The resolver
 * re-queries the live iframe document on every call (never caches a stale element), matching
 * Playwright's own auto-waiting/re-query semantics.
 */
export class PwLocator {
  constructor(
    private getDoc: () => Document,
    private resolve: Resolver,
    public readonly describe: string,
    private log: Logger,
  ) {}

  private queryAll(): Element[] {
    return this.resolve(this.getDoc());
  }

  private queryFirst(): Element {
    const el = this.queryAll()[0];
    if (!el) throw new Error(`${this.describe} resolved to 0 elements`);
    return el;
  }

  async click() {
    await delay(150);
    const el = this.queryFirst();
    if (typeof (el as HTMLElement).click !== "function") throw new Error(`${this.describe}.click() \u2014 target is not a clickable HTMLElement`);
    (el as HTMLElement).click();
    this.log({ type: "pass", message: `${this.describe}.click()` });
  }

  async fill(text: string) {
    await delay(150);
    const el = this.queryFirst();
    if (!isFormField(el)) {
      throw new Error(`${this.describe}.fill() \u2014 target is not an input/textarea`);
    }
    setNativeValue(el, text);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    this.log({ type: "pass", message: `${this.describe}.fill('${text}')` });
  }

  async textContent(): Promise<string> {
    await delay(80);
    const el = this.queryFirst();
    const text = el.textContent?.trim() ?? "";
    this.log({ type: "info", message: `${this.describe}.textContent() \u2192 "${text}"` });
    return text;
  }

  async isVisible(): Promise<boolean> {
    await delay(80);
    const el = this.queryAll()[0];
    if (!el) return false;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && (rect.width > 0 || rect.height > 0);
  }

  async count(): Promise<number> {
    await delay(60);
    return this.queryAll().length;
  }

  async isChecked(): Promise<boolean> {
    await delay(60);
    const el = this.queryFirst() as HTMLInputElement;
    return !!el.checked;
  }

  async isDisabled(): Promise<boolean> {
    await delay(60);
    const el = this.queryFirst() as HTMLInputElement;
    return !!el.disabled;
  }
}

export class PwPage {
  constructor(
    private getIframe: () => HTMLIFrameElement | undefined,
    private log: Logger,
  ) {}

  private get iframeEl(): HTMLIFrameElement {
    const el = this.getIframe();
    if (!el) throw new Error("No active preview tab to run against.");
    return el;
  }

  private getDoc = (): Document => {
    const d = this.iframeEl.contentDocument;
    if (!d) throw new Error("Preview frame is not ready yet.");
    return d;
  };

  async goto(url: string) {
    await new Promise<void>((resolve) => {
      const onLoad = () => {
        this.iframeEl.removeEventListener("load", onLoad);
        resolve();
      };
      this.iframeEl.addEventListener("load", onLoad);
      this.iframeEl.src = url;
    });
    this.log({ type: "pass", message: `page.goto('${url}')` });
  }

  locator(selector: string): PwLocator {
    return new PwLocator(this.getDoc, (doc) => Array.from(doc.querySelectorAll(selector)), `page.locator('${selector}')`, this.log);
  }

  getByTestId(id: string): PwLocator {
    return new PwLocator(this.getDoc, (doc) => Array.from(doc.querySelectorAll(`[data-testid="${id}"]`)), `page.getByTestId('${id}')`, this.log);
  }

  getByText(text: string): PwLocator {
    const resolve: Resolver = (doc) => {
      const result = doc.evaluate(`//*[text()='${text}']`, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      const nodes: Element[] = [];
      for (let i = 0; i < result.snapshotLength; i++) nodes.push(result.snapshotItem(i) as Element);
      return nodes;
    };
    return new PwLocator(this.getDoc, resolve, `page.getByText('${text}')`, this.log);
  }
}

/** Playwright's real `expect(locator).toX()` assertions \u2014 async, auto-waiting, throws on failure. */
export function createExpect(log: Logger) {
  return function expect(locator: PwLocator) {
    const run = async (assertionLabel: string, check: () => Promise<void>) => {
      try {
        await check();
        log({ type: "pass", message: `expect(${locator.describe}).${assertionLabel}` });
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        log({ type: "fail", message: `expect(${locator.describe}).${assertionLabel} \u2014 ${message}` });
        throw e;
      }
    };
    return {
      toBeVisible: () =>
        run("toBeVisible()", async () => {
          if (!(await locator.isVisible())) throw new Error("element is not visible");
        }),
      toHaveText: (expected: string) =>
        run(`toHaveText('${expected}')`, async () => {
          const actual = await locator.textContent();
          if (actual !== expected) throw new Error(`expected text "${expected}", got "${actual}"`);
        }),
      toHaveCount: (expected: number) =>
        run(`toHaveCount(${expected})`, async () => {
          const actual = await locator.count();
          if (actual !== expected) throw new Error(`expected ${expected} elements, got ${actual}`);
        }),
      toBeChecked: () =>
        run("toBeChecked()", async () => {
          if (!(await locator.isChecked())) throw new Error("element is not checked");
        }),
      toBeDisabled: () =>
        run("toBeDisabled()", async () => {
          if (!(await locator.isDisabled())) throw new Error("element is not disabled");
        }),
      toBeEnabled: () =>
        run("toBeEnabled()", async () => {
          if (await locator.isDisabled()) throw new Error("element is disabled");
        }),
    };
  };
}
