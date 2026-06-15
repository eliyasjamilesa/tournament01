'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In production, you might want to log this to a service
      // In development, this will help trigger the Next.js error overlay with context
      toast({
        variant: 'destructive',
        title: 'Security Permission Denied',
        description: 'You do not have permission to perform this action.',
      });
      
      // Throwing so it's visible in dev tools/overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
