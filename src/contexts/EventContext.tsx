"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import type { Event, Expense, Income } from '@/lib/types';
import { summarizeExpense } from '@/ai/flows/summarize-expense';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';

interface EventContextType {
  events: Event[];
  loading: boolean;
  getEventById: (id: string) => Event | undefined;
  addEvent: (name: string, date: string, description?: string) => Promise<void>;
  addExpense: (eventId: string, notes: string, amount: number) => Promise<void>;
  addIncome: (eventId: string, source: string, amount: number) => Promise<void>;
  generateExpenseSummary: (eventId: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLoading(true);
      const q = query(collection(db, "events"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
          userEvents.push({ id: doc.id, ...doc.data() } as Event);
        });
        setEvents(userEvents);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching events:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not fetch events."});
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setEvents([]);
      setLoading(false);
    }
  }, [user, toast]);

  const getEventById = useCallback((id: string) => {
    return events.find(event => event.id === id);
  }, [events]);

  const addEvent = async (name: string, date: string, description?: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "events"), {
        userId: user.uid,
        name,
        date,
        description,
        expenses: [],
        incomes: [],
        createdAt: Timestamp.now(),
      });
      toast({
        title: "Event Created!",
        description: `"${name}" has been added to your list.`,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not create event."});
    }
  };

  const addExpense = async (eventId: string, notes: string, amount: number) => {
    const event = getEventById(eventId);
    if (!event) return;

    const newExpense: Expense = {
      id: (Math.random() * 1000000).toString(),
      notes,
      amount,
      createdAt: new Date().toISOString(),
    };
    
    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, {
            expenses: [newExpense, ...event.expenses]
        });
    } catch (error) {
        console.error("Error adding expense:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not add expense."});
    }
  };

  const addIncome = async (eventId: string, source: string, amount: number) => {
    const event = getEventById(eventId);
    if (!event) return;
    
    const newIncome: Income = {
      id: (Math.random() * 1000000).toString(),
      source,
      amount,
      date: new Date().toISOString().split('T')[0],
    };

    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, {
            incomes: [newIncome, ...event.incomes]
        });
    } catch(error) {
        console.error("Error adding income:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not add income."});
    }
  };

  const generateExpenseSummary = async (eventId: string) => {
    const event = getEventById(eventId);
    if (!event || event.expenses.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No expenses to summarize.",
      });
      return;
    }

    try {
      const allNotes = event.expenses.map(e => `- ${e.notes} (Amount: $${e.amount})`).join('\n');
      const result = await summarizeExpense({
        eventName: event.name,
        expenseNotes: allNotes,
      });

      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        expenseSummary: result.summary
      });

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
    loading,
    getEventById,
    addEvent,
    addExpense,
    addIncome,
    generateExpenseSummary,
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
