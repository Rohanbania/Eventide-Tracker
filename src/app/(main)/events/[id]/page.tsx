
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEvents } from '@/contexts/EventContext';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { IncomeTracker } from '@/components/IncomeTracker';
import { ReportView } from '@/components/ReportView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, NotebookText, BarChart2, Sparkles, Pencil, Trash2, Gift, MoreVertical, IndianRupee, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { CreateEventDialog } from '@/components/CreateEventDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { DonationTracker } from '@/components/DonationTracker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { InviteCollaboratorDialog } from '@/components/InviteCollaboratorDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
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

  const isOwner = user?.uid === event?.userId;

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
    <TooltipProvider>
    <div className="container mx-auto px-4 py-8 animate-in fade-in-0">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-headline tracking-tighter">{event.name}</h1>
                 <p className="text-lg text-muted-foreground flex items-center gap-2 mt-2">
                  <Calendar className="w-5 h-5" />
                  {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}
                </p>
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Owned by {event.ownerName}</span>
                    <div className="flex items-center -space-x-2">
                        <Tooltip>
                            <TooltipTrigger>
                                <Avatar className="h-6 w-6 border-2 border-background">
                                    <AvatarFallback>{event.ownerName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{event.ownerName}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <InviteCollaboratorDialog event={event} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <CreateEventDialog eventToEdit={event}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Event
                          </DropdownMenuItem>
                      </CreateEventDialog>
                      {isOwner && (
                        <>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Event
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
                                    <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
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
    </div>
    </TooltipProvider>
  );
}
