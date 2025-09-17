"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Bot, BrainCircuit, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { getAIOptimization } from "@/app/actions";
import type { AIPoweredOptimizationOutput } from "@/ai/flows/ai-powered-optimization";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  responseRate: z.number().min(0).max(100),
  errorRate: z.number().min(0).max(100),
  avgResponseTime: z.number().min(0),
  dailyCost: z.number().min(0),
  engagementRate: z.number().min(0).max(100),
  agentConfig: z.string().min(1, "Agent config is required."),
});

const defaultAgentConfig = JSON.stringify(
  {
    model: "gemini-1.5-pro-latest",
    temperature: 0.7,
    max_tokens: 256,
  },
  null,
  2
);

export function AIOptimization() {
  const t = useTranslations('AIOptimization');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AIPoweredOptimizationOutput | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      responseRate: 85,
      errorRate: 2,
      avgResponseTime: 1200,
      dailyCost: 15,
      engagementRate: 60,
      agentConfig: defaultAgentConfig,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const response = await getAIOptimization(values);
      if (response.success) {
        setResult(response.data);
        toast({
          title: t('notifications.analysisComplete'),
          description: t('notifications.analysisCompleteDesc'),
        });
      } else {
        toast({
          variant: "destructive",
          title: t('notifications.analysisFailed'),
          description: response.error,
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-lg">{t('title')}</CardTitle>
        </div>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="responseRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.responseRate')} ({field.value}%)</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={100}
                        step={1}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="errorRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.errorRate')} ({field.value}%)</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={100}
                        step={1}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="engagementRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.engagementRate')} ({field.value}%)</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={100}
                        step={1}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avgResponseTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.avgResponseTime')} ({field.value}ms)</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={5000}
                        step={50}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="dailyCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.dailyCost')} (${field.value})</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={100}
                        step={1}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="agentConfig"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.agentConfig')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('form.agentConfigPlaceholder')}
                      className="font-code"
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? t('form.analyzingButton') : t('form.analyzeButton')}
              <Bot className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
        <div className="space-y-4">
          <h3 className="font-headline text-md font-semibold">{t('insightReport.title')}</h3>
          {isPending && (
             <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-8">
                <div className="text-center text-muted-foreground">
                    <BrainCircuit className="mx-auto h-12 w-12 animate-pulse"/>
                    <p className="mt-2">{t('insightReport.analyzingData')}</p>
                </div>
             </div>
          )}
          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{t('insightReport.performance')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{result.insightReport.performanceAssessment}</div>
                    <p className="text-xs text-muted-foreground">{result.insightReport.costEfficiencyAnalysis}</p>
                </CardContent>
              </Card>

              <Accordion type="single" collapsible className="w-full">
                {result.optimizationSuggestions.map((suggestion, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-accent"/>
                        <span>{suggestion.suggestion}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 px-1">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{suggestion.category}</Badge>
                        <Badge variant={suggestion.impact === 'high' ? 'destructive' : suggestion.impact === 'medium' ? 'default' : 'outline'}>
                            {t('suggestion.impact')}: {suggestion.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.implementation}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
           {!isPending && !result && (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-8">
                <div className="text-center text-muted-foreground">
                    <p>{t('insightReport.insightsAppearHere')}</p>
                </div>
            </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
