
'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Notifications } from './Notifications';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="py-1 px-4 sm:px-6 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-lg font-headline group w-fit">
          <Sparkles className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
          <span className="bg-gradient-to-r from-primary-foreground to-muted-foreground bg-clip-text text-transparent">
            Eventide Tracker
          </span>
        </Link>
        <div className="flex items-center gap-4">
            <ThemeSwitcher />
            {user && (
            <>
              <Notifications />
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                      <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                  </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                      </p>
                      </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                      Log out
                  </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </>
            )}
        </div>
      </div>
    </header>
  );
}
