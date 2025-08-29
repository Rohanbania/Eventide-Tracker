
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar, IndianRupee, Wallet, MoreVertical, Pencil, Trash2, Landmark, Coins, Gift } from 'lucide-react';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddExpenseDialog } from './AddExpenseDialog';
import { AddIncomeDialog } from './AddIncomeDialog';
import { Separator } from './ui/separator';
import { CreateEventDialog } from './CreateEventDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useEvents } from '@/contexts/EventContext';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AddDonationDialog } from './AddDonationDialog';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { deleteEvent } = useEvents();

  const cashIncomes = event.incomes.filter(i => i.transactionType === 'Cash').reduce((acc, i) => acc + i.amount, 0);
  const bankIncomes = event.incomes.filter(i => i.transactionType === 'Bank').reduce((acc, i) => acc + i.amount, 0);
  const totalIncome = cashIncomes + bankIncomes;

  const cashExpenses = event.expenses.filter(e => e.transactionType === 'Cash').reduce((acc, e) => acc + e.amount, 0);
  const bankExpenses = event.expenses.filter(e => e.transactionType === 'Bank').reduce((acc, e) => acc + e.amount, 0);
  const totalExpenses = cashExpenses + bankExpenses;
  
  const cashBalance = cashIncomes - cashExpenses;
  const bankBalance = bankIncomes - bankExpenses;
  const totalBalance = totalIncome - totalExpenses;

  const features = event.features || { expenses: true, income: true, donations: true };
  const enabledFeaturesCount = Object.values(features).filter(Boolean).length;


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
    <Card className="h-full flex flex-col transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/20 relative">
      <CardHeader className="flex-row items-start justify-between">
          <div className="flex-1">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
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
          <CardContent className="flex-grow space-y-4">
          <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                  <IndianRupee className="w-4 h-4 text-green-500" />
                  <span>Total Income</span>
              </div>
              <span className="font-mono font-medium text-base">₹{totalIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                  <IndianRupee className="w-4 h-4 text-red-500" />
                  <span>Total Expenses</span>
              </div>
              <span className="font-mono font-medium text-base">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2 text-sm font-semibold">
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                  <Coins className={`w-4 h-4 ${cashBalance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                  <span>Cash Balance</span>
                  </div>
                  <span className="font-mono text-base">₹{cashBalance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                  <Landmark className={`w-4 h-4 ${bankBalance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                  <span>Bank Balance</span>
                  </div>
                  <span className="font-mono text-base">₹{bankBalance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-dashed">
                  <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className={`w-4 h-4 ${totalBalance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                  <span>Total Balance</span>
                  </div>
                  <span className="font-mono text-base">₹{totalBalance.toLocaleString('en-IN')}</span>
              </div>
          </div>
          </CardContent>
      </Link>
      <CardFooter className="flex-col items-stretch space-y-2 pt-4">
          <Link href={`/events/${event.id}`} className="block group">
              <Button variant="link" className="p-0 h-auto justify-start text-sm font-semibold text-primary-foreground/80 group-hover:text-accent-foreground">
                  View Details
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
          </Link>
          <div className={cn(
              "grid gap-2 pt-2 border-t",
              `grid-cols-${enabledFeaturesCount}`
          )}>
              {features.expenses && <AddExpenseDialog event={event}><Button variant="outline" size="sm" className="w-full">Expense</Button></AddExpenseDialog>}
              {features.income && <AddIncomeDialog event={event}><Button variant="outline" size="sm" className="w-full">Income</Button></AddIncomeDialog>}
              {features.donations && <AddDonationDialog event={event}><Button variant="outline" size="sm" className="w-full"><Gift className="mr-1 h-4 w-4" />Donation</Button></AddDonationDialog>}
          </div>
      </CardFooter>
    </Card>
  );
}
