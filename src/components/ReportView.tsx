
"use client";

import { useState }from 'react';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, IndianRupee, Wallet, Download, Landmark, Coins, Loader2 } from 'lucide-react';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    
    try {
        const doc = new jsPDF();
        
        // Noto Sans font data (replace with actual Base64 data)
        // This is a placeholder. You would fetch or have the Base64 string of the font here.
        // For this example, we'll assume it's loaded and skip the font embedding for brevity.
        // doc.addFileToVFS('NotoSans-Regular.ttf', notoSansRegularBase64);
        // doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
        // doc.setFont('NotoSans');

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
            ...event.incomes.map(i => ({...i, type: i.transactionType})),
            ...monetaryDonations.map(d => ({
                ...d,
                source: `${d.source} (Donation)`,
                amount: d.amount || 0,
                type: d.donationType as 'Cash' | 'Bank'
            }))
        ].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


        let finalY = 0;

        // Header
        const accentColor = "#73A9AD"; // Muted Teal from theme
        doc.setFillColor(accentColor);
        doc.setDrawColor(accentColor);

        const iconPaths = [
          "M10 3L8 8L3 10L8 12L10 17L12 12L17 10L12 8L10 3Z",
          "M21 3L19.5 6.5L16 8L19.5 9.5L21 13L22.5 9.5L26 8L22.5 6.5L21 3Z"
        ];
        
        const scale = 0.35;
        const offsetX = 15;
        const offsetY = 18;

        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({opacity: 1}));
        doc.setLineWidth(0.5);
        
        iconPaths.forEach(pathData => {
            const commands = pathData.match(/[A-Z][^A-Z]*/g) || [];
            
            commands.forEach((command, index) => {
                const type = command[0];
                const points = command.substring(1).trim().split(/[ ,L]/).map(p => parseFloat(p));

                const transformedPoints = [];
                for(let i=0; i<points.length; i+=2) {
                    transformedPoints.push(points[i] * scale + offsetX);
                    transformedPoints.push(points[i+1] * scale + offsetY);
                }

                if (type === 'M' && index === 0) {
                    doc.moveTo(transformedPoints[0], transformedPoints[1]);
                } else if (type === 'L') { 
                    doc.lineTo(transformedPoints[0], transformedPoints[1]);
                } else if (type === 'Z') {
                    doc.close();
                } else {
                     doc.moveTo(transformedPoints[0], transformedPoints[1]);
                }
            });
             doc.fill();
        });
        doc.restoreGraphicsState();
        
        doc.setFontSize(22);
        doc.setTextColor(accentColor);
        doc.text("Eventide Tracker", 26, 22);

        // Report Title
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text(`Financial Report: ${event.name}`, 14, 40);
        doc.setFontSize(12);
        doc.setTextColor(127, 140, 141);
        doc.text(`Event Date: ${format(new Date(event.date), 'MMMM d, yyyy')}`, 14, 48);

        finalY = 55;

        const summaryFooter = [
          ['Total', formatCurrency(totalIncome), formatCurrency(totalExpenses), formatCurrency(netProfit)],
        ];

        if (cashBalance !== 0 || bankBalance !== 0) {
            summaryFooter.push(
                 [{ content: `Cash Balance: ${formatCurrency(cashBalance)}`, colSpan: 2, styles: { fontStyle: 'normal', fillColor: [245, 245, 245] } }, { content: `Bank Balance: ${formatCurrency(bankBalance)}`, colSpan: 2, styles: { fontStyle: 'normal', fillColor: [245, 245, 245] } }],
            )
        }

        autoTable(doc, {
            startY: finalY,
            head: [['Category', 'Income', 'Expenses', 'Balance']],
            body: [
                ['Cash', formatCurrency(cashIncomes), formatCurrency(cashExpenses), formatCurrency(cashBalance)],
                ['Bank', formatCurrency(bankIncomes), formatCurrency(bankExpenses), formatCurrency(bankBalance)],
            ],
            foot: summaryFooter,
            theme: 'striped',
            headStyles: { fillColor: [208, 191, 255], textColor: [40, 40, 40], fontStyle: 'bold' },
            footStyles: { fillColor: [245, 245, 245], textColor: [40, 40, 40], fontStyle: 'bold'  }
        });

        finalY = (doc as any).lastAutoTable.finalY + 15;
        
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
        
        if (allIncomes.length > 0) {
            if ((doc.internal.pageSize.height - finalY) < 50) { // Check if new page is needed
                doc.addPage();
                finalY = 20;
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Income Breakdown', 14, finalY);
            autoTable(doc, {
            ...tableConfig,
            startY: finalY + 2,
            head: [['Source', 'Date', 'Type', 'Amount']],
            body: allIncomes.map(i => [i.source, format(new Date(i.createdAt), 'MMM d, yyyy'), i.type, formatCurrency(i.amount)]),
            foot: [['Total Income', '', '', formatCurrency(totalIncome)]],
            });
            finalY = (doc as any).lastAutoTable.finalY + 15;
        }

        if (event.expenses.length > 0) {
            if ((doc.internal.pageSize.height - finalY) < 50) { // Check if new page is needed
                doc.addPage();
                finalY = 20;
            }
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
            finalY = (doc as any).lastAutoTable.finalY + 15;
        }

        if (event.donations && event.donations.length > 0) {
             if ((doc.internal.pageSize.height - finalY) < 50) { // Check if new page is needed
                doc.addPage();
                finalY = 20;
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Donation Breakdown', 14, finalY);
            autoTable(doc, {
                ...tableConfig,
                startY: finalY + 2,
                head: [['Donor', 'Date', 'Type', 'Details/Amount']],
                body: event.donations.map(d => [
                    d.source,
                    format(new Date(d.createdAt), 'MMM d, yyyy'),
                    d.donationType,
                    d.donationType === 'Goods' ? d.goods : formatCurrency(d.amount || 0)
                ]),
            });
        }
        
        const pdfDataUri = doc.output('datauristring');
        doc.save(`report-${event.name.toLowerCase().replace(/ /g, '-')}.pdf`);
        
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

  return (
    <div className="space-y-8">
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

       <Carousel className="w-full">
            <CarouselContent>
                <CarouselItem>
                    <Card id="income-chart">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <BarChart2 className="w-6 h-6 text-accent" />
                                Income Breakdown
                            </CardTitle>
                            <CardDescription>A visual breakdown of all income sources.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {incomeChartData.length > 0 ? (
                                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                                    <ResponsiveContainer>
                                        <BarChart accessibilityLayer data={incomeChartData} margin={{ top: 20, right: 20, left: -10, bottom: 80 }}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                interval={0}
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                            />
                                            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No income data to display.</p>
                            )}
                        </CardContent>
                    </Card>
                </CarouselItem>
                <CarouselItem>
                    <Card id="expense-chart">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <BarChart2 className="w-6 h-6 text-accent" />
                                Expense Breakdown
                            </CardTitle>
                            <CardDescription>A visual breakdown of all expenses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {expenseChartData.length > 0 ? (
                                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                                    <ResponsiveContainer>
                                        <BarChart accessibilityLayer data={expenseChartData} margin={{ top: 20, right: 20, left: -10, bottom: 80 }}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                interval={0}
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                            />
                                            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No expense data to display.</p>
                            )}
                        </CardContent>
                    </Card>
                </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    </div>
  );
}

    