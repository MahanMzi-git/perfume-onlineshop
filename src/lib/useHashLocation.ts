import { useEffect, useState } from 'react';

type Position = { x: number; y: number };
type HashLocation = { hash: string; restoredScroll?: Position };
const entryKey = 'aromaNavigationEntry';
let sequence = 0;
const positions = new Map<string, Position>();
let lastHomePosition: Position = { x: 0, y: 0 };
export function getLastHomePosition() { return lastHomePosition; }
function newEntry() { return Date.now().toString(36) + '-' + (++sequence); }

export function useHashLocation(): HashLocation {
  const [navigation, setNavigation] = useState<HashLocation>(() => ({ hash: location.hash }));
  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    let currentEntry = newEntry();
    let currentHash = location.hash;
    history.replaceState({ ...history.state, [entryKey]: currentEntry }, '');
    const save = () => {
      const position = { x: window.scrollX, y: window.scrollY };
      positions.set(currentEntry, position);
    };
    save();
    const onChange = () => {
      const targetEntry = history.state?.[entryKey] as string | undefined;
      if (targetEntry === currentEntry && location.hash === currentHash) return;
      if (!currentHash.startsWith('#/') && location.hash.startsWith('#/')) {
        lastHomePosition = positions.get(currentEntry) ?? { x: 0, y: 0 };
      }
      const restoredScroll = targetEntry && targetEntry !== currentEntry ? positions.get(targetEntry) : undefined;
      currentEntry = targetEntry && positions.has(targetEntry) ? targetEntry : newEntry();
      currentHash = location.hash;
      history.replaceState({ ...history.state, [entryKey]: currentEntry }, '');
      setNavigation({ hash: currentHash, restoredScroll });
    };
    window.addEventListener('scroll', save, { passive: true });
    window.addEventListener('popstate', onChange);
    window.addEventListener('hashchange', onChange);
    return () => {
      history.scrollRestoration = previousRestoration;
      window.removeEventListener('scroll', save);
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('hashchange', onChange);
    };
  }, []);
  return navigation;
}
