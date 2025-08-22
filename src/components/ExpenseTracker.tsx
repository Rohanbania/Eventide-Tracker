"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEvents } from '@/contexts/EventContext';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MessageSquare, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const formSchema = z.object({
  notes: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
});

export function ExpenseTracker({ event }: { event: Event }) {
  const { addExpense } = useEvents();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { notes: '', amount: 0 },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addExpense(event.id, values.notes || '', values.amount);
    form.reset({ notes: '', amount: 0 });
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Record Expense</CardTitle>
            <CardDescription>Add a new note or observation about this event.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input type="number" step="0.01" placeholder="50.00" className="pl-8" {...field} />
                        </div>
                      </FormControl>
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
                        <Textarea placeholder="e.g., Booth rental fee" {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Add Expense
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-2xl font-headline mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" /> Recorded Expenses
        </h3>
        <div className="space-y-4">
          {event.expenses.length > 0 ? (
            event.expenses.map((exp) => (
              <Card key={exp.id} className="animate-in fade-in-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      {exp.notes && <p className="text-card-foreground pr-4">{exp.notes}</p>}
                       <p className={`text-xs text-muted-foreground ${exp.notes ? 'mt-2' : ''}`}>
                        {formatDistanceToNow(new Date(exp.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-lg font-semibold text-destructive/80">${exp.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground py-8 text-center">No expenses recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
