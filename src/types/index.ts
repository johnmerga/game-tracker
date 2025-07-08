import { z } from "zod";

export const GameDayHoursSchema = z.object({
  Date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  Hours: z.number().int().min(0),
});

export const GameDataSchema = z.object({
  Rank: z.number().int().min(1),
  GameName: z.string().min(1),
  CurrentPlayers: z.number().int().min(0),
  TotalHoursPlayed: z.number().int().min(0),
  HoursPlayed30Days: z.array(GameDayHoursSchema), // Array of daily hours objects
});

export const TopGamesResponseSchema = z.object({
  timestamp: z.string().datetime(), // ISO 8601 format
  games: z.array(GameDataSchema),
});

export const RedditMentionsSchema = z.object({
  Date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  Mentions: z.number().int().min(0),
});

export const RedditMentionsResponseSchema = z.object({
  gameName: z.string().min(1),
  timestamp: z.string().datetime(),
  mentions: z.array(RedditMentionsSchema),
});

export type GameDayHours = z.infer<typeof GameDayHoursSchema>;
export type GameData = z.infer<typeof GameDataSchema>;
export type TopGamesResponse = z.infer<typeof TopGamesResponseSchema>;
export type RedditMentions = z.infer<typeof RedditMentionsSchema>;
export type RedditMentionsResponse = z.infer<
  typeof RedditMentionsResponseSchema
>;

export const ErrorResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const GameNameParamSchema = z.object({
  gameName: z
    .string()
    .min(1, "Game name is required")
    .transform((s) => decodeURIComponent(s)),
});
