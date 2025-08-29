
"use client";

import { useEvents } from '@/contexts/EventContext';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from '@/components/ui/table';
import { IndianRupee, MoreVertical, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { AddExpenseDialog } from './AddExpenseDialog';

export function ExpenseTracker({ event, isReadOnly = false }: { event: Event, isReadOnly?: boolean }) {
  const { deleteExpense } = useEvents();

  const handleDeleteExpense = async (expenseId: string) => {
    try {
        await deleteExpense(event.id, expenseId);
        toast({ title: "Expense Deleted", description: "The expense has been successfully removed." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete expense." });
    }
  };

  const totalExpenses = event.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-8">
      {!isReadOnly && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Record Expense</CardTitle>
              <CardDescription>Add a new expense for this event.</CardDescription>
            </CardHeader>
            <CardContent>
              <AddExpenseDialog event={event}>
                  <Button variant="outline" className="w-full"><PlusCircle/> Add New Expense</Button>
              </AddExpenseDialog>
            </CardContent>
          </Card>
      )}
      <div>
        <h3 className="text-2xl font-headline mb-4 flex items-center gap-2">
            <IndianRupee className="w-6 h-6" /> Expense Entries
        </h3>
        <Card>
          <div className="overflow-x-auto">
            <Table>
              {event.expenses.length === 0 && <TableCaption>No expenses recorded yet.</TableCaption>}
              <TableHeader>
                <TableRow>
                  <TableHead>Notes</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {!isReadOnly && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.expenses.map((expense) => (
                  <TableRow key={expense.id} className="animate-in fade-in-0">
                    <TableCell className="font-medium max-w-[200px] truncate">
                        {expense.notes || '-'}
                    </TableCell>
                     <TableCell>
                      <Badge variant={expense.transactionType === 'Bank' ? 'secondary' : 'outline'}>
                        {expense.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{format(new Date(expense.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right font-mono text-destructive/80 whitespace-nowrap">₹{expense.amount.toFixed(2)}</TableCell>
                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <AddExpenseDialog event={event} expenseToEdit={expense}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            </AddExpenseDialog>
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
                                    This will permanently delete this expense record. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteExpense(expense.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
              {event.expenses.length > 0 && (
                  <TableFooter>
                      <TableRow>
                          <TableCell colSpan={isReadOnly ? 3 : 4} className="text-right font-bold text-base md:text-lg">Total Expenses</TableCell>
                          <TableCell className="text-right font-bold font-mono text-base md:text-lg text-destructive/80 whitespace-nowrap">₹{totalExpenses.toFixed(2)}</TableCell>
                          {!isReadOnly && <TableCell></TableCell>}
                      </TableRow>
                  </TableFooter>
              )}
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
