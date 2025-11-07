// src/ai/flows/generate-schedule-suggestions.ts
'use server';

/**
 * @fileOverview Generates schedule suggestions based on completed courses, preferences, and course prerequisites.
 *
 * - generateScheduleSuggestions - A function that generates schedule suggestions.
 * - GenerateScheduleSuggestionsInput - The input type for the generateScheduleSuggestions function.
 * - GenerateScheduleSuggestionsOutput - The return type for the generateScheduleSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScheduleSuggestionsInputSchema = z.object({
  completedCourses: z.array(z.string()).describe('List of course codes that the student has already completed.'),
  coursesToAvoid: z.array(z.string()).describe('List of course codes that the student wants to avoid in the generated schedules.'),
  allCourses: z.array(z.object({
    _re: z.string(), // Course code
    _di: z.string(), // Course name
    _se: z.number(), // Semester
    _pr: z.array(z.string()), // Prerequisites
    _ho: z.array(z.array(z.number())), //schedule
    _da: z.array(z.array(z.string()).nullable()).nullable(), //custom schedule
    _cu: z.string(), // Course id
  })).describe('All available courses with their details, including prerequisites and schedule information.'),
  targetNumberOfSchedules: z.number().default(10).describe('The number of schedule suggestions to generate.'),
});

export type GenerateScheduleSuggestionsInput = z.infer<typeof GenerateScheduleSuggestionsInputSchema>;

const GenerateScheduleSuggestionsOutputSchema = z.array(z.object({
  courseCodes: z.array(z.string()).describe('List of course codes included in this suggested schedule.'),
}));

export type GenerateScheduleSuggestionsOutput = z.infer<typeof GenerateScheduleSuggestionsOutputSchema>;

export async function generateScheduleSuggestions(input: GenerateScheduleSuggestionsInput): Promise<GenerateScheduleSuggestionsOutput> {
  return generateScheduleSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScheduleSuggestionsPrompt',
  input: {schema: GenerateScheduleSuggestionsInputSchema},
  output: {schema: GenerateScheduleSuggestionsOutputSchema},
  prompt: `You are a helpful assistant that suggests possible course schedules to students.

  Consider the following information when generating schedules:

  - The student has already completed the following courses: {{{completedCourses}}}
  - The student wants to avoid the following courses: {{{coursesToAvoid}}}
  - All available courses are: {{{allCourses}}}

  Generate a maximum of {{{targetNumberOfSchedules}}} possible schedules for the student, taking into account prerequisites and courses to avoid.
  Return an array of objects. Each object should have a "courseCodes" field that is an array of the courses in that schedule. Make sure the schedule only contains valid courses from the "allCourses" list. Ensure all prerequisites are met for all courses in the schedule.
  If _da is null, use the default time in _ho, otherwise use the custom time in _da.
  Make sure there are no time conflicts in the schedule.  Do not repeat schedules. Ensure all schedules are unique.
  Ensure that course codes are added to the "courseCodes" field.
  Be concise. Do not explain the schedules, simply return the JSON data.
  `,
});

const generateScheduleSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateScheduleSuggestionsFlow',
    inputSchema: GenerateScheduleSuggestionsInputSchema,
    outputSchema: GenerateScheduleSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
