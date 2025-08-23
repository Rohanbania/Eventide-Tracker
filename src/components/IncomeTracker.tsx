
"use client";

import { useEvents } from '@/contexts/EventContext';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from '@/components/ui/table';
import { IndianRupee, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AddIncomeDialog } from './AddIncomeDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

export function IncomeTracker({ event }: { event: Event }) {
  const { deleteIncome } = useEvents();
  
  const totalIncome = event.incomes.reduce((sum, income) => sum + income.amount, 0);

  const handleDeleteIncome = async (incomeId: string) => {
    try {
        await deleteIncome(event.id, incomeId);
        toast({ title: "Income Deleted", description: "The income record has been successfully removed." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete income record." });
    }
  };


  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Record Income</CardTitle>
            <CardDescription>Add a new source of revenue from this event.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddIncomeDialog event={event}>
                <Button className="w-full">Add New Income</Button>
            </AddIncomeDialog>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-2xl font-headline mb-4 flex items-center gap-2">
            <IndianRupee className="w-6 h-6" /> Income Entries
        </h3>
        <Card className="overflow-x-auto">
          <Table>
            {event.incomes.length === 0 && <TableCaption>No income recorded yet.</TableCaption>}
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.incomes.map((income) => (
                <TableRow key={income.id} className="animate-in fade-in-0">
                  <TableCell className="font-medium whitespace-nowrap">{income.source}</TableCell>
                  <TableCell>
                    <Badge variant={income.transactionType === 'Bank' ? 'secondary' : 'outline'}>
                      {income.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{format(new Date(income.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right font-mono whitespace-nowrap">₹{income.amount.toFixed(2)}</TableCell>
                   <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <AddIncomeDialog event={event} incomeToEdit={income}>
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                           </DropdownMenuItem>
                        </AddIncomeDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this income record. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteIncome(income.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
             {event.incomes.length > 0 && (
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={4} className="font-bold text-lg">Total Income</TableCell>
                        <TableCell className="text-right font-bold font-mono text-lg whitespace-nowrap">₹{totalIncome.toFixed(2)}</TableCell>
                    </TableRow>
                </TableFooter>
             )}
          </Table>
        </Card>
      </div>
    </div>
  );
}
