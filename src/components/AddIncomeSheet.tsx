"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEvents } from '@/contexts/EventContext';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { DollarSign } from 'lucide-react';

const formSchema = z.object({
  source: z.string().min(2, 'Source must be at least 2 characters.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
});

interface AddIncomeSheetProps {
  event: Event;
  children: React.ReactNode;
}

export function AddIncomeSheet({ event, children }: AddIncomeSheetProps) {
  const [open, setOpen] = useState(false);
  const { addIncome } = useEvents();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { source: '', amount: 0 },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addIncome(event.id, values.source, values.amount);
    form.reset({ source: '', amount: 0 });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline">Add Income for {event.name}</SheetTitle>
          <SheetDescription>Quickly add a new income source for this event.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-8">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Source</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Ticket Sales" {...field} />
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
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input type="number" step="0.01" placeholder="100.00" className="pl-8" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button type="submit" className="w-full">
                Save Income
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
