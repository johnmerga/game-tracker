import { Request, Response } from "express";
import { getRedditMentions } from "../scrapers/redditScraper";
import { saveRedditMentionsToCsv } from "../utils/fileHandler";
import { RedditMentionsResponseSchema, ErrorResponse } from "../types";
export const getRedditMentionsByGameName = async (
  req: Request,
  res: Response,
) => {
  const decodedGameName = req.params.gameName;

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
        "[RedditController] RedditMentionsResponse validation failed:",
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

    const cleanedGameName = decodedGameName
      .replace(/[^a-zA-Z0-9_ -]/g, "")
      .replace(/ /g, "_")
      .toLowerCase();
    saveRedditMentionsToCsv(`reddit_mentions_${cleanedGameName}`, mentions);

    res.status(200).json(validationResultSchema.data);
  } catch (error: any) {
    console.error(
      `[RedditController] Failed to get Reddit mentions for ${decodedGameName}:`,
      error,
    );
    const errorResponse: ErrorResponse = {
      status: "error",
      message: `Failed to retrieve Reddit mentions for ${decodedGameName}.`,
      details: error.message,
    };
    res.status(500).json(errorResponse);
  }
};
