
'use client';

import { useEffect, useState } from 'react';
import {
  Query,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    // Reset state when query changes to prevent showing stale data
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        setData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as T)));
        setLoading(false);
        setError(null);
      },
      async (serverError: any) => {
        // Attempt to extract path for better error reporting
        let path = 'unknown';
        try {
          // @ts-ignore - Accessing internal path for debugging context
          path = query._query?.path?.toString() || 'collection';
        } catch (e) {
          path = 'collection';
        }

        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        } satisfies SecurityRuleContext);

        // Only emit and show toast if it's actually a permission error
        if (serverError.code === 'permission-denied') {
          errorEmitter.emit('permission-error', permissionError);
        } else {
          console.warn("Firestore collection error:", serverError);
        }
        
        setError(serverError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
