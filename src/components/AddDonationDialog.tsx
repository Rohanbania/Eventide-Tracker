
"use client";

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEvents } from '@/contexts/EventContext';
import type { Event, Donation, DonationType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Gift } from "lucide-react"
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const formSchema = z.object({
  source: z.string().min(2, 'Donor name must be at least 2 characters.'),
  donationType: z.enum(['Cash', 'Bank', 'Goods']),
  amount: z.coerce.number().positive().optional(),
  goods: z.string().optional(),
  createdAt: z.date(),
}).refine(data => {
    if (data.donationType === 'Goods') {
        return !!data.goods && data.goods.length > 0;
    }
    return data.amount !== undefined && data.amount > 0;
}, {
    message: "A valid amount or goods description is required.",
    path: ["amount"], // Show error on amount/goods field
});


interface AddDonationDialogProps {
  event: Event;
  donationToEdit?: Donation;
  children: React.ReactNode;
}

export function AddDonationDialog({ event, donationToEdit, children }: AddDonationDialogProps) {
  const [open, setOpen] = useState(false);
  const { addDonation, updateDonation } = useEvents();
  const isEditMode = !!donationToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
        source: '', 
        donationType: 'Cash', 
        amount: undefined,
        goods: '',
        createdAt: new Date() 
    },
  });

  const donationType = form.watch('donationType');

  useEffect(() => {
    if (open) {
        if (isEditMode && donationToEdit) {
            form.reset({
                source: donationToEdit.source,
                donationType: donationToEdit.donationType,
                amount: donationToEdit.amount,
                goods: donationToEdit.goods,
                createdAt: new Date(donationToEdit.createdAt),
            });
        } else {
            form.reset({ 
                source: '', 
                donationType: 'Cash', 
                amount: undefined,
                goods: '',
                createdAt: new Date() 
            });
        }
    }
  }, [donationToEdit, isEditMode, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const submissionData: Omit<Donation, 'id'> = {
        source: values.source,
        donationType: values.donationType,
        createdAt: values.createdAt.toISOString(),
        ...(values.donationType !== 'Goods' && { amount: values.amount }),
        ...(values.donationType === 'Goods' && { goods: values.goods }),
    };

    if (isEditMode && donationToEdit) {
        updateDonation(event.id, { ...submissionData, id: donationToEdit.id });
    } else {
        addDonation(event.id, submissionData);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Gift /> {isEditMode ? 'Edit' : 'Add'} Donation for {event.name}
          </DialogTitle>
          <DialogDescription>Record a new act of generosity for this event.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="donationType"
                render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>Donation Type</FormLabel>
                    <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="Cash" /></FormControl>
                            <FormLabel className="font-normal">Cash</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="Bank" /></FormControl>
                            <FormLabel className="font-normal">Bank</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="Goods" /></FormControl>
                            <FormLabel className="font-normal">Goods</FormLabel>
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
                  <FormLabel>Donor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Anonymous Supporter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {donationType === 'Goods' ? (
                <FormField
                control={form.control}
                name="goods"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Goods Description</FormLabel>
                    <FormControl>
                        <Textarea placeholder="e.g., 10 chairs, 5 tables" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            ) : (
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
            )}
            
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
            <DialogFooter>
              <Button type="submit" className="w-full">
                {isEditMode ? 'Save Changes' : 'Save Donation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
