import { EventProvider } from '@/contexts/EventContext';
import { Header } from '@/components/Header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EventProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
      </div>
    </EventProvider>
  );
}
