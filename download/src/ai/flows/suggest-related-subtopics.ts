// A Genkit flow that suggests related subtopics for a given list of topics.

'use server';

/**
 * @fileOverview Suggests related subtopics for a given list of topics to help users expand on their ideas.
 *
 * - suggestRelatedSubtopics - A function that takes a list of topics and suggests related subtopics for each.
 * - SuggestRelatedSubtopicsInput - The input type for the suggestRelatedSubtopics function.
 * - SuggestRelatedSubtopicsOutput - The return type for the suggestRelatedSubtopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedSubtopicsInputSchema = z.object({
  topics: z.array(z.string()).describe('A list of topics to generate subtopics for.'),
});
export type SuggestRelatedSubtopicsInput = z.infer<
  typeof SuggestRelatedSubtopicsInputSchema
>;

const SuggestRelatedSubtopicsOutputSchema = z.object({
  suggestions: z.record(z.string(), z.array(z.string())).describe(
    'A map of topics to a list of suggested subtopics.'
  ),
});
export type SuggestRelatedSubtopicsOutput = z.infer<
  typeof SuggestRelatedSubtopicsOutputSchema
>;

export async function suggestRelatedSubtopics(
  input: SuggestRelatedSubtopicsInput
): Promise<SuggestRelatedSubtopicsOutput> {
  return suggestRelatedSubtopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedSubtopicsPrompt',
  input: {schema: SuggestRelatedSubtopicsInputSchema},
  output: {schema: SuggestRelatedSubtopicsOutputSchema},
  prompt: `You are an AI expert in mind mapping and brainstorming.

  Given the following list of topics, suggest related subtopics for each topic.  The subtopics should help the user expand their mind map and explore new connections.  Be creative and think outside the box.

  Topics:
  {{#each topics}}- {{this}}\n{{/each}}

  Format your response as a JSON object where each topic is a key, and the value is a list of suggested subtopics.
  `,
});

const suggestRelatedSubtopicsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedSubtopicsFlow',
    inputSchema: SuggestRelatedSubtopicsInputSchema,
    outputSchema: SuggestRelatedSubtopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
