
"use client";

import { useState } from 'react';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BarChart2, FileText, IndianRupee, Wallet, Download, Landmark, Coins, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useEvents } from '@/contexts/EventContext';
import { logoBase64 } from '@/lib/logo';

const chartConfig = {
  amount: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function ReportView({ event }: { event: Event }) {
  const { generateExpenseSummary } = useEvents();
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    await generateExpenseSummary(event.id);
    setIsLoading(false);
  };
  
  const handleDownloadPdf = async () => {
    setIsDownloading(true);

    // Allow UI to update before starting heavy task
    await new Promise(resolve => setTimeout(resolve, 0));

    try {
      const doc = new jsPDF();
      const cashIncomes = event.incomes.filter(i => i.transactionType === 'Cash').reduce((acc, i) => acc + i.amount, 0);
      const bankIncomes = event.incomes.filter(i => i.transactionType === 'Bank').reduce((acc, i) => acc + i.amount, 0);
      const totalIncome = cashIncomes + bankIncomes;

      const cashExpenses = event.expenses.filter(e => e.transactionType === 'Cash').reduce((acc, e) => acc + e.amount, 0);
      const bankExpenses = event.expenses.filter(e => e.transactionType === 'Bank').reduce((acc, e) => acc + e.amount, 0);
      const totalExpenses = cashExpenses + bankExpenses;
      
      const cashBalance = cashIncomes - cashExpenses;
      const bankBalance = bankIncomes - bankExpenses;
      const netProfit = totalIncome - totalExpenses;

      let finalY = 0;

      // Header with Logo
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 15, 12, 12);
      }
      doc.setFontSize(22);
      doc.setTextColor(115, 169, 173); // Muted Teal
      doc.text("Eventide Tracker", 30, 22);

      // Report Title
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(`Financial Report: ${event.name}`, 14, 40);
      doc.setFontSize(12);
      doc.setTextColor(127, 140, 141);
      doc.text(`Event Date: ${format(new Date(event.date), 'MMMM d, yyyy')}`, 14, 48);

      finalY = 55;

      const tableFooter = [
        ['Total', formatCurrency(totalIncome), formatCurrency(totalExpenses), formatCurrency(netProfit)],
        [{ content: `Cash Balance: ${formatCurrency(cashBalance)}`, colSpan: 2, styles: { fontStyle: 'normal', fillColor: [245, 245, 245] } }, { content: `Bank Balance: ${formatCurrency(bankBalance)}`, colSpan: 2, styles: { fontStyle: 'normal', fillColor: [245, 245, 245] } }],
      ];

      autoTable(doc, {
          startY: finalY,
          head: [['Category', 'Income', 'Expenses', 'Balance']],
          body: [
              ['Cash', formatCurrency(cashIncomes), formatCurrency(cashExpenses), formatCurrency(cashBalance)],
              ['Bank', formatCurrency(bankIncomes), formatCurrency(bankExpenses), formatCurrency(bankBalance)],
          ],
          foot: tableFooter,
          theme: 'striped',
          headStyles: { fillColor: [208, 191, 255], textColor: [40, 40, 40], fontStyle: 'bold' },
          footStyles: { fillColor: [245, 245, 245], textColor: [40, 40, 40], fontStyle: 'bold'  }
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
        const splitSummary = doc.splitTextToSize(event.expenseSummary, 180);
        doc.text(splitSummary, 14, finalY);
        finalY += (splitSummary.length * 5) + 10;
      }

      const tableConfig = {
        theme: 'striped' as const,
        headStyles: { fillColor: [208, 191, 255], textColor: [40, 40, 40], fontStyle: 'bold' as const },
        footStyles: { fillColor: [245, 245, 245], textColor: [40, 40, 40], fontStyle: 'bold' as const },
        didDrawPage: (data: any) => {
          doc.setFontSize(10);
          doc.setTextColor(127, 140, 141);
          doc.text(`Page ${doc.internal.getNumberOfPages()}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      };
      
      // Income Table
      if (event.incomes.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Income Breakdown', 14, finalY);
          autoTable(doc, {
          ...tableConfig,
          startY: finalY + 2,
          head: [['Source', 'Date', 'Type', 'Amount']],
          body: event.incomes.map(i => [i.source, format(new Date(i.createdAt), 'MMM d, yyyy'), i.transactionType, formatCurrency(i.amount)]),
          foot: [['Total Income', '', '', formatCurrency(totalIncome)]],
          });
          finalY = (doc as any).lastAutoTable.finalY + 15;
      }


      // Expense Table
      if (event.expenses.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Expense Breakdown', 14, finalY);
          autoTable(doc, {
          ...tableConfig,
          startY: finalY + 2,
          head: [['Notes', 'Created At', 'Type', 'Amount']],
          body: event.expenses.map(e => [e.notes || '-', format(new Date(e.createdAt), 'MMM d, yyyy'), e.transactionType, formatCurrency(e.amount)]),
          foot: [['Total Expenses', '', '', formatCurrency(totalExpenses)]],
          });
      }

      doc.save(`report-${event.name.toLowerCase().replace(/ /g, '-')}.pdf`);
      
      toast({
          title: "Download Complete",
          description: "Your PDF report has been downloaded.",
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate the PDF report."
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const totalIncome = event.incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = event.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  
  const cashIncomes = event.incomes.filter(i => i.transactionType === 'Cash').reduce((acc, i) => acc + i.amount, 0);
  const bankIncomes = event.incomes.filter(i => i.transactionType === 'Bank').reduce((acc, i) => acc + i.amount, 0);
  const cashExpenses = event.expenses.filter(e => e.transactionType === 'Cash').reduce((acc, e) => acc + e.amount, 0);
  const bankExpenses = event.expenses.filter(e => e.transactionType === 'Bank').reduce((acc, e) => acc + e.amount, 0);
  const cashBalance = cashIncomes - cashExpenses;
  const bankBalance = bankIncomes - bankExpenses;

  const chartData = event.incomes.map(income => ({
    source: income.source,
    amount: income.amount,
  }));

  return (
    <div className="space-y-8">
       <div className="flex justify-end">
            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
            </Button>
        </div>
       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-lg md:text-xl">
              <Coins className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              Cash Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-4xl font-bold font-mono text-primary-foreground/90">
              {formatCurrency(cashBalance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-lg md:text-xl">
              <Landmark className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              Bank Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-4xl font-bold font-mono text-primary-foreground/90">
              {formatCurrency(bankBalance)}
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-lg md:text-xl">
              <IndianRupee className={`w-5 h-5 md:w-6 md:h-6 text-indigo-500`} />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl md:text-4xl font-bold font-mono text-primary-foreground/90`}>
              {formatCurrency(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2 text-lg md:text-xl">
              <Wallet className={`w-5 h-5 md:w-6 md:h-6 ${netProfit >= 0 ? 'text-emerald-500' : 'text-orange-500'}`} />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl md:text-4xl font-bold font-mono ${netProfit >= 0 ? 'text-primary-foreground/90' : 'text-destructive/90'}`}>
              {formatCurrency(netProfit)}
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
                <ResponsiveContainer>
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="source"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 10) + (value.length > 10 ? '...' : '')}
                        />
                        <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No income data to display.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
