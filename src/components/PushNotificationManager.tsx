
'use client';

import { useEffect } from 'react';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Manages system push notifications for native platforms (Android/iOS).
 * Robust error handling added to prevent crashes when google-services.json is missing.
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
            setTimeout(async () => {
              await registerPush();
            }, 1000);
          }
        }
      } catch (err) {
        console.warn('Push: Permission request skipped or failed', err);
      }
    };

    const registerPush = async () => {
      try {
        await PushNotifications.removeAllListeners();

        await PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push registration success:', token.value);
        });

        await PushNotifications.addListener('registrationError', (error: any) => {
          // This happens if Firebase is not properly configured in the native project
          console.error('Push registration error:', error);
        });

        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          toast({
            title: notification.title || 'Elite Alert',
            description: notification.body || '',
            className: "bg-primary text-white border-none rounded-2xl shadow-2xl",
          });
        });

        // The core fix: try-catch around register() to prevent native crash
        try {
          await PushNotifications.register();
        } catch (regErr) {
          console.error('Native Push Register failed. Likely missing google-services.json', regErr);
        }
      } catch (err) {
        console.error('Push Listener setup failed', err);
      }
    };

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
