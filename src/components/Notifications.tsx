
'use client';

import { useEvents } from "@/contexts/EventContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Bell, Check, X } from "lucide-react";
import { Separator } from "./ui/separator";

export function Notifications() {
    const { pendingInvitations, acceptInvitation, declineInvitation } = useEvents();
    const { user } = useAuth();

    if (!user || pendingInvitations.length === 0) {
        return null;
    }

    const handleAccept = (eventId: string) => {
        if (!user?.email) return;
        acceptInvitation(eventId, user.email);
    };

    const handleDecline = (eventId: string) => {
        if (!user?.email) return;
        declineInvitation(eventId, user.email);
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell />
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {pendingInvitations.length}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-4">
                    <h4 className="font-medium text-sm">Invitations</h4>
                </div>
                <Separator />
                <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
                    {pendingInvitations.map(event => (
                        <div key={event.id} className="p-2 rounded-md hover:bg-muted">
                            <p className="text-sm">
                                <span className="font-semibold">{event.ownerName}</span> has invited you to collaborate on <span className="font-semibold">{event.name}</span>.
                            </p>
                            <div className="flex justify-end gap-2 mt-2">
                                <Button size="sm" variant="outline" onClick={() => handleDecline(event.id)}>
                                    <X className="h-4 w-4 mr-1" /> Decline
                                </Button>
                                <Button size="sm" onClick={() => handleAccept(event.id)}>
                                    <Check className="h-4 w-4 mr-1" /> Accept
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
