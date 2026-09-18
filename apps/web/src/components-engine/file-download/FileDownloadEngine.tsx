import React, { useState } from "react";
import { Badge, Button } from "../../design-system";
import { useChallengeField } from "../../features/challenge-runner/ChallengeRunner";

export type FileDownloadEngineProps = { variant: string };

/** ONE engine component for the "File Download" category. */
export function FileDownloadEngine({ variant }: FileDownloadEngineProps) {
  switch (variant) {
    case "dynamic-filename-report":
      return <DynamicFilenameReport />;
    case "csv-export":
      return <CsvExport />;
    default:
      return <p className="text-sm text-red-600">Unknown file-download variant: {variant}</p>;
  }
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function triggerDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function DynamicFilenameReport() {
  const { setField } = useChallengeField();
  const [state, setState] = useState<"idle" | "generating" | "ready">("idle");
  const [fileName, setFileName] = useState("");

  const generate = () => {
    setState("generating");
    window.setTimeout(() => {
      const now = new Date();
      const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
      const name = `sales-report-${stamp}.csv`;
      setFileName(name);
      setState("ready");
    }, 600);
  };

  return (
    <div className="space-y-2">
      <Button size="sm" data-testid="generate-report-download-btn" loading={state === "generating"} onClick={generate}>
        Generate Report
      </Button>
      {state === "ready" && (
        <div>
          <a
            data-testid="download-report-link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              triggerDownload(fileName, "date,amount\n2026-09-01,1250.00\n");
              setField("downloadedFileName", fileName);
            }}
            className="text-sm text-brand-600 hover:underline"
          >
            Download {fileName}
          </a>
        </div>
      )}
    </div>
  );
}

const ENGINEERING_ROWS = [
  { name: "Employee A0", department: "Engineering" },
  { name: "Employee A4", department: "Engineering" },
  { name: "Employee A8", department: "Engineering" },
  { name: "Employee A12", department: "Engineering" },
  { name: "Employee A16", department: "Engineering" },
  { name: "Employee A20", department: "Engineering" },
];

function CsvExport() {
  const { setField } = useChallengeField();
  const [exported, setExported] = useState(false);

  const exportCsv = () => {
    const csv = ["name,department", ...ENGINEERING_ROWS.map((r) => `${r.name},${r.department}`)].join("\n");
    triggerDownload("engineering-employees.csv", csv);
    setExported(true);
    setField("exportedRowCount", ENGINEERING_ROWS.length);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-500">Filter: Department = Engineering ({ENGINEERING_ROWS.length} rows)</p>
      <Button size="sm" data-testid="export-csv-btn" onClick={exportCsv}>Export filtered rows to CSV</Button>
      {exported && <Badge tone="success">Exported {ENGINEERING_ROWS.length} rows</Badge>}
    </div>
  );
}
