// A Genkit Flow that automatically generates a mind map structure from a text input.

'use server';

/**
 * @fileOverview A Genkit Flow that automatically generates a mind map structure from a text input.
 *
 * - generateMindMapStructure - A function that generates a mind map structure from a text input.
 * - GenerateMindMapStructureInput - The input type for the generateMindMapStructure function.
 * - GenerateMindMapStructureOutput - The return type for the generateMindMapStructure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMindMapStructureInputSchema = z.object({
  text: z.string().describe('The text input to generate the mind map structure from.'),
});

export type GenerateMindMapStructureInput = z.infer<
  typeof GenerateMindMapStructureInputSchema
>;

const GenerateMindMapStructureOutputSchema = z.object({
  mindMapStructure: z
    .string()
    .describe('The generated mind map structure in a text format.'),
});

export type GenerateMindMapStructureOutput = z.infer<
  typeof GenerateMindMapStructureOutputSchema
>;

export async function generateMindMapStructure(
  input: GenerateMindMapStructureInput
): Promise<GenerateMindMapStructureOutput> {
  return generateMindMapStructureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMindMapStructurePrompt',
  input: {schema: GenerateMindMapStructureInputSchema},
  output: {schema: GenerateMindMapStructureOutputSchema},
  prompt: `You are an AI expert in generating mind map structures.

  Based on the following text, generate a mind map structure in a text format that can be easily parsed. Structure it so that the central topic is the root and subtopics are branches.

  Text: {{{text}}}
  `,
});

const generateMindMapStructureFlow = ai.defineFlow(
  {
    name: 'generateMindMapStructureFlow',
    inputSchema: GenerateMindMapStructureInputSchema,
    outputSchema: GenerateMindMapStructureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
