/**
 * Placeholder for a notification service.
 * In a real application, this would integrate with a push notification service
 * like Firebase Cloud Messaging, OneSignal, etc.
 */

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

class NotificationService {
  /**
   * Simulates sending a notification.
   * @param token A device token or user identifier.
   * @param payload The content of the notification.
   */
  async sendNotification(
    token: string,
    payload: NotificationPayload
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`--- Sending Notification ---`);
    console.log(`To: ${token}`);
    console.log(`Title: ${payload.title}`);
    console.log(`Body: ${payload.body}`);
    console.log(`Data: ${JSON.stringify(payload.data)}`);
    console.log(`--------------------------`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate a successful response
    if (Math.random() > 0.1) { // 90% success rate
      const messageId = `mock-message-${Date.now()}`;
      console.log(`✅ Notification sent successfully. Message ID: ${messageId}`);
      return { success: true, messageId };
    } else {
      const error = "Failed to connect to mock notification server.";
      console.error(`❌ Notification failed: ${error}`);
      return { success: false, error };
    }
  }
}

// Singleton implementation
let instance: NotificationService | null = null;

export function getNotificationServiceInstance(): NotificationService {
  if (!instance) {
    instance = new NotificationService();
  }
  return instance;
}
