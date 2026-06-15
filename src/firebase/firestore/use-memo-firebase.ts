'use client';

import { useMemo, useRef } from 'react';

/**
 * A hook that memoizes a Firebase reference or query.
 * It uses a ref to keep track of the last dependencies to avoid unnecessary re-creations
 * which can lead to infinite loops in useCollection or useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  const lastDeps = useRef<any[]>(deps);
  const memoizedValue = useMemo(() => {
    lastDeps.current = deps;
    return factory();
  }, deps);

  return memoizedValue;
}
