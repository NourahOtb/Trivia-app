import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/** Maps a key (as in KeyboardEvent.key, lower-case) to an action. */
export type ShortcutMap = Record<string, () => void>;

/**
 * Keyboard shortcuts for the website version. Does nothing on phones.
 * Ignores keys typed into text fields and keys held with Ctrl/Cmd/Alt.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled || typeof window === 'undefined') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const action = shortcutsRef.current[event.key.toLowerCase()];
      if (action) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
