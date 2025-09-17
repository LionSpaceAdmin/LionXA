"use server";

import { analyzeAgentPerformance, AIPoweredOptimizationInput, AIPoweredOptimizationOutput } from "@/ai/flows/ai-powered-optimization";
import { z } from "zod";
import { getAgentManagerInstance } from "@/lib/agent-manager";
import { getNotificationServiceInstance } from "@/lib/notification-service";

const formSchema = z.object({
  responseRate: z.number().min(0).max(100),
  errorRate: z.number().min(0).max(100),
  avgResponseTime: z.number().min(0),
  dailyCost: z.number().min(0),
  engagementRate: z.number().min(0).max(100),
  agentConfig: z.string().min(1, "Agent config is required."),
});

export async function getAIOptimization(
  values: z.infer<typeof formSchema>
): Promise<{ success: true; data: AIPoweredOptimizationOutput } | { success: false; error: string }> {
  try {
    const input: AIPoweredOptimizationInput = {
      metrics: {
        responseRate: values.responseRate,
        errorRate: values.errorRate,
        avgResponseTime: values.avgResponseTime,
        dailyCost: values.dailyCost,
        engagementRate: values.engagementRate,
      },
      agentConfig: values.agentConfig,
    };

    const result = await analyzeAgentPerformance(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("AI optimization failed:", error);
    return { success: false, error: "Failed to generate AI optimization. Please try again." };
  }
}

export async function startAgent(): Promise<{ success: boolean; message: string }> {
    try {
        await getAgentManagerInstance().start();
        return { success: true, message: "Agent started successfully." };
    } catch (error: any) {
        return { success: false, message: `Failed to start agent: ${error.message}` };
    }
}

export async function stopAgent(): Promise<{ success: boolean; message: string }> {
    try {
        await getAgentManagerInstance().stop();
        return { success: true, message: "Agent stopped successfully." };
    } catch (error: any) {
        return { success: false, message: `Failed to stop agent: ${error.message}` };
    }
}

export async function getAgentStatus(): Promise<{ status: 'offline' | 'running' | 'error'; logs: string[] }> {
    const agentManager = getAgentManagerInstance();
    return {
        status: agentManager.getStatus(),
        logs: agentManager.getLogs(),
    };
}

export async function sendTestNotification(): Promise<{ success: boolean; message: string }> {
    try {
        const notificationService = getNotificationServiceInstance();
        const result = await notificationService.sendNotification('test-user-token', {
            title: 'Agent Alert',
            body: 'This is a test notification from your XAgent platform.',
            data: { screen: 'dashboard' },
        });

        if (result.success) {
            return { success: true, message: `Test notification sent successfully. (ID: ${result.messageId})` };
        } else {
            return { success: false, message: `Failed to send test notification: ${result.error}` };
        }
    } catch (error: any) {
        return { success: false, message: `An error occurred: ${error.message}` };
    }
}
