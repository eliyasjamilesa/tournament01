
'use client';

import { useEffect } from 'react';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Manages system push notifications for native platforms (Android/iOS).
 * This requires a 'google-services.json' file in the android/app directory to function on APK.
 */

export function PushNotificationManager() {
  const { toast } = useToast();

  useEffect(() => {
    // Only run on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      console.log('Push Notifications: Native platform not detected, skipping registration.');
      return;
    }

    const initializePush = async () => {
      try {
        // Check/Request permissions
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn('Push Notifications: Permission denied by user.');
          return;
        }

        // Register with Google/Apple push services
        await PushNotifications.register();

        // Listen for successful registration
        PushNotifications.addListener('registration', (token: Token) => {
          console.log('Push Notifications: Registration success. Device Token:', token.value);
          // In a production app, you would save this token to your Firestore user profile
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Push Notifications: Registration error:', JSON.stringify(error));
        });

        // Show a toast if a notification is received while the app is open
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          toast({
            title: notification.title || 'Elite Alert',
            description: notification.body || '',
            className: "bg-primary text-white border-none rounded-2xl shadow-2xl",
          });
        });

        // Handle tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
          console.log('Push Notifications: Action performed:', action.notification.data);
        });
      } catch (err) {
        console.error('Push Notifications: Initialization failed.', err);
      }
    };

    initializePush();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [toast]);

  return null;
}
