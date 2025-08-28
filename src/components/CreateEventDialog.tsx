
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { useEvents } from '@/contexts/EventContext';
import { useEffect, useState } from 'react';
import { Textarea } from './ui/textarea';
import type { Event } from '@/lib/types';
import { Checkbox } from './ui/checkbox';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Event name must be at least 2 characters.',
  }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date.',
  }),
  description: z.string().optional(),
  features: z.object({
    expenses: z.boolean().default(true),
    income: z.boolean().default(true),
    donations: z.boolean().default(false),
  })
});

interface CreateEventDialogProps {
    eventToEdit?: Event;
    children?: React.ReactNode;
}

const featureItems = [
    { id: 'expenses', label: 'Track Expenses' },
    { id: 'income', label: 'Track Income' },
    { id: 'donations', label: 'Track Donations' },
] as const;


export function CreateEventDialog({ eventToEdit, children }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const { addEvent, updateEvent } = useEvents();
  const isEditMode = !!eventToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      features: {
        expenses: true,
        income: true,
        donations: true,
      }
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && eventToEdit) {
        form.reset({
          name: eventToEdit.name,
          date: eventToEdit.date.split('T')[0],
          description: eventToEdit.description || '',
          features: eventToEdit.features || { expenses: true, income: true, donations: true },
        });
      } else {
          form.reset({
              name: '',
              date: new Date().toISOString().split('T')[0],
              description: '',
              features: {
                expenses: true,
                income: true,
                donations: true,
              }
          });
      }
    }
  }, [eventToEdit, isEditMode, form, open]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEditMode && eventToEdit) {
      updateEvent(eventToEdit.id, values);
    } else {
      addEvent(values);
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? children : (
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Event
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditMode ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for your event.' : "Add a new event to your tracker. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Summer Art Festival" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your event..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
                <div className="mb-4">
                    <FormLabel className="text-base">Event Features</FormLabel>
                    <FormDescription>
                        Select the modules you want to enable for this event.
                    </FormDescription>
                </div>
                {featureItems.map((item) => (
                <FormField
                    key={item.id}
                    control={form.control}
                    name={`features.${item.id}`}
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted">
                        <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                        <FormLabel className="font-normal">{item.label}</FormLabel>
                    </FormItem>
                    )}
                />
                ))}
            </FormItem>

            <DialogFooter>
              <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Event'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
