
'use client';

import { useEffect } from 'react';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Manages system push notifications for native platforms (Android/iOS).
 * Added robust error handling to prevent "App keeps stopping" crashes on grant.
 */

export function PushNotificationManager() {
  const { toast } = useToast();

  useEffect(() => {
    // Only run on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const initializePush = async () => {
      try {
        // Check current permission status
        let permStatus = await PushNotifications.checkPermissions();

        // If permission is not granted yet, we wait. We don't force request here 
        // to avoid conflicts with early app lifecycle.
        if (permStatus.receive === 'granted') {
          await registerPush();
        } else if (permStatus.receive === 'prompt') {
          // Request permissions
          permStatus = await PushNotifications.requestPermissions();
          if (permStatus.receive === 'granted') {
            // Small delay to ensure OS has registered the permission change
            setTimeout(async () => {
              await registerPush();
            }, 1000);
          }
        }
      } catch (err) {
        console.error('Push: Permission check failed', err);
      }
    };

    const registerPush = async () => {
      try {
        // IMPORTANT: Remove existing listeners to avoid duplicates
        await PushNotifications.removeAllListeners();

        // Add listeners BEFORE registering
        await PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push: Registration success. Token:', token.value);
        });

        await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Push: Registration error:', JSON.stringify(error));
        });

        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          toast({
            title: notification.title || 'Elite Alert',
            description: notification.body || '',
            className: "bg-primary text-white border-none rounded-2xl shadow-2xl",
          });
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
          console.log('Push: Action performed:', action.notification.data);
        });

        // Finally, register. Wrapping in its own try-catch to prevent app crash.
        try {
          await PushNotifications.register();
        } catch (regErr) {
          console.error('Push: Native register call failed', regErr);
        }
      } catch (err) {
        console.error('Push: Listener setup failed', err);
      }
    };

    // Initialize after a short delay to ensure app is stable
    const timer = setTimeout(() => {
      initializePush();
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners().catch(() => {});
      }
    };
  }, [toast]);

  return null;
}
