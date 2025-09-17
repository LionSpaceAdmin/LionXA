"use server";

import { analyzeAgentPerformance, AIPoweredOptimizationInput, AIPoweredOptimizationOutput } from "@/ai/flows/ai-powered-optimization";
import { z } from "zod";

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
