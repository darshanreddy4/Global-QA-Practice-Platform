import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories, challengeRegistry } from "@qaplatform/shared";
import { DifficultyBadge } from "../../design-system";

type SearchHit =
  | { type: "challenge"; id: string; title: string; subtitle: string; to: string }
  | { type: "category"; id: string; title: string; subtitle: string; to: string };

/**
 * Global search (spec §70 Search & Discovery): find a challenge/category by
 * title, id, difficulty, or framework tag directly from the app header —
 * the real-world "I know roughly what I'm looking for, let me just search"
 * workflow instead of hunting through the sidebar tree.
 */
export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const challengeHits: SearchHit[] = challengeRegistry
      .filter(
        (c) =>
          c.isActive &&
          (c.title.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.difficulty.toLowerCase().includes(q) ||
            c.frameworks.some((f) => f.toLowerCase().includes(q)))
      )
      .slice(0, 6)
      .map((c) => ({
        type: "challenge" as const,
        id: c.id,
        title: c.title,
        subtitle: `${c.id} \u00b7 ${c.difficulty}`,
        to: `/challenge/${c.id}`,
      }));

    const categoryHits: SearchHit[] = categories
      .filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({
        type: "category" as const,
        id: c.id,
        title: c.title,
        subtitle: c.status === "planned" ? `Planned \u2014 Phase ${c.phase}` : "Category",
        to: `/category/${c.slug}`,
      }));

    return [...challengeHits, ...categoryHits];
  }, [query]);

  const go = (to: string) => {
    navigate(to);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-72">
      <input
        ref={inputRef}
        data-testid="global-search-input"
        placeholder="Search challenges, categories, frameworks\u2026"
        className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && hits[0]) go(hits[0].to);
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && query.trim().length >= 2 && (
        <ul data-testid="global-search-results" className="absolute z-20 mt-1 max-h-80 w-96 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg">
          {hits.length === 0 && <li className="px-3 py-2 text-slate-400">No matches for "{query}"</li>}
          {hits.map((hit) => (
            <li key={`${hit.type}-${hit.id}`}>
              <button
                data-testid={`search-result-${hit.id}`}
                onClick={() => go(hit.to)}
                className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-brand-50"
              >
                <span>
                  <span className="block text-slate-800">{hit.title}</span>
                  <span className="block text-xs text-slate-400">{hit.subtitle}</span>
                </span>
                {hit.type === "challenge" && (
                  <DifficultyBadge difficulty={challengeRegistry.find((c) => c.id === hit.id)!.difficulty} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
