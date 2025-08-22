'use server';

/**
 * @fileOverview Summarizes experience notes for an event using AI.
 *
 * - summarizeExperience - A function that handles the experience summarization process.
 * - SummarizeExperienceInput - The input type for the summarizeExperience function.
 * - SummarizeExperienceOutput - The return type for the summarizeExperience function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeExperienceInputSchema = z.object({
  experienceNotes: z
    .string()
    .describe('The experience notes to summarize for the event.'),
  eventName: z.string().describe('The name of the event.'),
});
export type SummarizeExperienceInput = z.infer<typeof SummarizeExperienceInputSchema>;

const SummarizeExperienceOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the experience notes.'),
});
export type SummarizeExperienceOutput = z.infer<typeof SummarizeExperienceOutputSchema>;

export async function summarizeExperience(input: SummarizeExperienceInput): Promise<SummarizeExperienceOutput> {
  return summarizeExperienceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeExperiencePrompt',
  input: {schema: SummarizeExperienceInputSchema},
  output: {schema: SummarizeExperienceOutputSchema},
  prompt: `You are an AI assistant helping to summarize experience notes for events.

  Summarize the experience notes for the event provided below, highlighting key takeaways and patterns.

  Event Name: {{{eventName}}}
  Experience Notes: {{{experienceNotes}}}
  Summary:
  `,
});

const summarizeExperienceFlow = ai.defineFlow(
  {
    name: 'summarizeExperienceFlow',
    inputSchema: SummarizeExperienceInputSchema,
    outputSchema: SummarizeExperienceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
