
"use client";

import { useEvents } from '@/contexts/EventContext';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Gift, MoreVertical, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { AddDonationDialog } from './AddDonationDialog';

export function DonationTracker({ event }: { event: Event }) {
  const { deleteDonation } = useEvents();
  const donations = event.donations || [];

  const handleDeleteDonation = async (donationId: string) => {
    try {
        await deleteDonation(event.id, donationId);
        toast({ title: "Donation Deleted", description: "The donation has been successfully removed." });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete donation." });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Gift /> Record Donation</CardTitle>
            <CardDescription>Add a new donation for this event.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddDonationDialog event={event}>
                <Button variant="outline" className="w-full"><PlusCircle/> Add New Donation</Button>
            </AddDonationDialog>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <h3 className="text-2xl font-headline mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6" /> Donation Entries
        </h3>
        <Card>
          <div className="overflow-x-auto">
            <Table>
              {donations.length === 0 && <TableCaption>No donations recorded yet.</TableCaption>}
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Details / Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id} className="animate-in fade-in-0">
                    <TableCell className="font-medium max-w-[200px] sm:max-w-[150px] truncate">
                        <div className="flex flex-col">
                            <span className="truncate">{donation.source || '-'}</span>
                            <div className="sm:hidden text-xs text-muted-foreground space-x-2 mt-1">
                                <Badge variant={donation.donationType === 'Goods' ? 'default' : donation.donationType === 'Bank' ? 'secondary' : 'outline'}>
                                    {donation.donationType}
                                </Badge>
                                <span className="md:hidden">{format(new Date(donation.createdAt), 'MMM d')}</span>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant={donation.donationType === 'Goods' ? 'default' : donation.donationType === 'Bank' ? 'secondary' : 'outline'}>
                            {donation.donationType}
                        </Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                        {donation.donationType === 'Goods' 
                            ? <span className="text-sm text-muted-foreground">{donation.goods}</span>
                            : <span className="font-mono text-green-600">₹{donation.amount?.toFixed(2)}</span>
                        }
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap hidden md:table-cell">{format(new Date(donation.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <AddDonationDialog event={event} donationToEdit={donation}>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                             </DropdownMenuItem>
                          </AddDonationDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this donation record. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDonation(donation.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
