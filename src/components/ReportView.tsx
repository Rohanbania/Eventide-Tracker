
"use client";

import { useState, useRef }from 'react';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, IndianRupee, Wallet, Download, Landmark, Coins, Loader2 } from 'lucide-react';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportPDF } from './ReportPDF';


const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig


export function ReportView({ event }: { event: Event }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    const reportElement = pdfRef.current;
    if (!reportElement) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not find the report content to download.",
        });
        setIsDownloading(false);
        return;
    }
    
    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        const pdfDataUri = pdf.output('datauristring');
        pdf.save(`report-${event.name.toLowerCase().replace(/ /g, '-')}.pdf`);
        
        toast({
            title: "Download Complete",
            description: "Your PDF report has been downloaded.",
            action: (
              <ToastAction altText="View PDF" onClick={() => window.open(pdfDataUri, '_blank')}>View PDF</ToastAction>
            ),
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
  
  const monetaryDonations = event.donations?.filter(d => d.donationType === 'Cash' || d.donationType === 'Bank') || [];
  
  const cashIncomes = event.incomes.filter(i => i.transactionType === 'Cash').reduce((acc, i) => acc + i.amount, 0) + monetaryDonations.filter(d => d.donationType === 'Cash').reduce((acc, d) => acc + (d.amount || 0), 0);
  const bankIncomes = event.incomes.filter(i => i.transactionType === 'Bank').reduce((acc, i) => acc + i.amount, 0) + monetaryDonations.filter(d => d.donationType === 'Bank').reduce((acc, d) => acc + (d.amount || 0), 0);
  const totalIncome = cashIncomes + bankIncomes;

  const cashExpenses = event.expenses.filter(e => e.transactionType === 'Cash').reduce((acc, e) => acc + e.amount, 0);
  const bankExpenses = event.expenses.filter(e => e.transactionType === 'Bank').reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = cashExpenses + bankExpenses;

  const cashBalance = cashIncomes - cashExpenses;
  const bankBalance = bankIncomes - bankExpenses;
  const netProfit = totalIncome - totalExpenses;

  const allIncomes = [
      ...event.incomes,
      ...monetaryDonations.map(d => ({
        id: d.id,
        source: `${d.source} (Donation)`,
        amount: d.amount || 0,
        createdAt: d.createdAt,
        transactionType: d.donationType as 'Cash' | 'Bank',
      }))
  ];
  
  const incomeChartData = allIncomes.map(item => ({
    name: item.source,
    income: item.amount,
  }));

  const expenseChartData = event.expenses.map(item => ({
    name: item.notes || 'Unspecified',
    expense: item.amount,
  }));

  const getChartWidth = (dataLength: number) => {
    const minWidth = 800; // Minimum width of the chart
    const widthPerBar = 80; // Pixels per bar
    const calculatedWidth = dataLength * widthPerBar;
    return Math.max(minWidth, calculatedWidth);
  }

  const formatXAxisTick = (value: string) => {
    if (value.length > 15) {
      return `${value.substring(0, 15)}...`;
    }
    return value;
  };

  return (
    <div className="space-y-8">
       {/* Staging area for PDF rendering */}
       <div className="absolute -left-[9999px] top-auto w-[800px]">
          <div ref={pdfRef}>
            <ReportPDF 
              event={event}
              summary={{ totalIncome, totalExpenses, cashBalance, bankBalance, netProfit, cashIncomes, bankIncomes, cashExpenses, bankExpenses }}
              allIncomes={allIncomes}
              formatCurrency={formatCurrency}
            />
          </div>
       </div>

       <div className="flex justify-end gap-2">
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
              <Wallet className={`w-5 h-5 md-w-6 md:h-6 ${netProfit >= 0 ? 'text-emerald-500' : 'text-orange-500'}`} />
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
            <BarChart2 className="w-6 h-6 text-accent" />
            Financial Breakdown
          </CardTitle>
          <CardDescription>
            Switch between income and expense visualizations. The chart is scrollable if there are many items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>
            <TabsContent value="income">
              {incomeChartData.length > 0 ? (
                <div className="overflow-x-auto py-2">
                   <ChartContainer config={chartConfig} style={{ minHeight: '450px', width: `${getChartWidth(incomeChartData.length)}px` }}>
                      <ResponsiveContainer>
                        <BarChart
                          accessibilityLayer
                          data={incomeChartData}
                          margin={{ top: 20, right: 20, left: -10, bottom: 80 }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            interval={0}
                            tickFormatter={formatXAxisTick}
                            dy={10}
                            angle={-45}
                            textAnchor="end"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                        </BarChart>
                      </ResponsiveContainer>
                   </ChartContainer>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No income data to display.
                </p>
              )}
            </TabsContent>
            <TabsContent value="expense">
              {expenseChartData.length > 0 ? (
                <div className="overflow-x-auto py-2">
                    <ChartContainer config={chartConfig} style={{ minHeight: '450px', width: `${getChartWidth(expenseChartData.length)}px` }}>
                    <ResponsiveContainer>
                      <BarChart
                        accessibilityLayer
                        data={expenseChartData}
                        margin={{ top: 20, right: 20, left: -10, bottom: 80 }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          interval={0}
                          tickFormatter={formatXAxisTick}
                          dy={10}
                          angle={-45}
                          textAnchor="end"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No expense data to display.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

    