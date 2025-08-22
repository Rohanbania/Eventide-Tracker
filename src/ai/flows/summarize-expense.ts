'use server';

/**
 * @fileOverview Summarizes expense notes for an event using AI.
 *
 * - summarizeExpense - A function that handles the expense summarization process.
 * - SummarizeExpenseInput - The input type for the summarizeExpense function.
 * - SummarizeExpenseOutput - The return type for the summarizeExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeExpenseInputSchema = z.object({
  expenseNotes: z
    .string()
    .describe('The expense notes to summarize for the event.'),
  eventName: z.string().describe('The name of the event.'),
});
export type SummarizeExpenseInput = z.infer<typeof SummarizeExpenseInputSchema>;

const SummarizeExpenseOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the expense notes.'),
});
export type SummarizeExpenseOutput = z.infer<typeof SummarizeExpenseOutputSchema>;

export async function summarizeExpense(input: SummarizeExpenseInput): Promise<SummarizeExpenseOutput> {
  return summarizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeExpensePrompt',
  input: {schema: SummarizeExpenseInputSchema},
  output: {schema: SummarizeExpenseOutputSchema},
  prompt: `You are an AI assistant helping to summarize expense notes for events.

  Summarize the expense notes for the event provided below, highlighting key takeaways and patterns.

  Event Name: {{{eventName}}}
  Expense Notes: {{{expenseNotes}}}
  Summary:
  `,
});

const summarizeExpenseFlow = ai.defineFlow(
  {
    name: 'summarizeExpenseFlow',
    inputSchema: SummarizeExpenseInputSchema,
    outputSchema: SummarizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
