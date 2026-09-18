import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type TableEngineProps = { variant: string };

/** ONE engine component for the "Tables & Grids" category. */
export function TableEngine({ variant }: TableEngineProps) {
  switch (variant) {
    case "sort-filter":
      return <SortFilterTable />;
    case "pagination-selection":
      return <PaginationSelectionTable />;
    case "inline-edit-expandable":
      return <InlineEditExpandableTable />;
    default:
      return <p className="text-sm text-red-600">Unknown table variant: {variant}</p>;
  }
}

const DEPARTMENTS = ["Engineering", "Finance", "Sales", "Support"];
const EMPLOYEES = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Employee ${String.fromCharCode(65 + (i % 26))}${i}`,
  department: DEPARTMENTS[i % 4],
}));
// Force exactly 6 Engineering rows for a deterministic assertion.
const SEEDED_EMPLOYEES = EMPLOYEES.map((e, i) => (i < 6 ? { ...e, department: "Engineering" } : e));

function SortFilterTable() {
  const { setField } = useChallengeField();
  const [sortAsc, setSortAsc] = useState(false);
  const [dept, setDept] = useState("All");

  const rows = useMemo(() => {
    let list = [...SEEDED_EMPLOYEES];
    if (dept !== "All") list = list.filter((e) => e.department === dept);
    if (sortAsc) list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [sortAsc, dept]);

  useEffect(() => setField("visibleRowCount", rows.length), [rows, setField]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <select
          data-testid="department-filter"
          className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          <option>All</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <table className="w-full text-left text-sm" data-testid="employee-table">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="cursor-pointer py-2" data-testid="sort-name-header" onClick={() => setSortAsc((s) => !s)}>
              Name {sortAsc ? "\u2191" : ""}
            </th>
            <th className="py-2">Department</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} className="border-b border-slate-100">
              <td className="py-1.5">{e.name}</td>
              <td className="py-1.5">{e.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-400" data-testid="row-count">
        {rows.length} rows
      </p>
    </div>
  );
}

const ORDERS = Array.from({ length: 47 }, (_, i) => ({ id: `ORD-${1000 + i}`, total: (i + 1) * 12.5 }));
const PAGE_SIZE = 10;

function PaginationSelectionTable() {
  const { setField } = useChallengeField();
  const [page, setPage] = useState(1);
  const [jumpValue, setJumpValue] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const totalPages = Math.ceil(ORDERS.length / PAGE_SIZE);
  const pageRows = ORDERS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (target: number) => {
    setPage(Math.min(totalPages, Math.max(1, target)));
  };

  const jumpToPage = () => {
    const target = Number(jumpValue);
    if (Number.isInteger(target)) goToPage(target);
    setJumpValue("");
  };

  const toggleSelectAllOnPage = (checked: boolean) => {
    const next = new Set(selected);
    pageRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
    setSelected(next);
    setField("selectedCount", next.size);
  };

  return (
    <div>
      <table className="w-full text-left text-sm" data-testid="orders-table">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="w-8 py-2">
              <input
                type="checkbox"
                data-testid="select-all-on-page"
                checked={pageRows.every((r) => selected.has(r.id))}
                onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
              />
            </th>
            <th className="py-2">Order</th>
            <th className="py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((r) => (
            <tr key={r.id} className="border-b border-slate-100">
              <td className="py-1.5">
                <input
                  type="checkbox"
                  data-testid={`select-${r.id}`}
                  checked={selected.has(r.id)}
                  onChange={(e) => {
                    const next = new Set(selected);
                    e.target.checked ? next.add(r.id) : next.delete(r.id);
                    setSelected(next);
                    setField("selectedCount", next.size);
                  }}
                />
              </td>
              <td className="py-1.5 font-mono">{r.id}</td>
              <td className="py-1.5">${r.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <button
          data-testid="page-prev"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => goToPage(page - 1)}
          className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          {"\u2039 Prev"}
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            data-testid={`page-${p}`}
            onClick={() => goToPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={`rounded px-2 py-1 ${p === page ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {p}
          </button>
        ))}
        <button
          data-testid="page-next"
          aria-label="Next page"
          disabled={page === totalPages}
          onClick={() => goToPage(page + 1)}
          className="rounded px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          {"Next \u203a"}
        </button>

        <span className="ml-2 flex items-center gap-1.5 border-l border-slate-200 pl-3">
          <label htmlFor="jumpToPage" className="text-xs text-slate-500">Go to page</label>
          <input
            id="jumpToPage"
            type="number"
            min={1}
            max={totalPages}
            data-testid="jump-to-page-input"
            className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && jumpToPage()}
          />
          <button
            data-testid="jump-to-page-btn"
            onClick={jumpToPage}
            className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >
            Go
          </button>
        </span>

        <Badge tone="info">Selected: {selected.size}</Badge>
      </div>
    </div>
  );
}

const INVOICE_LINES = [
  { id: "INV-3301", lines: [{ id: "l1", item: "Consulting hours", qty: 3, unitPrice: 150, date: "2026-01-01" }] },
];

type InvoiceLine = { id: string; item: string; qty: number; unitPrice: number; date: string };
let lineIdCounter = 1;

function InlineEditExpandableTable() {
  const { setField } = useChallengeField();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lines, setLines] = useState<InvoiceLine[]>(INVOICE_LINES[0].lines);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [qtyDraft, setQtyDraft] = useState(0);

  const [newProduct, setNewProduct] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newDate, setNewDate] = useState("");
  const [formError, setFormError] = useState<string>();

  const total = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);

  useEffect(() => setField("invoiceTotal", total), [total, setField]);

  const startEditQty = (line: InvoiceLine) => {
    setEditingLineId(line.id);
    setQtyDraft(line.qty);
  };

  const commitQty = (lineId: string) => {
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, qty: qtyDraft } : l)));
    setEditingLineId(null);
    setField("lineQuantity", qtyDraft);
  };

  const removeLine = (lineId: string) => {
    setLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  const addLine = () => {
    const price = Number(newPrice);
    const qty = Number(newQty);
    if (!newProduct.trim() || !(price > 0) || !(qty > 0) || !newDate) {
      setFormError("Enter a product name, a price greater than 0, a quantity greater than 0, and a date.");
      return;
    }
    setFormError(undefined);
    const line: InvoiceLine = { id: `l${++lineIdCounter}`, item: newProduct.trim(), qty, unitPrice: price, date: newDate };
    setLines((prev) => [...prev, line]);
    setField("addedLineItemProduct", line.item);
    setField("addedLineItemPrice", line.unitPrice);
    setField("addedLineItemDate", line.date);
    setNewProduct("");
    setNewPrice("");
    setNewQty("1");
    setNewDate("");
  };

  return (
    <table className="w-full text-left text-sm" data-testid="invoice-table">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          <th className="py-2"> </th>
          <th className="py-2">Invoice</th>
        </tr>
      </thead>
      <tbody>
        {INVOICE_LINES.map((inv) => (
          <React.Fragment key={inv.id}>
            <tr className="border-b border-slate-100">
              <td className="py-1.5">
                <button
                  data-testid={`expand-${inv.id}`}
                  onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
                >
                  {expanded === inv.id ? "\u25be" : "\u25b8"}
                </button>
              </td>
              <td className="py-1.5 font-mono">{inv.id}</td>
            </tr>
            {expanded === inv.id && (
              <tr className="border-b border-slate-100 bg-slate-50">
                <td />
                <td className="py-3">
                  <table className="w-full max-w-xl text-left text-xs" data-testid={`invoice-lines-${inv.id}`}>
                    <thead>
                      <tr className="text-slate-500">
                        <th className="py-1">Product</th>
                        <th className="py-1">Date</th>
                        <th className="py-1">Qty</th>
                        <th className="py-1">Unit Price</th>
                        <th className="py-1">Line Total</th>
                        <th className="py-1" />
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr key={line.id} data-testid={`line-item-${inv.id}-${line.id}`} className="border-t border-slate-200">
                          <td className="py-1.5">{line.item}</td>
                          <td className="py-1.5">{line.date}</td>
                          <td className="py-1.5">
                            {editingLineId === line.id ? (
                              <input
                                autoFocus
                                type="number"
                                min={1}
                                data-testid="qty-input"
                                className="w-16 rounded border border-slate-300 px-1"
                                value={qtyDraft}
                                onChange={(e) => setQtyDraft(Number(e.target.value))}
                                onBlur={() => commitQty(line.id)}
                                onKeyDown={(e) => e.key === "Enter" && commitQty(line.id)}
                              />
                            ) : (
                              <span data-testid="qty-display" onClick={() => startEditQty(line)} className="cursor-text underline decoration-dotted">
                                {line.qty}
                              </span>
                            )}
                          </td>
                          <td className="py-1.5">${line.unitPrice.toFixed(2)}</td>
                          <td className="py-1.5 font-medium">${(line.qty * line.unitPrice).toFixed(2)}</td>
                          <td className="py-1.5">
                            <button
                              aria-label={`Remove ${line.item}`}
                              data-testid={`remove-line-${line.id}`}
                              onClick={() => removeLine(line.id)}
                              className="text-slate-400 hover:text-red-600"
                            >
                              {"\u2715"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-300 font-semibold">
                        <td colSpan={4} className="py-1.5 text-right">Invoice total</td>
                        <td className="py-1.5" data-testid="invoice-total">${total.toFixed(2)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>

                  <div className="mt-3 max-w-xl rounded-md border border-dashed border-slate-300 p-3">
                    <p className="mb-2 text-xs font-semibold text-slate-600">Add line item</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <input
                        data-testid="new-line-product"
                        placeholder="Product"
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                        value={newProduct}
                        onChange={(e) => setNewProduct(e.target.value)}
                      />
                      <input
                        data-testid="new-line-date"
                        type="date"
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                      <input
                        data-testid="new-line-qty"
                        type="number"
                        min={1}
                        placeholder="Qty"
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                        value={newQty}
                        onChange={(e) => setNewQty(e.target.value)}
                      />
                      <input
                        data-testid="new-line-price"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Unit price"
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                      />
                    </div>
                    {formError && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{formError}</p>}
                    <button
                      data-testid="add-line-item-btn"
                      onClick={addLine}
                      className="mt-2 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                    >
                      Add line item
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
