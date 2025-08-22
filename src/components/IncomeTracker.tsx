"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEvents } from '@/contexts/EventContext';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption, TableFooter } from '@/components/ui/table';
import { IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon } from "lucide-react"
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';

const formSchema = z.object({
  source: z.string().min(2, 'Source must be at least 2 characters.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  createdAt: z.date(),
  transactionType: z.enum(['Cash', 'Bank']),
});

export function IncomeTracker({ event }: { event: Event }) {
  const { addIncome } = useEvents();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { source: '', amount: 0, createdAt: new Date(), transactionType: 'Cash' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addIncome(event.id, values.source, values.amount, values.createdAt.toISOString(), values.transactionType);
    form.reset({ source: '', amount: 0, createdAt: new Date(), transactionType: 'Cash' });
  };
  
  const totalIncome = event.incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Record Income</CardTitle>
            <CardDescription>Add a new source of revenue from this event.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="transactionType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Transaction Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input type="number" step="0.01" placeholder="10000.00" className="pl-8" {...field} />
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
                <Button type="submit" className="w-full">
                  Add Income
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-2xl font-headline mb-4 flex items-center gap-2">
            <IndianRupee className="w-6 h-6" /> Income Entries
        </h3>
        <Card>
          <Table>
            {event.incomes.length === 0 && <TableCaption>No income recorded yet.</TableCaption>}
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.incomes.map((income) => (
                <TableRow key={income.id} className="animate-in fade-in-0">
                  <TableCell className="font-medium">{income.source}</TableCell>
                  <TableCell>
                    <Badge variant={income.transactionType === 'Bank' ? 'secondary' : 'outline'}>
                      {income.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(income.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right font-mono">₹{income.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3} className="font-bold text-lg">Total Income</TableCell>
                    <TableCell className="text-right font-bold font-mono text-lg">₹{totalIncome.toFixed(2)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </Card>
      </div>
    </div>
  );
}
