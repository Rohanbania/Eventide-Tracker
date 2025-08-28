
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';
import type { Event, Expense, Income, TransactionType, Donation } from '@/lib/types';
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
  updateEvent: (eventId: string, name: string, date: string, description?: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  addExpense: (eventId: string, notes: string, amount: number, createdAt: string, transactionType: TransactionType) => Promise<void>;
  updateExpense: (eventId: string, expense: Expense) => Promise<void>;
  deleteExpense: (eventId: string, expenseId: string) => Promise<void>;
  addIncome: (eventId: string, source: string, amount: number, createdAt: string, transactionType: TransactionType) => Promise<void>;
  updateIncome: (eventId: string, income: Income) => Promise<void>;
  deleteIncome: (eventId: string, incomeId: string) => Promise<void>;
  addDonation: (eventId: string, donation: Omit<Donation, 'id'>) => Promise<void>;
  updateDonation: (eventId: string, donation: Donation) => Promise<void>;
  deleteDonation: (eventId: string, donationId: string) => Promise<void>;
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
          const data = doc.data();
          userEvents.push({ 
              id: doc.id, 
              ...data,
              donations: data.donations || [], // Ensure donations array exists
          } as Event);
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
        donations: [],
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

  const updateEvent = async (eventId: string, name: string, date: string, description?: string) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, { name, date, description });
      toast({
        title: "Event Updated",
        description: "Your event details have been saved.",
      });
    } catch (error) {
      console.error("Error updating event:", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not update event."});
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "events", eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not delete event."});
      throw error;
    }
  };

  const addExpense = async (eventId: string, notes: string, amount: number, createdAt: string, transactionType: TransactionType) => {
    const event = getEventById(eventId);
    if (!event) return;

    const newExpense: Expense = {
      id: doc(collection(db, "dummy")).id, // Generate a unique ID
      notes,
      amount,
      createdAt,
      transactionType,
    };
    
    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, {
            expenses: [newExpense, ...event.expenses]
        });
        toast({ title: "Expense Added", description: "Your expense has been recorded." });
    } catch (error) {
        console.error("Error adding expense:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not add expense."});
    }
  };

  const updateExpense = async (eventId: string, updatedExpense: Expense) => {
    const event = getEventById(eventId);
    if (!event) return;

    const updatedExpenses = event.expenses.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
    );

    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, { expenses: updatedExpenses });
        toast({ title: "Expense Updated", description: "Your expense has been successfully updated." });
    } catch (error) {
        console.error("Error updating expense:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not update expense." });
    }
  };

  const deleteExpense = async (eventId: string, expenseId: string) => {
    const event = getEventById(eventId);
    if (!event) return;

    const updatedExpenses = event.expenses.filter(expense => expense.id !== expenseId);

    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, { expenses: updatedExpenses });
    } catch (error) {
        console.error("Error deleting expense:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not delete expense." });
        throw error;
    }
  };


  const addIncome = async (eventId: string, source: string, amount: number, createdAt: string, transactionType: TransactionType) => {
    const event = getEventById(eventId);
    if (!event) return;
    
    const newIncome: Income = {
      id: doc(collection(db, "dummy")).id, // Generate a unique ID
      source,
      amount,
      createdAt,
      transactionType,
    };

    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, {
            incomes: [newIncome, ...event.incomes]
        });
        toast({ title: "Income Added", description: "Your income has been recorded." });
    } catch(error) {
        console.error("Error adding income:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not add income."});
    }
  };

  const updateIncome = async (eventId: string, updatedIncome: Income) => {
    const event = getEventById(eventId);
    if (!event) return;

    const updatedIncomes = event.incomes.map(income =>
        income.id === updatedIncome.id ? updatedIncome : income
    );

    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, { incomes: updatedIncomes });
        toast({ title: "Income Updated", description: "Your income has been successfully updated." });
    } catch (error) {
        console.error("Error updating income:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not update income." });
    }
  };

  const deleteIncome = async (eventId: string, incomeId: string) => {
    const event = getEventById(eventId);
    if (!event) return;

    const updatedIncomes = event.incomes.filter(income => income.id !== incomeId);

    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, { incomes: updatedIncomes });
    } catch (error) {
        console.error("Error deleting income:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not delete income." });
        throw error;
    }
  };

  const addDonation = async (eventId: string, donationData: Omit<Donation, 'id'>) => {
    const event = getEventById(eventId);
    if (!event) return;

    const newDonation: Donation = {
        id: doc(collection(db, "dummy")).id,
        ...donationData,
    };

    try {
        const eventRef = doc(db, "events", eventId);
        const currentDonations = event.donations || [];
        await updateDoc(eventRef, {
            donations: [newDonation, ...currentDonations]
        });
        toast({ title: "Donation Added", description: "Your donation has been recorded." });
    } catch (error) {
        console.error("Error adding donation:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not add donation." });
    }
};

const updateDonation = async (eventId: string, updatedDonation: Donation) => {
    const event = getEventById(eventId);
    if (!event) return;

    const updatedDonations = (event.donations || []).map(donation =>
        donation.id === updatedDonation.id ? updatedDonation : donation
    );

    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, { donations: updatedDonations });
        toast({ title: "Donation Updated", description: "The donation has been successfully updated." });
    } catch (error) {
        console.error("Error updating donation:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not update the donation." });
    }
};

const deleteDonation = async (eventId: string, donationId: string) => {
    const event = getEventById(eventId);
    if (!event) return;

    const updatedDonations = (event.donations || []).filter(donation => donation.id !== donationId);

    try {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, { donations: updatedDonations });
        toast({ title: "Donation Deleted", description: "The donation has been removed." });
    } catch (error) {
        console.error("Error deleting donation:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not delete the donation." });
        throw error;
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
    updateEvent,
    deleteEvent,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    addDonation,
    updateDonation,
    deleteDonation,
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
