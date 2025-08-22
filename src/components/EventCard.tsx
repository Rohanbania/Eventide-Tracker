import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar, IndianRupee, Wallet } from 'lucide-react';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddExpenseSheet } from './AddExpenseSheet';
import { AddIncomeSheet } from './AddIncomeSheet';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const totalIncome = event.incomes.reduce((acc, income) => acc + income.amount, 0);
  const totalExpenses = event.expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg">
       <Link href={`/events/${event.id}`} className="block group flex-grow">
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
              <IndianRupee className="w-4 h-4 text-green-500" />
              <span>Total Income</span>
            </div>
            <Badge variant="secondary" className="font-mono text-base">₹{totalIncome.toLocaleString('en-IN')}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="w-4 h-4 text-red-500" />
              <span>Total Expenses</span>
            </div>
            <Badge variant="secondary" className="font-mono text-base">₹{totalExpenses.toLocaleString('en-IN')}</Badge>
          </div>
           <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
               <Wallet className={`w-4 h-4 ${balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
              <span>Balance</span>
            </div>
            <Badge variant="secondary" className="font-mono text-base">₹{balance.toLocaleString('en-IN')}</Badge>
          </div>
        </CardContent>
       </Link>
      <CardFooter className="flex-col items-stretch space-y-2">
         <Link href={`/events/${event.id}`} className="block group">
            <div className="flex items-center text-sm font-semibold text-primary-foreground/80 group-hover:text-accent-foreground">
                View Details
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
         </Link>
         <div className="flex gap-2 pt-2 border-t">
            <AddExpenseSheet event={event}>
                <Button variant="outline" size="sm" className="w-full">Add Expense</Button>
            </AddExpenseSheet>
            <AddIncomeSheet event={event}>
                <Button variant="outline" size="sm" className="w-full">Add Income</Button>
            </AddIncomeSheet>
         </div>
      </CardFooter>
    </Card>
  );
}
