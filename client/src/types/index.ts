import { z } from "zod";

// Zod schemas for validation
export const HoursPlayedSchema = z.object({
  Date: z.string(),
  Hours: z.number().nullable(),
});

export const GameSchema = z.object({
  Rank: z.number(),
  GameName: z.string(),
  CurrentPlayers: z.number(),
  TotalHoursPlayed: z.number(),
  HoursPlayed30Days: z.array(HoursPlayedSchema),
});

export const TopGamesSchema = z.object({
  timestamp: z.string(),
  games: z.array(GameSchema),
});

export const RedditMentionSchema = z.object({
  Date: z.string(),
  Mentions: z.number(),
});

export const RedditMentionsSchema = z.object({
  gameName: z.string(),
  timestamp: z.string(),
  mentions: z.array(RedditMentionSchema),
});

// TypeScript types
export type Game = z.infer<typeof GameSchema>;
export type RedditMentions = z.infer<typeof RedditMentionsSchema>;
export type TopGamesResponse = z.infer<typeof TopGamesSchema>;
