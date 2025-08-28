
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { Sparkles, Calendar, NotebookText, BarChart2, Gift, IndianRupee } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportView } from '@/components/ReportView';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { IncomeTracker } from '@/components/IncomeTracker';
import { DonationTracker } from '@/components/DonationTracker';
import Link from 'next/link';

export default function SharedEventPage() {
  const params = useParams();
  const eventId = typeof params.id === 'string' ? params.id : '';
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      setError('Event ID is missing.');
      return;
    }

    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() } as Event);
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="container mx-auto text-center py-20">
        <Sparkles className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-4">Loading event data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto text-center py-20">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }
  
  if (!event) {
     return (
       <div className="container mx-auto text-center py-20">
         <p className="text-muted-foreground">This event could not be loaded.</p>
       </div>
    )
  }
  
  const features = event.features || { expenses: true, income: true, donations: true };
  const defaultTab = features.expenses ? "expenses" : features.income ? "income" : features.donations ? "donations" : "reports";

  return (
    <div className="min-h-screen bg-background">
      <header className="py-2 px-4 sm:px-6 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-lg font-headline group w-fit">
            <Sparkles className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
            <span className="bg-gradient-to-r from-primary-foreground to-muted-foreground bg-clip-text text-transparent">
                Eventide Tracker
            </span>
            </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-headline tracking-tighter">{event.name}</h1>
                <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
                    <Calendar className="w-5 h-5" />
                    {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
                </p>
            </div>
            {event.description && (
                <p className="text-md text-foreground/80 mt-4 max-w-3xl">{event.description}</p>
            )}
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
            <div className="overflow-x-auto pb-2 mb-4">
                <TabsList className="inline-flex">
                    {features.expenses && <TabsTrigger value="expenses"><NotebookText className="w-4 h-4 mr-2" /> Expenses</TabsTrigger>}
                    {features.income && <TabsTrigger value="income"><IndianRupee className="w-4 h-4 mr-2" /> Income</TabsTrigger>}
                    {features.donations && <TabsTrigger value="donations"><Gift className="w-4 h-4 mr-2" /> Donations</TabsTrigger>}
                    <TabsTrigger value="reports">
                        <BarChart2 className="w-4 h-4 mr-2" /> Reports
                    </TabsTrigger>
                </TabsList>
            </div>
            
            {features.expenses && <TabsContent value="expenses"><ExpenseTracker event={event} /></TabsContent>}
            {features.income && <TabsContent value="income"><IncomeTracker event={event} /></TabsContent>}
            {features.donations && <TabsContent value="donations"><DonationTracker event={event} /></TabsContent>}

            <TabsContent value="reports">
                <ReportView event={event} />
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
