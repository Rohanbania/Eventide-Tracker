
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEvents } from '@/contexts/EventContext';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { IncomeTracker } from '@/components/IncomeTracker';
import { ReportView } from '@/components/ReportView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, NotebookText, DollarSign, BarChart2, Sparkles, Pencil, Trash2, Gift } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { CreateEventDialog } from '@/components/CreateEventDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { DonationTracker } from '@/components/DonationTracker';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getEventById, loading, deleteEvent } = useEvents();
  const eventId = typeof params.id === 'string' ? params.id : '';
  const event = getEventById(eventId);

  useEffect(() => {
    // If events are loaded and the specific event is not found, redirect.
    if (!loading && !event) {
      router.push('/');
    }
  }, [event, loading, router]);
  
  const handleDeleteEvent = async () => {
    if (!event) return;
    try {
      await deleteEvent(event.id);
      toast({
        title: "Event Deleted",
        description: `"${event.name}" has been successfully deleted.`,
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the event.",
      });
    }
  };


  if (loading || !event) {
    return (
       <div className="container mx-auto text-center py-20">
         <Sparkles className="w-12 h-12 animate-spin text-primary mx-auto" />
         <p className="text-muted-foreground mt-4">Loading event data...</p>
       </div>
    )
  }
  
  const features = event.features || { expenses: true, income: true, donations: true };
  const defaultTab = features.expenses ? "expenses" : features.income ? "income" : features.donations ? "donations" : "reports";


  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in-0">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-headline tracking-tighter">{event.name}</h1>
                 <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
                  <Calendar className="w-5 h-5" />
                  {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
                </p>
            </div>
        </div>
        {event.description && (
          <p className="text-md text-foreground/80 mt-4 max-w-3xl">{event.description}</p>
        )}
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full overflow-x-auto justify-start md:w-auto md:grid md:grid-cols-4 mb-6">
          {features.expenses && <TabsTrigger value="expenses"><NotebookText className="w-4 h-4 mr-2" /> Expenses</TabsTrigger>}
          {features.income && <TabsTrigger value="income"><DollarSign className="w-4 h-4 mr-2" /> Income</TabsTrigger>}
          {features.donations && <TabsTrigger value="donations"><Gift className="w-4 h-4 mr-2" /> Donations</TabsTrigger>}
          <TabsTrigger value="reports">
            <BarChart2 className="w-4 h-4 mr-2" /> Reports
          </TabsTrigger>
        </TabsList>
        
        {features.expenses && <TabsContent value="expenses"><ExpenseTracker event={event} /></TabsContent>}
        {features.income && <TabsContent value="income"><IncomeTracker event={event} /></TabsContent>}
        {features.donations && <TabsContent value="donations"><DonationTracker event={event} /></TabsContent>}

        <TabsContent value="reports">
          <ReportView event={event} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
