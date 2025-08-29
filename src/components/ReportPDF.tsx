
"use client";

import type { Event, Income } from '@/lib/types';
import { format } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

interface ReportPDFProps {
    event: Event;
    summary: {
        totalIncome: number;
        totalExpenses: number;
        cashBalance: number;
        bankBalance: number;
        netProfit: number;
        cashIncomes: number;
        bankIncomes: number;
        cashExpenses: number;
        bankExpenses: number;
    };
    allIncomes: Income[];
    formatCurrency: (amount: number) => string;
}

export function ReportPDF({ event, summary, allIncomes, formatCurrency }: ReportPDFProps) {
    
    return (
        <div className="p-8 bg-white text-black font-sans text-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-[#73A9AD]">
                <div className="flex items-center gap-3">
                    <div className="bg-[#D0BFFF] p-2 rounded-full">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#73A9AD]">Eventide Tracker</h1>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold">Financial Report</p>
                    <p className="text-gray-500 text-sm">Generated on: {format(new Date(), 'MMMM d, yyyy')}</p>
                </div>
            </div>

            {/* Title */}
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold">{event.name}</h2>
                <p className="text-gray-500 text-lg">Event Date: {format(new Date(event.date), 'MMMM d, yyyy')}</p>
                {event.description && <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{event.description}</p>}
            </div>

            {/* Summary Table */}
            <h3 className="text-xl font-bold mb-2">Overall Summary</h3>
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#E6DFFF] hover:bg-[#E6DFFF]">
                        <TableHead className="text-black font-semibold">Category</TableHead>
                        <TableHead className="text-black font-semibold">Income</TableHead>
                        <TableHead className="text-black font-semibold">Expenses</TableHead>
                        <TableHead className="text-right text-black font-semibold">Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">Cash</TableCell>
                        <TableCell>{formatCurrency(summary.cashIncomes)}</TableCell>
                        <TableCell>{formatCurrency(summary.cashExpenses)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(summary.cashBalance)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Bank</TableCell>
                        <TableCell>{formatCurrency(summary.bankIncomes)}</TableCell>
                        <TableCell>{formatCurrency(summary.bankExpenses)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(summary.bankBalance)}</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                     <TableRow className="bg-gray-100 hover:bg-gray-100">
                        <TableCell colSpan={3} className="text-right font-bold text-lg">Net Profit / Loss</TableCell>
                        <TableCell className="font-bold text-right text-lg">{formatCurrency(summary.netProfit)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            
            {/* Income Breakdown */}
            {allIncomes.length > 0 && (
                <div className="mt-10 break-inside-avoid">
                    <h3 className="text-xl font-bold mb-2">Income Breakdown</h3>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#E6DFFF] hover:bg-[#E6DFFF]">
                                <TableHead className="text-black font-semibold">Source</TableHead>
                                <TableHead className="text-black font-semibold">Date</TableHead>
                                <TableHead className="text-black font-semibold">Type</TableHead>
                                <TableHead className="text-right text-black font-semibold">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allIncomes.map(i => (
                                <TableRow key={i.id}>
                                    <TableCell>{i.source}</TableCell>
                                    <TableCell>{format(new Date(i.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>{i.transactionType}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(i.amount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow className="bg-gray-100 hover:bg-gray-100">
                                <TableCell colSpan={3} className="text-right font-bold">Total Income</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(summary.totalIncome)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            )}

            {/* Expense Breakdown */}
            {event.expenses.length > 0 && (
                 <div className="mt-10 break-inside-avoid">
                    <h3 className="text-xl font-bold mb-2">Expense Breakdown</h3>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#E6DFFF] hover:bg-[#E6DFFF]">
                                <TableHead className="text-black font-semibold">Notes</TableHead>
                                <TableHead className="text-black font-semibold">Date</TableHead>
                                <TableHead className="text-black font-semibold">Type</TableHead>
                                <TableHead className="text-right text-black font-semibold">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {event.expenses.map(e => (
                                <TableRow key={e.id}>
                                    <TableCell>{e.notes || '-'}</TableCell>
                                    <TableCell>{format(new Date(e.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>{e.transactionType}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(e.amount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow className="bg-gray-100 hover:bg-gray-100">
                                <TableCell colSpan={3} className="text-right font-bold">Total Expenses</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(summary.totalExpenses)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            )}

            {/* Donation Breakdown */}
            {event.donations && event.donations.length > 0 && (
                <div className="mt-10 break-inside-avoid">
                    <h3 className="text-xl font-bold mb-2">Donation Breakdown</h3>
                    <Table>
                         <TableHeader>
                            <TableRow className="bg-[#E6DFFF] hover:bg-[#E6DFFF]">
                                <TableHead className="text-black font-semibold">Donor</TableHead>
                                <TableHead className="text-black font-semibold">Date</TableHead>
                                <TableHead className="text-black font-semibold">Type</TableHead>
                                <TableHead className="text-right text-black font-semibold">Details / Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {event.donations.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell>{d.source}</TableCell>
                                    <TableCell>{format(new Date(d.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>{d.donationType}</TableCell>
                                    <TableCell className="text-right">
                                        {d.donationType === 'Goods' ? d.goods : formatCurrency(d.amount || 0)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
