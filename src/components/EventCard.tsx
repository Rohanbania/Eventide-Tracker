import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const totalIncome = event.incomes.reduce((acc, income) => acc + income.amount, 0);

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <CardTitle className="font-headline text-2xl tracking-wide">{event.name}</CardTitle>
          <CardDescription className="flex items-center gap-2 pt-1">
            <Calendar className="w-4 h-4" />
            {format(parseISO(event.date), 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span>Total Income</span>
            </div>
            <Badge variant="secondary" className="font-mono text-base">${totalIncome.toLocaleString()}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Expenses</span>
            </div>
            <Badge variant="secondary" className="font-mono text-base">{event.expenses.length}</Badge>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center text-sm font-semibold text-primary-foreground/80 group-hover:text-accent-foreground">
            View Details
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
