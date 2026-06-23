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
        console.log('Push: Initializing...');
        // Check current permission status
        let permStatus = await PushNotifications.checkPermissions();

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
          } else {
            console.log('Push: User denied permission');
          }
        }
      } catch (err) {
        console.error('Push: Permission check/request failed', err);
      }
    };

    const registerPush = async () => {
      try {
        console.log('Push: Registering listeners...');
        // IMPORTANT: Remove existing listeners to avoid duplicates
        await PushNotifications.removeAllListeners();

        // Add listeners BEFORE registering
        await PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push: Registration success. Token:', token.value);
        });

        await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Push: Registration error reported by OS:', JSON.stringify(error));
        });

        await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push: Received', notification);
          toast({
            title: notification.title || 'Elite Alert',
            description: notification.body || '',
            className: "bg-primary text-white border-none rounded-2xl shadow-2xl",
          });
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
          console.log('Push: Action performed:', action.notification.data);
        });

        // Finally, register. 
        // This is where it often crashes if google-services.json is missing.
        console.log('Push: Calling native register()...');
        try {
          await PushNotifications.register();
          console.log('Push: Native register() called successfully');
        } catch (regErr) {
          console.error('Push: Native register() call failed. This usually happens if google-services.json is missing in android/app/', regErr);
        }
      } catch (err) {
        console.error('Push: Listener setup failed', err);
      }
    };

    // Initialize after a short delay to ensure app is stable
    const timer = setTimeout(() => {
      initializePush();
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners().catch(() => {});
      }
    };
  }, [toast]);

  return null;
}
