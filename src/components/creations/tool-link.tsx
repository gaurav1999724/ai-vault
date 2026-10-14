"use client";

export function ToolLink({ href, creationId, label }: { href: string; creationId: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      data-cursor="link"
      className="inline-flex items-center rounded-full border border-line px-4 py-2 text-sm"
      onClick={() => {
        void fetch("/api/analytics", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ type: "OUTBOUND_TOOL_CLICK", creationId }),
        });
      }}
    >
      Open {label}
    </a>
  );
}
