"use client";

import { useState } from 'react';
import { useEvents } from '@/contexts/EventContext';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BarChart2, FileText, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis } from "recharts"

const chartConfig = {
  amount: {
    label: "Income",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function ReportView({ event }: { event: Event }) {
  const { generateExperienceSummary } = useEvents();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    await generateExperienceSummary(event.id);
    setIsLoading(false);
  };

  const totalIncome = event.incomes.reduce((sum, income) => sum + income.amount, 0);

  const chartData = event.incomes.map(income => ({
    source: income.source,
    amount: income.amount,
  }));

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            Experience Summary
          </CardTitle>
          <CardDescription>
            An AI-generated summary of your recorded experiences and key takeaways.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : event.experienceSummary ? (
            <p className="text-card-foreground/90 whitespace-pre-wrap leading-relaxed">
              {event.experienceSummary}
            </p>
          ) : (
             <p className="text-muted-foreground">No summary generated yet. Add some experiences and click the button to create one.</p>
          )}
           <Button onClick={handleGenerateSummary} disabled={isLoading || event.experiences.length === 0} className="mt-4">
            <Sparkles className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : 'Generate AI Summary'}
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-500" />
              Total Income
            </CardTitle>
            <CardDescription>The total revenue generated from this event.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold font-mono text-primary-foreground/90">
              ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-accent" />
              Income Breakdown
            </CardTitle>
            <CardDescription>A visual breakdown of income by source.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <XAxis
                    dataKey="source"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 10) + (value.length > 10 ? '...' : '')}
                  />
                   <YAxis tickFormatter={(value) => `$${value}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No income data to display.</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
