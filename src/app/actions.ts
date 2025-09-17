"use server";

import { analyzeAgentPerformance, AIPoweredOptimizationInput, AIPoweredOptimizationOutput } from "@/ai/flows/ai-powered-optimization";
import { z } from "zod";
import { getNotificationServiceInstance } from "@/lib/notification-service";
import { revalidatePath } from "next/cache";

const formSchema = z.object({
  responseRate: z.number().min(0).max(100),
  errorRate: z.number().min(0).max(100),
  avgResponseTime: z.number().min(0),
  dailyCost: z.number().min(0),
  engagementRate: z.number().min(0).max(100),
  agentConfig: z.string().min(1, "Agent config is required."),
});

// The base URL for our internal API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? (process.env.NEXT_PUBLIC_SITE_URL || '') // In production, use the public URL
    : 'http://localhost:3000'; // In development, use localhost


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
        const response = await fetch(`${API_BASE_URL}/api/agent/start`, { 
            method: 'POST',
            cache: 'no-store' 
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to start agent' }));
            throw new Error(errorData.message);
        }
        const data = await response.json();
        revalidatePath('/');
        return { success: true, message: data.message || "Agent started successfully." };
    } catch (error: any) {
        return { success: false, message: `Failed to start agent: ${error.message}` };
    }
}

export async function stopAgent(): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/agent/stop`, { 
            method: 'POST',
            cache: 'no-store'
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to stop agent' }));
            throw new Error(errorData.message);
        }
        const data = await response.json();
        revalidatePath('/');
        return { success: true, message: data.message || "Agent stopped successfully." };
    } catch (error: any) {
        return { success: false, message: `Failed to stop agent: ${error.message}` };
    }
}

export async function getAgentStatus(): Promise<{ status: 'offline' | 'running' | 'error'; logs: string[] }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/agent/status`, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Failed to fetch agent status');
        }
        const data = await response.json();
        return {
            status: data.status || 'offline',
            logs: data.logs || [],
        };
    } catch (error: any) {
        console.error("getAgentStatus error:", error.message);
        return {
            status: 'error',
            logs: [`Error fetching agent status: ${error.message}`],
        };
    }
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
