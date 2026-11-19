"use client";

import { useSyncExternalStore } from "react";

/**
 * Current theme ("light" | "dark"), kept in sync with the `data-theme`
 * attribute on <html>. Anything that changes that attribute (the toggle,
 * the startup script) automatically re-renders components using this hook.
 *
 * Charts need this because SVG colors can't read our CSS variables directly.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getSnapshot(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function useTheme(): "light" | "dark" {
  // The server can't know the reader's theme, so it renders "light";
  // React then re-renders with the real value right after hydration.
  return useSyncExternalStore(subscribe, getSnapshot, () => "light" as const);
}
