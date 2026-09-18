import React, { useState } from "react";
import { Badge, Card, CardBody } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type DragDropEngineProps = { variant: string };

/** ONE engine component for the "Drag & Drop" category. */
export function DragDropEngine({ variant }: DragDropEngineProps) {
  switch (variant) {
    case "html5-file-dropzone":
      return <Html5FileDropzone />;
    case "sortable-list":
      return <SortableList />;
    case "exact-dropzone-validation":
      return <ExactDropzoneValidation />;
    default:
      return <p className="text-sm text-red-600">Unknown drag-drop variant: {variant}</p>;
  }
}

function Html5FileDropzone() {
  const { setField } = useChallengeField();
  const [files, setFiles] = useState<string[]>([]);
  const [over, setOver] = useState(false);

  return (
    <div className="flex items-start gap-6">
      <div
        draggable
        data-testid="invoice-file-card"
        onDragStart={(e) => e.dataTransfer.setData("text/plain", "invoice.pdf")}
        className="cursor-grab rounded-md border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm"
      >
        {"\u{1F4C4} invoice.pdf"}
      </div>
      <div
        data-testid="dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          const name = e.dataTransfer.getData("text/plain");
          if (name) {
            const next = [...files, name];
            setFiles(next);
            setField("attachedFiles", next);
          }
          setOver(false);
        }}
        className={`flex h-28 w-56 flex-col items-center justify-center rounded-md border-2 border-dashed text-sm ${
          over ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50"
        }`}
      >
        {files.length === 0 ? (
          <span className="text-slate-400">Drop files here</span>
        ) : (
          <ul>{files.map((f) => <li key={f}>{f}</li>)}</ul>
        )}
      </div>
    </div>
  );
}

const INITIAL_BACKLOG = ["Design", "Build", "Test", "Ship"];

function SortableList() {
  const { setField } = useChallengeField();
  const [items, setItems] = useState(INITIAL_BACKLOG);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const commit = (next: string[]) => {
    setItems(next);
    setField("backlogOrder", next);
  };

  return (
    <ul className="w-64 space-y-1" data-testid="sortable-backlog">
      {items.map((item, index) => (
        <li
          key={item}
          draggable
          data-testid={`backlog-item-${item}`}
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIndex === null || dragIndex === index) return;
            const next = [...items];
            const [moved] = next.splice(dragIndex, 1);
            next.splice(index, 0, moved);
            commit(next);
            setDragIndex(null);
          }}
          className="cursor-grab rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

const ZONES = [
  { id: "Container A", label: "Container A (Frozen)", accepts: "Frozen" },
  { id: "Container B", label: "Container B (Chilled)", accepts: "Chilled" },
  { id: "Container C", label: "Container C (Ambient)", accepts: "Ambient" },
];

function ExactDropzoneValidation() {
  const { setField } = useChallengeField();
  const [assignment, setAssignment] = useState<string>("");

  const onDrop = (zone: (typeof ZONES)[number]) => {
    if (zone.accepts === "Frozen") {
      setAssignment(zone.id);
      setField("crateAssignment", zone.id);
    }
    // Wrong-zone drops are silently rejected (snap-back) — no state change.
  };

  return (
    <div className="space-y-4">
      <div
        draggable
        data-testid="frozen-salmon-crate"
        onDragStart={(e) => e.dataTransfer.setData("text/plain", "frozen-salmon")}
        className="inline-block cursor-grab rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm"
      >
        {"\u2744\ufe0f Frozen Salmon"}
      </div>
      <div className="flex gap-4">
        {ZONES.map((zone) => (
          <div
            key={zone.id}
            data-testid={`zone-${zone.id.replace(/\s/g, "-")}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(zone)}
            className="flex h-24 w-40 items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-center text-xs text-slate-500"
          >
            {zone.label}
            {assignment === zone.id && <Badge tone="success">Assigned</Badge>}
          </div>
        ))}
      </div>
    </div>
  );
}
