'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEvents } from '@/contexts/EventContext';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { IncomeTracker } from '@/components/IncomeTracker';
import { ReportView } from '@/components/ReportView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, NotebookText, DollarSign, BarChart2, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getEventById, loading } = useEvents();
  const eventId = typeof params.id === 'string' ? params.id : '';
  const event = getEventById(eventId);

  useEffect(() => {
    // If events are loaded and the specific event is not found, redirect.
    if (!loading && !event) {
      router.push('/');
    }
  }, [event, loading, router]);


  if (loading || !event) {
    return (
       <div className="container mx-auto text-center py-20">
         <Sparkles className="w-12 h-12 animate-spin text-primary mx-auto" />
         <p className="text-muted-foreground mt-4">Loading event data...</p>
       </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in-0">
      <div className="mb-8">
        <h1 className="text-5xl font-headline tracking-tighter">{event.name}</h1>
        <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
          <Calendar className="w-5 h-5" />
          {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-fit md:grid-cols-3 mb-6">
          <TabsTrigger value="expenses">
            <NotebookText className="w-4 h-4 mr-2" /> Expenses
          </TabsTrigger>
          <TabsTrigger value="income">
            <DollarSign className="w-4 h-4 mr-2" /> Income
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart2 className="w-4 h-4 mr-2" /> Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="expenses">
          <ExpenseTracker event={event} />
        </TabsContent>
        <TabsContent value="income">
          <IncomeTracker event={event} />
        </TabsContent>
        <TabsContent value="reports">
          <ReportView event={event} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
