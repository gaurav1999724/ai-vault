"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ImportResult = {
  row: number;
  title: string;
  ok: boolean;
  message: string;
  id?: string;
  slug?: string;
};

export function CreationImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState<ImportResult[]>([]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose an Excel file.");
      return;
    }
    setPending(true);
    setError("");
    setSummary("");
    setResults([]);
    const data = new FormData();
    data.set("file", file);
    try {
      const response = await fetch("/api/admin/creations/import", { method: "POST", body: data });
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        created?: number;
        failed?: number;
        results?: ImportResult[];
      };
      if (body.results?.length) {
        setResults(body.results);
        setSummary(`${body.created || 0} created. ${body.failed || 0} need a correction.`);
      }
      if (!response.ok && !body.results?.length) {
        setError(body.message || "The workbook was not imported. Stay signed in and try again.");
      }
    } catch {
      setError("The workbook was not imported. Stay signed in and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4 rounded-2xl border border-line p-4 md:p-6" onSubmit={onSubmit}>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="ghost">
          <a href="/api/admin/creations/template">Download Excel template</a>
        </Button>
      </div>
      <label className="block text-sm">
        <span className="mb-2 block text-muted">Filled workbook</span>
        <input
          className="block w-full text-sm"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            setError("");
          }}
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Importing…" : "Import creations"}
      </Button>
      {error ? <p className="text-sm text-warm">{error}</p> : null}
      {summary ? <p className="text-sm text-cyan">{summary}</p> : null}
      {results.length ? (
        <ul className="space-y-3 text-sm">
          {results.map((result) => (
            <li key={`${result.row}-${result.title}-${result.ok}-${result.message}`} className={result.ok ? "text-ink" : "text-warm"}>
              <span className="text-muted">{result.row ? `Row ${result.row}` : "File"} · </span>
              {result.title}
              {result.message ? ` — ${result.message}` : ""}
              {result.id ? (
                <>
                  {" "}
                  <Link className="text-cyan" href={`/admin/creations/${result.id}/edit`}>
                    Edit
                  </Link>
                </>
              ) : null}
              {result.ok && result.slug ? (
                <>
                  {" "}
                  <Link className="text-cyan" href={`/creations/${result.slug}`}>
                    View
                  </Link>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
