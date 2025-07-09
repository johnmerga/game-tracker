"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const topGamesCache_1 = require("./cache/topGamesCache");
const redditScraper_1 = require("./scrapers/redditScraper");
const fileHandler_1 = require("./utils/fileHandler");
const validation_1 = require("./utils/validation");
const types_1 = require("./types");
process.loadEnvFile();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((err, req, res, next) => {
    console.error("[Global Error Handler] Uncaught error:", err.stack);
    const errorResponse = {
        status: "error",
        message: "An unexpected server error occurred.",
        details: err.message,
    };
    res.status(500).json(errorResponse);
});
app.get("/api/top-games", async (req, res) => {
    try {
        const games = await (0, topGamesCache_1.getCachedTopGames)();
        const responseData = {
            timestamp: new Date().toISOString(),
            games: games,
        };
        const validationResult = types_1.TopGamesResponseSchema.safeParse(responseData);
        if (!validationResult.success) {
            console.error("[API Error] TopGamesResponse validation failed:", validationResult.error.errors);
            const errorResponse = {
                status: "error",
                message: "Internal server error: Data format mismatch.",
                details: validationResult.error.errors,
            };
            return res.status(500).json(errorResponse);
        }
        res.status(200).json(validationResult.data);
    }
    catch (error) {
        console.error("[API Error] Failed to get top games:", error);
        const errorResponse = {
            status: "error",
            message: "Failed to retrieve top games data.",
            details: error.message,
        };
        res.status(500).json(errorResponse);
    }
});
// get /api/reddit-mentions/:gameName
app.get("/api/reddit-mentions/:gameName", async (req, res) => {
    const { gameName } = req.params;
    const validationResult = (0, validation_1.validateGameNameParam)(gameName);
    if (!validationResult.success) {
        return res
            .status(400)
            .json((0, validation_1.formatValidationError)(validationResult.error));
    }
    const decodedGameName = validationResult.data?.gameName;
    if (!decodedGameName) {
        const errorResponse = {
            status: "error",
            message: "Game name is required.",
        };
        return res.status(400).json(errorResponse);
    }
    try {
        const mentions = await (0, redditScraper_1.getRedditMentions)(decodedGameName);
        const responseData = {
            gameName: decodedGameName,
            timestamp: new Date().toISOString(),
            mentions: mentions,
        };
        const validationResultSchema = types_1.RedditMentionsResponseSchema.safeParse(responseData);
        if (!validationResultSchema.success) {
            console.error("[API Error] RedditMentionsResponse validation failed:", validationResultSchema.error.errors);
            const errorResponse = {
                status: "error",
                message: "Internal server error: Data format mismatch for Reddit mentions.",
                details: validationResultSchema.error.errors,
            };
            return res.status(500).json(errorResponse);
        }
        // export the data locally
        const cleanedGameName = decodedGameName
            .replace(/[^a-zA-Z0-9_ -]/g, "")
            .replace(/ /g, "_")
            .toLowerCase();
        (0, fileHandler_1.saveRedditMentionsToCsv)(`reddit_mentions_${cleanedGameName}`, mentions);
        res.status(200).json(validationResultSchema.data);
    }
    catch (error) {
        console.error(`[API Error] Failed to get Reddit mentions for ${decodedGameName}:`, error);
        const errorResponse = {
            status: "error",
            message: `Failed to retrieve Reddit mentions for ${decodedGameName}.`,
            details: error.message,
        };
        res.status(500).json(errorResponse);
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Access top games data at: http://localhost:${PORT}/api/top-games`);
    console.log(`Access Reddit mentions at: http://localhost:${PORT}/api/reddit-mentions/:gameName (e.g., /api/reddit-mentions/Counter-Strike%202)`);
});
