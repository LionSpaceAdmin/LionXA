'use server';

/**
 * @fileOverview AI-powered agent optimization flow.
 *
 * - analyzeAgentPerformance - Analyzes agent metrics and provides optimization insights.
 * - AIPoweredOptimizationInput - Input type for analyzeAgentPerformance.
 * - AIPoweredOptimizationOutput - Output type for analyzeAgentPerformance.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredOptimizationInputSchema = z.object({
  metrics: z.object({
    responseRate: z.number().describe('Agent response rate (percentage).'),
    errorRate: z.number().describe('Agent error rate (percentage).'),
    avgResponseTime: z.number().describe('Average response time (milliseconds).'),
    dailyCost: z.number().describe('Daily cost of the agent.'),
    engagementRate: z.number().describe('Agent engagement rate (percentage).'),
  }).describe('Agent performance metrics.'),
  agentConfig: z.string().describe('The current agent configuration, as a JSON string.'),
});
export type AIPoweredOptimizationInput = z.infer<typeof AIPoweredOptimizationInputSchema>;

const InsightReportSchema = z.object({
  performanceAssessment: z.string().describe('Overall performance assessment (e.g., Excellent, Good, Needs Improvement, Poor).'),
  optimizationRecommendations: z.array(z.string()).describe('Top optimization recommendations.'),
  costEfficiencyAnalysis: z.string().describe('Analysis of the agent\u2019s cost efficiency.'),
  predictedIssues: z.string().describe('Potential issues to watch for.'),
});

const OptimizationSuggestionSchema = z.object({
  category: z.string().describe('Category of the suggestion (e.g., Configuration, Resources).'),
  suggestion: z.string().describe('Specific optimization suggestion.'),
  impact: z.enum(['high', 'medium', 'low']).describe('Impact level of the suggestion.'),
  implementation: z.string().describe('Instructions on how to implement the suggestion.'),
});

const AIPoweredOptimizationOutputSchema = z.object({
  insightReport: InsightReportSchema.describe('AI-generated insight report.'),
  optimizationSuggestions: z.array(OptimizationSuggestionSchema).describe('AI-powered optimization suggestions.'),
});
export type AIPoweredOptimizationOutput = z.infer<typeof AIPoweredOptimizationOutputSchema>;

export async function analyzeAgentPerformance(input: AIPoweredOptimizationInput): Promise<AIPoweredOptimizationOutput> {
  return aiPoweredOptimizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredOptimizationPrompt',
  input: {schema: AIPoweredOptimizationInputSchema},
  output: {schema: AIPoweredOptimizationOutputSchema},
  prompt: `You are an AI agent optimization expert. Analyze the agent's performance metrics and current configuration to provide actionable insights and configuration suggestions.

Agent Performance Metrics:
Response Rate: {{{metrics.responseRate}}}%
Error Rate: {{{metrics.errorRate}}}%
Average Response Time: {{{metrics.avgResponseTime}}}ms
Daily Cost: {{{metrics.dailyCost}}}
Engagement Rate: {{{metrics.engagementRate}}}%

Current Agent Configuration:
{{{agentConfig}}}

Provide an insight report with the following:
- Overall performance assessment (e.g., Excellent, Good, Needs Improvement, Poor)
- Top 3 optimization recommendations
- Cost efficiency analysis
- Predicted issues to watch for

Also, provide a list of optimization suggestions with the following details for each suggestion:
- Category (e.g., Configuration, Resources)
- Specific optimization suggestion
- Impact level (high, medium, low)
- Instructions on how to implement the suggestion.

Ensure the output is a valid JSON object conforming to the schema.`,
});

const aiPoweredOptimizationFlow = ai.defineFlow(
  {
    name: 'aiPoweredOptimizationFlow',
    inputSchema: AIPoweredOptimizationInputSchema,
    outputSchema: AIPoweredOptimizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
