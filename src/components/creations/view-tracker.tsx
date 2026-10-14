"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ creationId, tutorialId }: { creationId?: string; tutorialId?: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const payload = creationId
      ? { type: "CREATION_VIEW", creationId }
      : { type: "TUTORIAL_VIEW", tutorialId };
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  }, [creationId, tutorialId]);
  return null;
}
