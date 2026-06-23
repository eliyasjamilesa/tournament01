
'use client';

import { useEffect } from 'react';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Manages system push notifications for native platforms (Android/iOS).
 * Added robust error handling to prevent crashes when google-services.json is missing.
 */

export function PushNotificationManager() {
  const { toast } = useToast();

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const initializePush = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'granted') {
          await registerPush();
        } else if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
          if (permStatus.receive === 'granted') {
            // Delay slightly to ensure system is ready
            setTimeout(async () => {
              await registerPush();
            }, 1000);
          }
        }
      } catch (err) {
        console.warn('Push: Permission request failed', err);
      }
    };

    const registerPush = async () => {
      try {
        // Clean up previous listeners
        await PushNotifications.removeAllListeners();

        // Listen for successful registration
        await PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push registration success:', token.value);
        });

        // Handle registration error (Commonly caused by missing google-services.json)
        await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Push registration error:', error);
        });

        // Handle incoming notifications while app is open
        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          toast({
            title: notification.title || 'Elite Alert',
            description: notification.body || '',
            className: "bg-primary text-white border-none rounded-2xl shadow-2xl",
          });
        });

        // The core fix: wrap register() in a try-catch to prevent a native crash
        // if the Firebase configuration file is missing.
        try {
          await PushNotifications.register();
        } catch (regErr) {
          console.error('Native Push Register call failed. Check if google-services.json is present in android/app/', regErr);
        }
      } catch (err) {
        console.error('Push Listener setup failed', err);
      }
    };

    // Initial trigger with a delay to not block app startup
    const timer = setTimeout(() => {
      initializePush();
    }, 4000);

    return () => {
      clearTimeout(timer);
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners().catch(() => {});
      }
    };
  }, [toast]);

  return null;
}
