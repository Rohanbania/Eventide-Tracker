'use client';

import { useEvents } from '@/contexts/EventContext';
import { EventCard } from '@/components/EventCard';
import { CreateEventDialog } from '@/components/CreateEventDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { events, loading } = useEvents();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline tracking-tight">Your Events</h1>
        <CreateEventDialog />
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-headline mb-2">No Events Yet</h2>
          <p className="text-muted-foreground mb-4">Get started by creating your first event.</p>
          <CreateEventDialog />
        </div>
      )}
    </div>
  );
}

const CardSkeleton = () => (
    <div className="p-4 border rounded-lg shadow space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
        </div>
         <div className="flex justify-between pt-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
        </div>
    </div>
)
