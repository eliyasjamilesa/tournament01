
'use client';

import { useEffect, useRef } from 'react';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Manages system push notifications for native platforms (Android/iOS).
 * Added extreme error handling and sequenced initialization to prevent native crashes.
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
          await registerPushSequence();
        } else if (permStatus.receive === 'prompt') {
          // Step 2: Request permissions
          permStatus = await PushNotifications.requestPermissions();
          console.log('Push: Permission requested. New status:', permStatus.receive);
          
          if (permStatus.receive === 'granted') {
            // CRITICAL: Delay registration after prompt to avoid native race-condition crash
            setTimeout(async () => {
              await registerPushSequence();
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Push: Error in initializePush process', err);
      }
    };

    const registerPushSequence = async () => {
      try {
        // Step 3: Remove old listeners to avoid memory leaks or duplicate triggers
        try {
          await PushNotifications.removeAllListeners();
        } catch (e) {
          console.warn('Push: Failed to remove listeners', e);
        }

        // Step 4: Add success listener
        await PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push: Device registered successfully. Token length:', token.value.length);
        });

        // Step 5: Add error listener
        await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Push: Registration error event triggered:', JSON.stringify(error));
        });

        // Step 6: Handle incoming notifications
        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push: Notification received:', notification.title);
          toast({
            title: notification.title || 'Ts Tour Alert',
            description: notification.body || 'নতুন মেসেজ এসেছে।',
            className: "bg-primary text-white border-none rounded-2xl shadow-2xl z-[9999]",
          });
        });

        // Step 7: Final Native Call - Wrapped in deep try-catch to prevent "kick out" (crash)
        console.log('Push: Calling native register method...');
        try {
          await PushNotifications.register();
          console.log('Push: Native register call sent to OS.');
        } catch (regErr) {
          console.error('Push: CRITICAL Native register() failed. This usually means google-services.json is missing or corrupted inside the APK.', regErr);
        }
      } catch (err) {
        console.error('Push: High-level sequence failed', err);
      }
    };

    // Wait 7 seconds before initializing push to let the app fully mount and splash screen fade
    const timer = setTimeout(() => {
      initializePush();
    }, 7000);

    return () => {
      clearTimeout(timer);
      if (Capacitor.isNativePlatform()) {
        try {
           PushNotifications.removeAllListeners().catch(() => {});
        } catch (e) {}
      }
    };
  }, [toast]);

  return null;
}
