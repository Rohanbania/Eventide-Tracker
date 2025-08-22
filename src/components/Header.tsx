import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="py-4 px-6 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto">
        <Link href="/" className="flex items-center gap-3 text-2xl font-headline group w-fit">
          <Sparkles className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
          <span className="bg-gradient-to-r from-primary-foreground to-muted-foreground bg-clip-text text-transparent">
            Eventide Tracker
          </span>
        </Link>
      </div>
    </header>
  );
}
