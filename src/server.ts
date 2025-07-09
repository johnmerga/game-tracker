import express, { Request, Response, NextFunction } from "express";
import { getCachedTopGames } from "./cache/topGamesCache";
import { getRedditMentions } from "./scrapers/redditScraper";
import { saveRedditMentionsToCsv } from "./utils/fileHandler";
import {
  validateGameNameParam,
  formatValidationError,
} from "./utils/validation";
import {
  TopGamesResponseSchema,
  RedditMentionsResponseSchema,
  ErrorResponse,
} from "./types";

process.loadEnvFile();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("[Global Error Handler] Uncaught error:", err.stack);
  const errorResponse: ErrorResponse = {
    status: "error",
    message: "An unexpected server error occurred.",
    details: err.message,
  };
  res.status(500).json(errorResponse);
});

app.get("/api/top-games", async (req: Request, res: Response) => {
  try {
    const games = await getCachedTopGames();
    const responseData = {
      timestamp: new Date().toISOString(),
      games: games,
    };
    const convertIntoJSON = JSON.stringify(responseData, null, 2);
    const toJson = JSON.parse(convertIntoJSON);
    const validationResult = TopGamesResponseSchema.safeParse(toJson);
    if (!validationResult.success) {
      console.error(
        "[API Error] TopGamesResponse validation failed:",
        validationResult.error.errors,
      );
      const errorResponse: ErrorResponse = {
        status: "error",
        message: "Internal server error: Data format mismatch.",
        details: validationResult.error.errors,
      };
      return res.status(500).json(errorResponse);
    }

    res.status(200).json(validationResult.data);
  } catch (error: any) {
    console.error("[API Error] Failed to get top games:", error);
    const errorResponse: ErrorResponse = {
      status: "error",
      message: "Failed to retrieve top games data.",
      details: error.message,
    };
    res.status(500).json(errorResponse);
  }
});

// get /api/reddit-mentions/:gameName
app.get(
  "/api/reddit-mentions/:gameName",
  async (req: Request, res: Response) => {
    const { gameName } = req.params;

    const validationResult = validateGameNameParam(gameName);
    if (!validationResult.success) {
      return res
        .status(400)
        .json(formatValidationError(validationResult.error));
    }

    const decodedGameName = validationResult.data?.gameName;

    if (!decodedGameName) {
      const errorResponse: ErrorResponse = {
        status: "error",
        message: "Game name is required.",
      };
      return res.status(400).json(errorResponse);
    }
    try {
      const mentions = await getRedditMentions(decodedGameName);
      const responseData = {
        gameName: decodedGameName,
        timestamp: new Date().toISOString(),
        mentions: mentions,
      };

      const validationResultSchema =
        RedditMentionsResponseSchema.safeParse(responseData);
      if (!validationResultSchema.success) {
        console.error(
          "[API Error] RedditMentionsResponse validation failed:",
          validationResultSchema.error.errors,
        );
        const errorResponse: ErrorResponse = {
          status: "error",
          message:
            "Internal server error: Data format mismatch for Reddit mentions.",
          details: validationResultSchema.error.errors,
        };
        return res.status(500).json(errorResponse);
      }

      // export the data locally
      const cleanedGameName = decodedGameName
        .replace(/[^a-zA-Z0-9_ -]/g, "")
        .replace(/ /g, "_")
        .toLowerCase();
      saveRedditMentionsToCsv(`reddit_mentions_${cleanedGameName}`, mentions);

      res.status(200).json(validationResultSchema.data);
    } catch (error: any) {
      console.error(
        `[API Error] Failed to get Reddit mentions for ${decodedGameName}:`,
        error,
      );
      const errorResponse: ErrorResponse = {
        status: "error",
        message: `Failed to retrieve Reddit mentions for ${decodedGameName}.`,
        details: error.message,
      };
      res.status(500).json(errorResponse);
    }
  },
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(
    `Access top games data at: http://localhost:${PORT}/api/top-games`,
  );
  console.log(
    `Access Reddit mentions at: http://localhost:${PORT}/api/reddit-mentions/:gameName (e.g., /api/reddit-mentions/Counter-Strike%202)`,
  );
});
