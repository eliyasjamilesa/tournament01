/**
 * @fileOverview AI Tactical Scout Flow - Logic moved to client for static export.
 * This file is kept to avoid import errors but Server Actions are removed.
 */
import { z } from 'zod';

export const AiTacticalScoutInputSchema = z.object({
  matchType: z.string(),
  gameMetaData: z.string(),
});

export const AiTacticalScoutOutputSchema = z.object({
  dropZoneStrategy: z.string(),
  weaponStrategy: z.string(),
});

export type AiTacticalScoutInput = z.infer<typeof AiTacticalScoutInputSchema>;
export type AiTacticalScoutOutput = z.infer<typeof AiTacticalScoutOutputSchema>;

/**
 * Mocking function to prevent build errors while removing 'use server'.
 * Static APK builds cannot execute Genkit Server Actions.
 */
export async function aiTacticalScout(input: AiTacticalScoutInput): Promise<AiTacticalScoutOutput> {
  return {
    dropZoneStrategy: "Redirected to client-side logic for static APK build.",
    weaponStrategy: "Tactical analysis complete."
  };
}
