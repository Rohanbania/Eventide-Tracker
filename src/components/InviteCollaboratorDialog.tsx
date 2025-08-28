
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEvents } from '@/contexts/EventContext';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

interface InviteCollaboratorDialogProps {
  event: Event;
}

export function InviteCollaboratorDialog({ event }: InviteCollaboratorDialogProps) {
  const [open, setOpen] = useState(false);
  const { addCollaborator, removeCollaborator } = useEvents();
  const { user } = useAuth();
  const isOwner = user?.uid === event.userId;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.email === user?.email) {
        toast({ variant: 'destructive', title: "Error", description: "You cannot invite yourself." });
        return;
    }
    if (event.collaborators?.includes(values.email)) {
        toast({ variant: 'destructive', title: "Error", description: "This user is already a collaborator." });
        return;
    }
    if (event.pendingCollaborators?.includes(values.email)) {
        toast({ variant: 'destructive', title: "Error", description: "This user has already been invited." });
        return;
    }
    
    addCollaborator(event.id, values.email);
    form.reset();
    setOpen(false);
  };
  
  const handleRemoveCollaborator = (emailToRemove: string) => {
    removeCollaborator(event.id, emailToRemove);
  };
  
  // Cannot invite collaborators if not the owner
  if (!isOwner) {
    return null;
  }

  const otherCollaborators = event.collaborators?.filter(c => c !== user?.email) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" /> Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Invite Collaborator</DialogTitle>
          <DialogDescription>
            Enter the email of the user you want to invite to collaborate on "{event.name}". They will receive a notification to accept or decline.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
            <div>
                <h4 className="text-sm font-medium mb-2">Current Collaborators</h4>
                 {otherCollaborators.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {otherCollaborators.map(email => (
                            <Badge key={email} variant="secondary" className="flex items-center gap-1">
                                {email}
                                {isOwner && (
                                    <button onClick={() => handleRemoveCollaborator(email)} className="ml-1 rounded-full hover:bg-destructive/20 p-0.5">
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Remove {email}</span>
                                    </button>
                                )}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">No other collaborators yet.</p>
                )}
            </div>
            {event.pendingCollaborators && event.pendingCollaborators.length > 0 && (
                 <div>
                    <h4 className="text-sm font-medium mb-2">Pending Invitations</h4>
                    <div className="flex flex-wrap gap-2">
                        {event.pendingCollaborators?.map(email => (
                            <Badge key={email} variant="outline">{email}</Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collaborator's Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Send Invitation</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
