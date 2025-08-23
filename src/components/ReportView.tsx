
"use client";

import { useState } from 'react';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BarChart2, FileText, IndianRupee, Wallet, Download, Landmark, Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useEvents } from '@/contexts/EventContext';

const chartConfig = {
  amount: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ReportView({ event }: { event: Event }) {
  const { generateExpenseSummary } = useEvents();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    await generateExpenseSummary(event.id);
    setIsLoading(false);
  };
  
  const handleDownloadPdf = () => {
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

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

    // Summary Cards
    autoTable(doc, {
        startY: finalY,
        head: [['Category', 'Income', 'Expenses', 'Balance']],
        body: [
            ['Cash', formatCurrency(cashIncomes), formatCurrency(cashExpenses), formatCurrency(cashBalance)],
            ['Bank', formatCurrency(bankIncomes), formatCurrency(bankExpenses), formatCurrency(bankBalance)],
        ],
        foot: [
            [{ content: 'Total', colSpan: 1, styles: { fontStyle: 'bold' } }, 
            formatCurrency(totalIncome), 
            formatCurrency(totalExpenses), 
            formatCurrency(netProfit)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        footStyles: { fillColor: [236, 240, 241], textColor: 44, fontStyle: 'bold' },
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


    const pdfOutput = doc.output('datauristring');
    doc.save(`report-${event.name.toLowerCase().replace(/ /g, '-')}.pdf`);
    
    toast({
        title: "Download Complete",
        description: "Your PDF report has been downloaded.",
        action: (
          <Button variant="secondary" size="sm" onClick={() => window.open(pdfOutput)}>
            View
          </Button>
        ),
      });
  };

  const cashIncomes = event.incomes.filter(i => i.transactionType === 'Cash').reduce((acc, i) => acc + i.amount, 0);
  const bankIncomes = event.incomes.filter(i => i.transactionType === 'Bank').reduce((acc, i) => acc + i.amount, 0);
  const totalIncome = cashIncomes + bankIncomes;

  const cashExpenses = event.expenses.filter(e => e.transactionType === 'Cash').reduce((acc, e) => acc + e.amount, 0);
  const bankExpenses = event.expenses.filter(e => e.transactionType === 'Bank').reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = cashExpenses + bankExpenses;
  
  const cashBalance = cashIncomes - cashExpenses;
  const bankBalance = bankIncomes - bankExpenses;
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
              ₹{cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              ₹{bankBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
