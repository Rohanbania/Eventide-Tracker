
"use client";

import { useState } from 'react';
import { useEvents } from '@/contexts/EventContext';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BarChart2, FileText, IndianRupee, Wallet, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const chartConfig = {
  amount: {
    label: "Income",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function ReportView({ event }: { event: Event }) {
  const { generateExpenseSummary } = useEvents();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    await generateExpenseSummary(event.id);
    setIsLoading(false);
  };
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const totalIncome = event.incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = event.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    let finalY = 0;

    // Set a font that supports the Rupee symbol.
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text("Eventide Tracker", 14, 22);

    // Report Title
    doc.setFontSize(16);
    doc.text(`Financial Report: ${event.name}`, 14, 40);
    doc.setFontSize(12);
    doc.setTextColor(127, 140, 141);
    doc.text(`Event Date: ${format(new Date(event.date), 'MMMM d, yyyy')}`, 14, 48);

    finalY = 55;

    // Summary Cards
    autoTable(doc, {
      startY: finalY,
      body: [[
        { content: `Total Income\nRs. ${totalIncome.toFixed(2)}`, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: `Total Expenses\nRs. ${totalExpenses.toFixed(2)}`, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: `Net Profit\nRs. ${netProfit.toFixed(2)}`, styles: { halign: 'center', fontStyle: 'bold' } },
      ]],
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        fillColor: [245, 245, 245],
        textColor: 44,
      }
    });

    finalY = (doc as any).lastAutoTable.finalY + 15;

    // AI Summary
    if (event.expenseSummary) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Expense Summary', 14, finalY);
      finalY += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const splitSummary = doc.splitTextToSize(event.expenseSummary, 180);
      doc.text(splitSummary, 14, finalY);
      finalY += (splitSummary.length * 5) + 10;
    }

    const tableConfig = {
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [236, 240, 241], textColor: 44, fontStyle: 'bold' },
      didDrawPage: (data: any) => {
        doc.setFontSize(10);
        doc.setTextColor(127, 140, 141);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    };
    
    // Income Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Income Breakdown', 14, finalY);
    autoTable(doc, {
      ...tableConfig,
      startY: finalY + 2,
      head: [['Source', 'Date', 'Type', 'Amount']],
      body: event.incomes.map(i => [i.source, format(new Date(i.createdAt), 'MMM d, yyyy'), i.transactionType, `Rs. ${i.amount.toFixed(2)}`]),
      foot: [['Total Income', '', '', `Rs. ${totalIncome.toFixed(2)}`]],
    });
    finalY = (doc as any).lastAutoTable.finalY + 15;

    // Expense Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Breakdown', 14, finalY);
    autoTable(doc, {
      ...tableConfig,
      startY: finalY + 2,
      head: [['Notes', 'Created At', 'Type', 'Amount']],
      body: event.expenses.map(e => [e.notes || '-', format(new Date(e.createdAt), 'MMM d, yyyy'), e.transactionType, `Rs. ${e.amount.toFixed(2)}`]),
      foot: [['Total Expenses', '', '', `Rs. ${totalExpenses.toFixed(2)}`]],
    });

    doc.save(`report-${event.name.toLowerCase().replace(/ /g, '-')}.pdf`);
  };

  const totalIncome = event.incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = event.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const chartData = event.incomes.map(income => ({
    source: income.source,
    amount: income.amount,
  }));

  return (
    <div className="space-y-8">
       <div className="flex justify-end">
            <Button onClick={handleDownloadPdf}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
            </Button>
        </div>
       <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-green-500" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-primary-foreground/90">
              ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-red-500" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-destructive/90">
              ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Wallet className={`w-6 h-6 ${netProfit >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-4xl font-bold font-mono ${netProfit >= 0 ? 'text-primary-foreground/90' : 'text-destructive/90'}`}>
              ₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            Expense Summary
          </CardTitle>
          <CardDescription>
            An AI-generated summary of your recorded expenses and key takeaways.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : event.expenseSummary ? (
            <p className="text-card-foreground/90 whitespace-pre-wrap leading-relaxed">
              {event.expenseSummary}
            </p>
          ) : (
             <p className="text-muted-foreground">No summary generated yet. Add some expenses and click the button to create one.</p>
          )}
           <Button onClick={handleGenerateSummary} disabled={isLoading || event.expenses.length === 0} className="mt-4">
            <Sparkles className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : 'Generate AI Summary'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
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
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="source"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 10) + (value.length > 10 ? '...' : '')}
                />
                  <YAxis tickFormatter={(value) => `₹${value}`} />
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
  );

    