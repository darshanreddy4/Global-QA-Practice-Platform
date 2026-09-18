import React, { useEffect, useRef, useState } from "react";
import { Badge, Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type FileUploadEngineProps = { variant: string };

/** ONE engine component for the "File Upload" category. */
export function FileUploadEngine({ variant }: FileUploadEngineProps) {
  switch (variant) {
    case "single-with-validation":
      return <SingleWithValidation />;
    case "multi-dragdrop-progress":
      return <MultiDragDropProgress />;
    case "required-remove-replace":
      return <RequiredRemoveReplace />;
    default:
      return <p className="text-sm text-red-600">Unknown file-upload variant: {variant}</p>;
  }
}

const ACCEPTED = [".pdf", ".jpg", ".png"];
const MAX_BYTES = 2 * 1024 * 1024;

function SingleWithValidation() {
  const { setField } = useChallengeField();
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string>();

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const validExt = ACCEPTED.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!validExt || file.size > MAX_BYTES) {
      setError("Unsupported file type or size exceeds 2MB");
      setFileName("");
      return;
    }
    setError(undefined);
    setFileName(file.name);
    setField("uploadedFileName", file.name);
  };

  return (
    <div className="max-w-sm space-y-2">
      <label htmlFor="idDocument" className="block text-sm font-medium text-slate-700">ID document (.pdf, .jpg, .png — max 2MB)</label>
      <input id="idDocument" type="file" data-testid="id-document-input" accept={ACCEPTED.join(",")} onChange={(e) => onFile(e.target.files?.[0])} className="text-sm" />
      {error && <p role="alert" className="text-xs font-medium text-red-600">{error}</p>}
      {fileName && <Badge tone="success">{fileName}</Badge>}
    </div>
  );
}

type UploadItem = { id: number; name: string; progress: number };
let uploadSeq = 0;

function MultiDragDropProgress() {
  const { setField } = useChallengeField();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [over, setOver] = useState(false);

  useEffect(() => setField("uploadedCount", items.filter((i) => i.progress >= 100).length), [items, setField]);

  const addFiles = (files: FileList | File[]) => {
    Array.from(files)
      .slice(0, 3)
      .forEach((file) => {
        const id = ++uploadSeq;
        setItems((prev) => [...prev, { id, name: file.name, progress: 0 }]);
        const start = Date.now();
        const tick = () => {
          const pct = Math.min(100, ((Date.now() - start) / 1000) * 100);
          setItems((prev) => prev.map((i) => (i.id === id ? { ...i, progress: pct } : i)));
          if (pct < 100) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
  };

  return (
    <div className="max-w-sm">
      <div
        data-testid="multi-upload-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex h-24 items-center justify-center rounded-md border-2 border-dashed text-sm ${over ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50 text-slate-400"}`}
      >
        Drop up to 3 files here
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i.id} data-testid={`upload-item-${i.name}`} className="text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{i.name}</span>
              <span>{i.progress >= 100 ? "Uploaded" : `${Math.round(i.progress)}%`}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200">
              <div className="h-1.5 rounded-full bg-brand-500 transition-all" style={{ width: `${i.progress}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RequiredRemoveReplace() {
  const { setField } = useChallengeField();
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setField("resumeAttached", fileName !== ""), [fileName, setField]);

  return (
    <div className="max-w-sm space-y-2">
      <label className="block text-sm font-medium text-slate-700">Resume (required)</label>
      {fileName ? (
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
          <span data-testid="resume-filename">{fileName}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" data-testid="replace-resume-btn" onClick={() => inputRef.current?.click()}>Replace</Button>
            <Button size="sm" variant="ghost" data-testid="remove-resume-btn" onClick={() => setFileName("")}>Remove</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="secondary" data-testid="choose-resume-btn" onClick={() => inputRef.current?.click()}>Choose file</Button>
      )}
      <input
        ref={inputRef}
        type="file"
        data-testid="resume-input"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && setFileName(e.target.files[0].name)}
      />
      <Button size="sm" disabled={!fileName} data-testid="submit-resume-btn">Submit application</Button>
    </div>
  );
}
