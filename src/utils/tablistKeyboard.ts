import type { KeyboardEvent } from 'react';

/**
 * Handles WAI-ARIA roving-tabindex keyboard navigation (Arrow keys, Home, End)
 * for horizontal tablists and updates focus to the newly activated tab.
 */
export function handleTabListKeyDown<T extends string>(
  e: KeyboardEvent,
  keys: readonly T[],
  currentKey: T,
  onSelect: (nextKey: T) => void,
  idPrefix: string
): void {
  const currentIndex = keys.indexOf(currentKey);
  if (currentIndex < 0 || keys.length === 0) return;

  let nextIndex: number | null = null;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    nextIndex = (currentIndex + 1) % keys.length;
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + keys.length) % keys.length;
  } else if (e.key === 'Home') {
    nextIndex = 0;
  } else if (e.key === 'End') {
    nextIndex = keys.length - 1;
  }

  if (nextIndex === null) return;

  e.preventDefault();
  const nextKey = keys[nextIndex];
  onSelect(nextKey);
  window.requestAnimationFrame(() => {
    document.getElementById(`${idPrefix}-tab-${nextKey}`)?.focus();
  });
}
