"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("acv-favorites", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("acv-favorites", callback);
  };
}

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem("acv-favorites") || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function useFavoriteSlugs() {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem("acv-favorites") || "[]", () => "[]");
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function writeFavorites(slugs: string[]) {
  localStorage.setItem("acv-favorites", JSON.stringify(slugs));
  window.dispatchEvent(new Event("acv-favorites"));
}

export function readFavorites() {
  return read();
}
