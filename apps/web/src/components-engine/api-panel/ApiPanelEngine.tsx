import React, { useState } from "react";
import { rawApiRequest } from "../../services/apiClient";
import { Badge, Button, ErrorState } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type ApiPanelEngineProps = { variant: string };

/** ONE engine component for Network/API Testing, API Interception & Mocking, and API-Driven UI. */
export function ApiPanelEngine({ variant }: ApiPanelEngineProps) {
  switch (variant) {
    case "get-list-products":
      return <GetListProducts />;
    case "post-create-product":
      return <PostCreateProduct />;
    case "patch-update-product":
      return <PatchUpdateProduct />;
    case "delete-then-get":
      return <DeleteThenGet />;
    case "bearer-auth-endpoint":
      return <BearerAuthEndpoint />;
    case "intercept-modify-response":
      return <InterceptModifyResponse />;
    case "intercept-force-error":
      return <InterceptForceError />;
    case "intercept-abort-request":
      return <InterceptAbortRequest />;
    case "category-filtered-grid":
      return <CategoryFilteredGrid />;
    case "dashboard-widget-states":
      return <DashboardWidgetStates />;
    default:
      return <p className="text-sm text-red-600">Unknown api-panel variant: {variant}</p>;
  }
}

function StatusBadge({ status }: { status?: number }) {
  if (status === undefined) return null;
  const tone = status < 300 ? "success" : status < 500 ? "warning" : "danger";
  return <Badge tone={tone}>{status}</Badge>;
}

function JsonPreview({ value }: { value: unknown }) {
  return (
    <pre data-testid="response-body" className="max-h-40 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function GetListProducts() {
  const { setField } = useChallengeField();
  const [result, setResult] = useState<{ status: number; body: unknown }>();

  const send = async () => {
    const res = await rawApiRequest("/lab/products");
    if (res.networkFailure) return;
    setResult({ status: res.status, body: res.body });
    setField("lastStatus", res.status);
    setField("lastProductCount", Array.isArray((res.body as any)?.data) ? (res.body as any).data.length : 0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge tone="info">GET</Badge>
        <code className="text-xs text-slate-500">/api/lab/products</code>
        <Button size="sm" data-testid="send-get-products-btn" onClick={send}>Send GET /products</Button>
        <StatusBadge status={result?.status} />
      </div>
      {result && <JsonPreview value={result.body} />}
    </div>
  );
}

function PostCreateProduct() {
  const { setField } = useChallengeField();
  const [name, setName] = useState("Desk Lamp");
  const [price, setPrice] = useState("24.99");
  const [result, setResult] = useState<{ status: number; body: unknown; location?: string }>();

  const send = async () => {
    const res = await rawApiRequest("/lab/products", { method: "POST", body: JSON.stringify({ name, price: Number(price) }) });
    if (res.networkFailure) return;
    setResult({ status: res.status, body: res.body, location: res.headers.get("Location") ?? undefined });
    setField("lastStatus", res.status);
    setField("createdProductId", (res.body as any)?.data?.id ?? "");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input data-testid="post-name-input" className="rounded-md border border-slate-300 px-2 py-1 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
        <input data-testid="post-price-input" type="number" className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Button size="sm" data-testid="send-post-product-btn" onClick={send}>Send POST /products</Button>
        <StatusBadge status={result?.status} />
      </div>
      {result?.location && <p className="text-xs text-slate-500">Location: {result.location}</p>}
      {result && <JsonPreview value={result.body} />}
    </div>
  );
}

function PatchUpdateProduct() {
  const { setField } = useChallengeField();
  const [price, setPrice] = useState("39.99");
  const [result, setResult] = useState<{ status: number; body: unknown }>();

  const send = async () => {
    const res = await rawApiRequest("/lab/products/p1", { method: "PATCH", body: JSON.stringify({ price: Number(price) }) });
    if (res.networkFailure) return;
    setResult({ status: res.status, body: res.body });
    setField("lastStatus", res.status);
    setField("patchedPrice", (res.body as any)?.data?.price);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge tone="info">PATCH</Badge>
        <code className="text-xs text-slate-500">/api/lab/products/p1</code>
        <input data-testid="patch-price-input" type="number" className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Button size="sm" data-testid="send-patch-product-btn" onClick={send}>Send PATCH /products/p1</Button>
        <StatusBadge status={result?.status} />
      </div>
      {result && <JsonPreview value={result.body} />}
    </div>
  );
}

function DeleteThenGet() {
  const { setField } = useChallengeField();
  const [deleteStatus, setDeleteStatus] = useState<number>();
  const [followUpStatus, setFollowUpStatus] = useState<number>();

  const run = async () => {
    const del = await rawApiRequest("/lab/products/p2", { method: "DELETE" });
    if (!del.networkFailure) {
      setDeleteStatus(del.status);
      setField("deleteStatus", del.status);
    }
    const get = await rawApiRequest("/lab/products/p2");
    if (!get.networkFailure) {
      setFollowUpStatus(get.status);
      setField("followUpGetStatus", get.status);
    }
  };

  return (
    <div className="space-y-3">
      <Button size="sm" data-testid="delete-then-get-btn" onClick={run}>Delete then verify</Button>
      <div className="flex gap-4 text-sm text-slate-600">
        <span>DELETE status: <StatusBadge status={deleteStatus} /></span>
        <span>Follow-up GET status: <StatusBadge status={followUpStatus} /></span>
      </div>
    </div>
  );
}

function BearerAuthEndpoint() {
  const { setField } = useChallengeField();
  const [token, setToken] = useState("qa-lab-token");
  const [result, setResult] = useState<{ status: number; body: unknown }>();

  const send = async () => {
    const res = await rawApiRequest("/lab/secure-report", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.networkFailure) return;
    setResult({ status: res.status, body: res.body });
    setField("lastStatus", res.status);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label htmlFor="bearerToken" className="text-sm text-slate-600">Token:</label>
        <input id="bearerToken" data-testid="bearer-token-input" className="w-48 rounded-md border border-slate-300 px-2 py-1 text-sm" value={token} onChange={(e) => setToken(e.target.value)} />
        <Button size="sm" data-testid="send-secure-report-btn" onClick={send}>Send GET /secure-report</Button>
        <StatusBadge status={result?.status} />
      </div>
      {result && <JsonPreview value={result.body} />}
    </div>
  );
}

function InterceptModifyResponse() {
  const { setField } = useChallengeField();
  const [price, setPrice] = useState<number>();

  const refresh = async () => {
    const res = await rawApiRequest("/lab/stock-price");
    if (res.networkFailure) return;
    const value = (res.body as any)?.data?.price;
    setPrice(value);
    setField("stockPrice", value);
  };

  return (
    <div className="space-y-3">
      <Button size="sm" data-testid="refresh-price-btn" onClick={refresh}>Refresh Price</Button>
      <p className="text-2xl font-semibold text-slate-900" data-testid="stock-price-display">
        {price !== undefined ? `$${price}` : "\u2014"}
      </p>
    </div>
  );
}

function InterceptForceError() {
  const { setField } = useChallengeField();
  const [status, setStatus] = useState<number>();
  const [products, setProducts] = useState<unknown[]>();

  const load = async () => {
    const res = await rawApiRequest("/lab/products");
    if (res.networkFailure) return;
    setStatus(res.status);
    setField("lastStatus", res.status);
    if (res.ok) setProducts((res.body as any)?.data ?? []);
    else setProducts(undefined);
  };

  return (
    <div className="space-y-3">
      <Button size="sm" data-testid="load-products-btn" onClick={load}>Load Products</Button>
      {status && status >= 500 && <ErrorState title="Failed to load products" detail={`Server responded with ${status}`} onRetry={load} />}
      {products && (
        <ul className="text-sm text-slate-600">
          {products.map((p: any) => <li key={p.id}>{p.name}</li>)}
        </ul>
      )}
    </div>
  );
}

function InterceptAbortRequest() {
  const { setField } = useChallengeField();
  const [state, setState] = useState<"idle" | "loaded" | "network-error">("idle");

  const load = async () => {
    const res = await rawApiRequest("/lab/products");
    if (res.networkFailure) {
      setState("network-error");
      setField("networkFailure", true);
      return;
    }
    setState("loaded");
  };

  return (
    <div className="space-y-3">
      <Button size="sm" data-testid="load-products-abort-btn" onClick={load}>Load Products</Button>
      {state === "network-error" && (
        <ErrorState title="Network request failed" detail="No response was received (connection aborted)." onRetry={load} />
      )}
      {state === "loaded" && <Badge tone="success">Loaded successfully</Badge>}
    </div>
  );
}

const CATEGORIES_FALLBACK = ["Electronics", "Furniture", "Apparel"];

function CategoryFilteredGrid() {
  const { setField } = useChallengeField();
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);

  const onSelect = async (value: string) => {
    setCategory(value);
    const res = await rawApiRequest(`/lab/products${value ? `?category=${value}` : ""}`);
    if (res.networkFailure) return;
    const data = (res.body as any)?.data ?? [];
    setProducts(data);
    setField("visibleProductCount", data.length);
  };

  return (
    <div className="space-y-3">
      <select data-testid="category-filter-select" className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" value={category} onChange={(e) => onSelect(e.target.value)}>
        <option value="">All categories</option>
        {CATEGORIES_FALLBACK.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <ul data-testid="filtered-product-grid" className="grid grid-cols-2 gap-2 text-sm text-slate-700">
        {products.map((p) => <li key={p.id} className="rounded-md border border-slate-200 px-3 py-2">{p.name}</li>)}
      </ul>
    </div>
  );
}

function DashboardWidgetStates() {
  const { setField } = useChallengeField();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "loaded">("idle");

  const load = async () => {
    setStatus("loading");
    const res = await rawApiRequest("/lab/failure/500");
    if (!res.networkFailure && res.ok) {
      setStatus("loaded");
      setField("widgetStatus", "loaded");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-sm space-y-3 rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-800">Revenue Widget</h3>
      {status === "idle" && <Button size="sm" data-testid="load-widget-btn" onClick={load}>Load</Button>}
      {status === "loading" && <p className="text-sm text-slate-500">{"Loading\u2026"}</p>}
      {status === "error" && <ErrorState title="Widget failed to load" detail="Please retry." onRetry={load} />}
      {status === "loaded" && <p className="text-2xl font-semibold text-emerald-700" data-testid="widget-content">$482,150</p>}
    </div>
  );
}
