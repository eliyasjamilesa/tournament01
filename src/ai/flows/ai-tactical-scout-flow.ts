'use server';
/**
 * @fileOverview An AI-powered tactical scout that analyzes match types and game metadata
 * to provide specific drop-zone and weapon strategies.
 *
 * - aiTacticalScout - A function that handles the AI tactical scouting process.
 * - AiTacticalScoutInput - The input type for the aiTacticalScout function.
 * - AiTacticalScoutOutput - The return type for the aiTacticalScout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTacticalScoutInputSchema = z.object({
  matchType: z
    .string()
    .describe(
      'The type of match being played (e.g., BR E-sports, Clash Squad, Lone Wolf).'
    ),
  gameMetaData: z
    .string()
    .describe(
      'Current game metadata, including map details, player count, and other relevant game state information.'
    ),
});
export type AiTacticalScoutInput = z.infer<typeof AiTacticalScoutInputSchema>;

const AiTacticalScoutOutputSchema = z.object({
  dropZoneStrategy: z
    .string()
    .describe('Recommended drop-zone strategy based on the match and metadata.'),
  weaponStrategy: z
    .string()
    .describe('Recommended weapon strategy based on the match and metadata.'),
});
export type AiTacticalScoutOutput = z.infer<typeof AiTacticalScoutOutputSchema>;

export async function aiTacticalScout(
  input: AiTacticalScoutInput
): Promise<AiTacticalScoutOutput> {
  return aiTacticalScoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTacticalScoutPrompt',
  input: {schema: AiTacticalScoutInputSchema},
  output: {schema: AiTacticalScoutOutputSchema},
  prompt: `You are an expert tactical scout for the game Free Fire. Your goal is to provide precise and effective strategies for players based on the match type and current game metadata.

Analyze the following information:
Match Type: {{{matchType}}}
Game Metadata: {{{gameMetaData}}}

Based on this analysis, provide a detailed drop-zone strategy and a weapon strategy to maximize the player's chances of winning. Ensure your strategies are practical and actionable within the game context.`,
});

const aiTacticalScoutFlow = ai.defineFlow(
  {
    name: 'aiTacticalScoutFlow',
    inputSchema: AiTacticalScoutInputSchema,
    outputSchema: AiTacticalScoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
