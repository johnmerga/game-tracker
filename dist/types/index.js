"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameNameParamSchema = exports.ErrorResponseSchema = exports.RedditMentionsResponseSchema = exports.RedditMentionsSchema = exports.TopGamesResponseSchema = exports.GameDataSchema = exports.GameDayHoursSchema = void 0;
const zod_1 = require("zod");
exports.GameDayHoursSchema = zod_1.z.object({
    // Invalid Date, Last 30 Days
    Date: zod_1.z
        .string()
        .regex(/^\d{1,2}\/\d{1,2}\/\d{4}$/, "Date must be in MM/DD/YYYY format")
        .or(zod_1.z.literal("Last 30 Days", {
        description: "Special case for the last 30 days label",
    }))
        .or(zod_1.z.literal("Invalid Date", {
        description: "Special case for invalid date",
    })),
    Hours: zod_1.z
        .number()
        .int()
        .min(0)
        .or(zod_1.z.literal(null, {
        description: "Special case for no data (null)",
    }))
        .or(zod_1.z.literal(NaN, {
        description: "Special case for no data (NaN)",
    })),
});
exports.GameDataSchema = zod_1.z.object({
    Rank: zod_1.z.number().int().min(1),
    GameName: zod_1.z.string().min(1),
    CurrentPlayers: zod_1.z.number().int().min(0),
    TotalHoursPlayed: zod_1.z.number().int().min(0),
    HoursPlayed30Days: zod_1.z.array(exports.GameDayHoursSchema), // Array of daily hours objects
});
exports.TopGamesResponseSchema = zod_1.z.object({
    timestamp: zod_1.z.string().datetime(), // ISO 8601 format
    games: zod_1.z.array(exports.GameDataSchema),
});
exports.RedditMentionsSchema = zod_1.z.object({
    Date: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    Mentions: zod_1.z.number().int().min(0),
});
exports.RedditMentionsResponseSchema = zod_1.z.object({
    gameName: zod_1.z.string().min(1),
    timestamp: zod_1.z.string().datetime(),
    mentions: zod_1.z.array(exports.RedditMentionsSchema),
});
exports.ErrorResponseSchema = zod_1.z.object({
    status: zod_1.z.string(),
    message: zod_1.z.string(),
    details: zod_1.z.any().optional(),
});
exports.GameNameParamSchema = zod_1.z.object({
    gameName: zod_1.z
        .string()
        .min(1, "Game name is required")
        .transform((s) => decodeURIComponent(s)),
});
// testing
(async () => {
    try {
        // read from json
        const data = await require("../../data/top_games_20250709_024457.json");
        const validationResult = exports.TopGamesResponseSchema.safeParse(data);
        if (!validationResult.success) {
            console.error("Validation failed:", validationResult.error.errors);
        }
        else {
            console.log("Validation succeeded:", validationResult.data);
        }
    }
    catch (r) {
        console.error("Error reading or validating JSON:", r);
    }
})();
