"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Event, Experience, Income } from '@/lib/types';
import { summarizeExperience } from '@/ai/flows/summarize-experience';
import { useToast } from '@/hooks/use-toast';

// Mock Data
const initialEvents: Event[] = [
  {
    id: '1',
    name: 'Art Fair Booth',
    date: '2024-08-15',
    experiences: [
      { id: 'exp1', notes: 'Great foot traffic in the morning. People loved the new landscape series.', rating: 5, createdAt: '2024-08-15T10:00:00Z' },
      { id: 'exp2', notes: 'Afternoon was slower. The corner spot might not be ideal. Consider a central location next time.', rating: 3, createdAt: '2024-08-15T14:30:00Z' },
    ],
    incomes: [
      { id: 'inc1', source: 'Painting Sale "Sunset"', amount: 450, date: '2024-08-15' },
      { id: 'inc2', source: 'Print Sales', amount: 120, date: '2024-08-15' },
    ],
    experienceSummary: 'The Art Fair Booth event had strong morning engagement, particularly with the new landscape series. However, the afternoon saw a decline in foot traffic, suggesting that the booth\'s corner location may have been a contributing factor. For future events, securing a more central spot could be beneficial for maintaining consistent visitor flow throughout the day.'
  },
  {
    id: '2',
    name: 'Local Music Gig',
    date: '2024-07-20',
    experiences: [
      { id: 'exp3', notes: 'The crowd was really into the new songs. Sound system was a bit muddy during the first set.', rating: 4, createdAt: '2024-07-20T21:00:00Z' },
    ],
    incomes: [
      { id: 'inc3', source: 'Ticket Sales', amount: 800, date: '2024-07-20' },
      { id: 'inc4', source: 'Merchandise', amount: 250, date: '2024-07-20' },
    ],
  },
];


interface EventContextType {
  events: Event[];
  getEventById: (id: string) => Event | undefined;
  addEvent: (name: string, date: string) => void;
  addExperience: (eventId: string, notes: string, rating: number) => void;
  addIncome: (eventId: string, source: string, amount: number) => void;
  generateExperienceSummary: (eventId: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const { toast } = useToast();

  const getEventById = useCallback((id: string) => {
    return events.find(event => event.id === id);
  }, [events]);

  const addEvent = (name: string, date: string) => {
    const newEvent: Event = {
      id: (Math.random() * 1000000).toString(),
      name,
      date,
      experiences: [],
      incomes: [],
    };
    setEvents(prevEvents => [newEvent, ...prevEvents]);
    toast({
      title: "Event Created!",
      description: `"${name}" has been added to your list.`,
    });
  };

  const addExperience = (eventId: string, notes: string, rating: number) => {
    const newExperience: Experience = {
      id: (Math.random() * 1000000).toString(),
      notes,
      rating,
      createdAt: new Date().toISOString(),
    };
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? { ...event, experiences: [newExperience, ...event.experiences] }
          : event
      )
    );
  };

  const addIncome = (eventId: string, source: string, amount: number) => {
    const newIncome: Income = {
      id: (Math.random() * 1000000).toString(),
      source,
      amount,
      date: new Date().toISOString().split('T')[0],
    };
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? { ...event, incomes: [newIncome, ...event.incomes] }
          : event
      )
    );
  };

  const generateExperienceSummary = async (eventId: string) => {
    const event = getEventById(eventId);
    if (!event || event.experiences.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No experiences to summarize.",
      });
      return;
    }

    try {
      const allNotes = event.experiences.map(e => `- ${e.notes} (Rating: ${e.rating}/5)`).join('\n');
      const result = await summarizeExperience({
        eventName: event.name,
        experienceNotes: allNotes,
      });

      setEvents(prevEvents =>
        prevEvents.map(e =>
          e.id === eventId ? { ...e, experienceSummary: result.summary } : e
        )
      );
      toast({
        title: "Summary Generated",
        description: "The AI summary has been successfully created.",
      });
    } catch (error) {
      console.error("Failed to generate summary:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not generate summary. Please try again later.",
      });
    }
  };

  const value = {
    events,
    getEventById,
    addEvent,
    addExperience,
    addIncome,
    generateExperienceSummary,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
