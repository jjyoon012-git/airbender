import webpush from "web-push";
import type { NotificationToken, InsertNotificationHistory } from "@shared/schema";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error("VAPID keys are not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.");
}

webpush.setVapidDetails(
  "mailto:noreply@airbender.app",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: any;
}

export interface PushResult {
  subscription: NotificationToken;
  success: boolean;
  error?: string;
  errorType?: "expired" | "transient" | "unknown";
}

export class PushService {
  async sendNotification(
    subscription: NotificationToken,
    payload: PushNotificationPayload
  ): Promise<PushResult> {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.auth,
          p256dh: subscription.p256dh,
        },
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );

      return { subscription, success: true };
    } catch (error: any) {
      console.error("Push notification error:", error);
      
      if (error.statusCode === 410 || error.statusCode === 404) {
        return {
          subscription,
          success: false,
          error: error.message || "Subscription expired",
          errorType: "expired"
        };
      }

      if (error.statusCode === 429 || error.statusCode === 500 || error.statusCode === 502 || error.statusCode === 503) {
        return {
          subscription,
          success: false,
          error: error.message || "Transient error",
          errorType: "transient"
        };
      }

      return {
        subscription,
        success: false,
        error: error.message || "Unknown error",
        errorType: "unknown"
      };
    }
  }

  async sendBulkNotifications(
    subscriptions: NotificationToken[],
    payload: PushNotificationPayload
  ): Promise<{
    results: PushResult[];
    successful: number;
    failed: number;
    expired: string[];
  }> {
    const results = await Promise.all(
      subscriptions.map((sub) => this.sendNotification(sub, payload))
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const expired = results
      .filter((r) => !r.success && r.errorType === "expired")
      .map((r) => r.subscription.endpoint);

    return { results, successful, failed, expired };
  }

  getPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }
}

export const pushService = new PushService();
