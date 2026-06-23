
'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRouter, usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

/**
 * @fileOverview Handles hardware back button on Android devices for Capacitor apps.
 * This component prevents the app from exiting when the back button is pressed
 * on a subpage, and instead navigates back in the browser history.
 */

export function NavigationHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const setupListener = async () => {
      // Remove any existing listeners first to avoid duplicates
      await App.removeAllListeners();

      await App.addListener('backButton', ({ canGoBack }) => {
        // Core pages where the back button should exit the app
        const rootPages = ['/', '/login', '/signup'];
        
        if (rootPages.includes(pathname)) {
          // If on a root page, exit the app
          App.exitApp();
        } else if (canGoBack) {
          // If browser history exists, go back
          window.history.back();
        } else {
          // Fallback to router.back() or redirect to home if stuck
          router.push('/');
        }
      });
    };

    setupListener();

    return () => {
      if (Capacitor.isNativePlatform()) {
        App.removeAllListeners();
      }
    };
  }, [pathname, router]);

  return null;
}
