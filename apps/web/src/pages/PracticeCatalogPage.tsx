import React, { useState } from "react";
import { Link } from "react-router-dom";
import { categories, getChildren } from "@qaplatform/shared";

const topLevel = getChildren(null);

export function PracticeCatalogPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = q ? categories.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Practice Catalog</h1>
        <p className="mt-1 text-sm text-slate-500">Browse every component practice category, or search across all of them.</p>
      </div>
      <input
        data-testid="catalog-search"
        placeholder="Search components, behaviors, categories\u2026"
        className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {matches ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((c) => (
            <li key={c.id}>
              <Link to={`/category/${c.slug}`} className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-300">
                <p className="text-sm font-medium text-slate-800">{c.title}</p>
                <p className="mt-1 text-xs text-slate-500">{c.description}</p>
              </Link>
            </li>
          ))}
          {matches.length === 0 && <p className="text-sm text-slate-500">No matches for "{query}".</p>}
        </ul>
      ) : (
        <div className="space-y-6">
          {topLevel.map((section) => {
            const children = getChildren(section.id);
            return (
              <div key={section.id}>
                <h2 className="text-sm font-semibold text-slate-700">{section.title}</h2>
                <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(children.length ? children : [section]).map((c) => (
                    <li key={c.id}>
                      <Link to={`/category/${c.slug}`} className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-300">
                        <p className="text-sm font-medium text-slate-800">{c.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{c.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
