import React, { useEffect, useState } from "react";
import { Badge, Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type CardEngineProps = { variant: string };

/** ONE engine component for the "Lists & Cards" category. */
export function CardEngine({ variant }: CardEngineProps) {
  switch (variant) {
    case "favorite-filter":
      return <FavoriteFilterCards />;
    case "card-menu-actions":
      return <CardMenuActions />;
    case "lazy-loaded-feed":
      return <LazyLoadedFeed />;
    default:
      return <p className="text-sm text-red-600">Unknown card variant: {variant}</p>;
  }
}

const PRODUCTS = [
  "Wireless Keyboard", "USB-C Hub", "27in Monitor", "Ergo Chair",
  "Standing Desk", "Webcam 4K", "Noise-Cancel Headset", "Docking Station",
  "Laptop Stand", "Mechanical Mouse", "Ring Light", "Cable Organizer",
];

function FavoriteFilterCards() {
  const { setField } = useChallengeField();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favOnly, setFavOnly] = useState(false);

  const visible = favOnly ? PRODUCTS.filter((p) => favorites.has(p)) : PRODUCTS;

  const toggleFav = (name: string) => {
    const next = new Set(favorites);
    next.has(name) ? next.delete(name) : next.add(name);
    setFavorites(next);
    setField("favoriteCount", next.size);
  };

  return (
    <div>
      <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" data-testid="favorites-only-toggle" checked={favOnly} onChange={(e) => setFavOnly(e.target.checked)} />
        Show favorites only
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visible.map((p) => (
          <div key={p} data-testid={`product-card-${p.replace(/\s/g, "-")}`} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-800">{p}</p>
              <button data-testid={`favorite-toggle-${p.replace(/\s/g, "-")}`} onClick={() => toggleFav(p)} aria-pressed={favorites.has(p)}>
                {favorites.has(p) ? "\u2665" : "\u2661"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ProjectCard = { id: string; title: string };

const INITIAL_PROJECT_CARDS: ProjectCard[] = [
  { id: "atlas", title: "Atlas Migration" },
  { id: "nebula", title: "Nebula Redesign" },
  { id: "orion", title: "Orion Rollout" },
  { id: "vega", title: "Vega Audit" },
];

function CardMenuActions() {
  const { setField } = useChallengeField();
  const [cards, setCards] = useState<ProjectCard[]>(INITIAL_PROJECT_CARDS);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  // Close the open menu on outside click, in addition to the three-dot toggle.
  useEffect(() => {
    if (!openMenu) return;
    const onDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`[data-menu-container="${CSS.escape(openMenu)}"]`)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, [openMenu]);

  const commit = (next: ProjectCard[]) => {
    setCards(next);
    setField("projectTitles", next.map((c) => c.title));
  };

  const duplicate = (card: ProjectCard) => {
    commit([...cards, { id: `${card.id}-copy-${Date.now()}`, title: `${card.title} (Copy)` }]);
    setOpenMenu(null);
  };

  const startEdit = (card: ProjectCard) => {
    setEditingId(card.id);
    setDraftName(card.title);
    setOpenMenu(null);
  };

  const saveEdit = (id: string) => {
    if (!draftName.trim()) return;
    commit(cards.map((c) => (c.id === id ? { ...c, title: draftName.trim() } : c)));
    setEditingId(null);
  };

  const remove = (id: string) => {
    commit(cards.filter((c) => c.id !== id));
    setOpenMenu(null);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div
          key={card.id}
          data-testid={`project-card-${card.title.replace(/[\s()]/g, "-")}`}
          data-menu-container={card.id}
          className="relative rounded-lg border border-slate-200 bg-white p-3"
        >
          <div className="flex items-center justify-between gap-2">
            {editingId === card.id ? (
              <input
                autoFocus
                data-testid="edit-name-input"
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(card.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
            ) : (
              <p className="text-sm font-medium text-slate-800">{card.title}</p>
            )}

            {editingId === card.id ? (
              <button data-testid="save-edit-btn" className="text-xs font-medium text-brand-600" onClick={() => saveEdit(card.id)}>
                Save
              </button>
            ) : (
              <button data-testid={`card-menu-${card.title.replace(/[\s()]/g, "-")}`} onClick={() => setOpenMenu(openMenu === card.id ? null : card.id)}>
                {"\u22ee"}
              </button>
            )}
          </div>
          {openMenu === card.id && (
            <div className="absolute right-2 top-8 z-10 w-32 rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg">
              <button data-testid="menu-edit" className="block w-full px-3 py-1.5 text-left hover:bg-slate-50" onClick={() => startEdit(card)}>
                Edit
              </button>
              <button data-testid="menu-duplicate" className="block w-full px-3 py-1.5 text-left hover:bg-slate-50" onClick={() => duplicate(card)}>
                Duplicate
              </button>
              <button data-testid="menu-delete" className="block w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50" onClick={() => remove(card.id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LazyLoadedFeed() {
  const { setField } = useChallengeField();
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const max = 50;

  useEffect(() => setField("cardCount", count), [count, setField]);

  const loadMore = () => {
    if (loading || count >= max) return;
    setLoading(true);
    window.setTimeout(() => {
      setCount((c) => Math.min(c + 10, max));
      setLoading(false);
    }, 400);
  };

  return (
    <div>
      <div data-testid="activity-feed" className="max-h-72 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-3" onScroll={(e) => {
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) loadMore();
      }}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} data-testid={`feed-card-${i}`} className="rounded border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
            Activity #{i + 1}
          </div>
        ))}
        {loading && <p className="text-center text-xs text-slate-400">{"Loading more\u2026"}</p>}
        {count >= max && <p data-testid="end-of-list" className="text-center text-xs text-slate-400">You're all caught up</p>}
      </div>
      <Button className="mt-2" size="sm" variant="secondary" data-testid="load-more-btn" onClick={loadMore} disabled={count >= max}>
        Load more (scroll simulation)
      </Button>
      <Badge tone="info">{count} / {max}</Badge>
    </div>
  );
}
