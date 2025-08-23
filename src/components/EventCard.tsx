
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar, IndianRupee, Wallet, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddExpenseSheet } from './AddExpenseSheet';
import { AddIncomeSheet } from './AddIncomeSheet';
import { Separator } from './ui/separator';
import { CreateEventDialog } from './CreateEventDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useEvents } from '@/contexts/EventContext';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { deleteEvent } = useEvents();
  const totalIncome = event.incomes.reduce((acc, income) => acc + income.amount, 0);
  const totalExpenses = event.expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const balance = totalIncome - totalExpenses;

  const handleDelete = async () => {
    try {
        await deleteEvent(event.id);
        toast({
            title: "Event Deleted",
            description: `"${event.name}" has been removed.`,
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete event.",
        });
    }
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg">
      <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="font-headline text-2xl tracking-wide leading-tight group">
                <Link href={`/events/${event.id}`} className="hover:underline">
                    {event.name}
                </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1">
                <Calendar className="w-4 h-4" />
                {format(parseISO(event.date), 'MMMM d, yyyy')}
            </CardDescription>
          </div>
           <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <CreateEventDialog eventToEdit={event}>
                         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                    </CreateEventDialog>
                    <DropdownMenuSeparator />
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                 <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete {event.name} and all its data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
      </CardHeader>
       <Link href={`/events/${event.id}`} className="block group flex-grow">
        <CardContent className="flex-grow space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="w-4 h-4 text-green-500" />
              <span>Total Income</span>
            </div>
            <span className="font-mono font-medium text-base">₹{totalIncome.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="w-4 h-4 text-red-500" />
              <span>Total Expenses</span>
            </div>
            <span className="font-mono font-medium text-base">₹{totalExpenses.toLocaleString('en-IN')}</span>
          </div>
          <div className="pt-2">
            <Separator />
          </div>
           <div className="flex justify-between items-center text-sm font-semibold pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
               <Wallet className={`w-4 h-4 ${balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
              <span>Balance</span>
            </div>
            <span className="font-mono text-base">₹{balance.toLocaleString('en-IN')}</span>
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
