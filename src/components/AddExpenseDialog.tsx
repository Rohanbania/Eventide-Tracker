
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEvents } from '@/contexts/EventContext';
import type { Event, Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, IndianRupee } from "lucide-react"
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const formSchema = z.object({
  notes: z.string().optional(),
  amount: z.coerce.number({invalid_type_error: "Amount is required"}).positive('Amount must be a positive number.'),
  createdAt: z.date(),
  transactionType: z.enum(['Cash', 'Bank']),
});

interface AddExpenseDialogProps {
  event: Event;
  expenseToEdit?: Expense;
  children: React.ReactNode;
}

export function AddExpenseDialog({ event, expenseToEdit, children }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const { addExpense, updateExpense } = useEvents();
  const isEditMode = !!expenseToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { notes: '', amount: undefined, createdAt: new Date(), transactionType: 'Cash' },
  });

  useEffect(() => {
    if (open) {
        if (isEditMode && expenseToEdit) {
            form.reset({
                notes: expenseToEdit.notes,
                amount: expenseToEdit.amount,
                createdAt: new Date(expenseToEdit.createdAt),
                transactionType: expenseToEdit.transactionType,
            });
        } else {
            form.reset({ notes: '', amount: undefined, createdAt: new Date(), transactionType: 'Cash' });
        }
    }
  }, [expenseToEdit, isEditMode, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditMode && expenseToEdit) {
        const updatedExpense: Expense = {
            ...expenseToEdit,
            ...values,
            createdAt: values.createdAt.toISOString()
        };
        updateExpense(event.id, updatedExpense);
    } else {
        addExpense(event.id, values.notes || '', values.amount, values.createdAt.toISOString(), values.transactionType);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2"><IndianRupee /> {isEditMode ? 'Edit' : 'Add'} Expense for {event.name}</DialogTitle>
          <DialogDescription>Quickly {isEditMode ? 'update' : 'add'} an expense for this event.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Cash" />
                        </FormControl>
                        <FormLabel className="font-normal">Cash</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Bank" />
                        </FormControl>
                        <FormLabel className="font-normal">Bank</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input type="number" step="0.01" placeholder="5000.00" className="pl-8" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} value={field.value ?? ''} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Booth rental fee" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full">
                {isEditMode ? 'Save Changes' : 'Save Expense'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
