
'use client';

import { useEffect, useRef } from 'react';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Manages system push notifications for native platforms (Android/iOS).
 * Added extreme error handling to prevent native crashes even if google-services.json is missing.
 */

export function PushNotificationManager() {
  const { toast } = useToast();
  const isInitializing = useRef(false);

  useEffect(() => {
    // Only run on native platforms and prevent multiple initializations
    if (!Capacitor.isNativePlatform() || isInitializing.current) {
      return;
    }

    const initializePush = async () => {
      isInitializing.current = true;
      console.log('Push: Starting initialization...');
      
      try {
        // Step 1: Check current permissions
        let permStatus = await PushNotifications.checkPermissions();
        console.log('Push: Initial permission status:', permStatus.receive);

        if (permStatus.receive === 'granted') {
          await registerPush();
        } else if (permStatus.receive === 'prompt') {
          // Step 2: Request permissions if not asked yet
          permStatus = await PushNotifications.requestPermissions();
          console.log('Push: Permission requested. New status:', permStatus.receive);
          
          if (permStatus.receive === 'granted') {
            // CRITICAL: Delay registration after prompt to avoid native race-condition crash
            setTimeout(async () => {
              await registerPush();
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Push: Error in initializePush process', err);
      }
    };

    const registerPush = async () => {
      try {
        // Step 3: Remove old listeners to avoid memory leaks
        await PushNotifications.removeAllListeners();

        // Step 4: Add success listener
        await PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push: Device registered. Token:', token.value);
        });

        // Step 5: Add error listener (Handles missing google-services.json natively)
        await PushNotifications.addListener('registrationError', (error: any) => {
          console.warn('Push: Native registration error (Likely missing config file):', error);
        });

        // Step 6: Handle incoming notifications
        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          toast({
            title: notification.title || 'Ts Tour Alert',
            description: notification.body || 'নতুন মেসেজ এসেছে।',
            className: "bg-primary text-white border-none rounded-2xl shadow-2xl z-[9999]",
          });
        });

        // Step 7: Final Native Call - Wrapped in deep try-catch
        console.log('Push: Calling native register...');
        try {
          await PushNotifications.register();
          console.log('Push: Native register call completed.');
        } catch (regErr) {
          console.error('Push: CRITICAL Native call failed. Ensure google-services.json exists in android/app/', regErr);
        }
      } catch (err) {
        console.error('Push: Failed to setup listeners', err);
      }
    };

    // Delay start to not interfere with app hydration
    const timer = setTimeout(() => {
      initializePush();
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners().catch(() => {});
      }
    };
  }, [toast]);

  return null;
}
