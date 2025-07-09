import { Request, Response } from "express";
import { getCachedTopGames } from "../cache/topGamesCache";
import { TopGamesResponseSchema, ErrorResponse } from "../types";
export const getTopGames = async (req: Request, res: Response) => {
  try {
    const games = await getCachedTopGames();
    const responseData = {
      timestamp: new Date().toISOString(),
      games: games,
    };
    // to fix null and nan validation errors
    const stringifiedGames = JSON.stringify(responseData);
    const parsedGames = JSON.parse(stringifiedGames);
    const validationResult = TopGamesResponseSchema.safeParse(parsedGames);
    if (!validationResult.success) {
      console.error(
        "[GameController] TopGamesResponse validation failed:",
        validationResult.error.errors,
      );
      const errorResponse: ErrorResponse = {
        status: "error",
        message: "Internal server error: Data format mismatch for top games.",
        details: validationResult.error.errors,
      };
      return res.status(500).json(errorResponse);
    }

    res.status(200).json(validationResult.data);
  } catch (error: any) {
    console.error("[GameController] Failed to get top games:", error);
    const errorResponse: ErrorResponse = {
      status: "error",
      message: "Failed to retrieve top games data.",
      details: error.message,
    };
    res.status(500).json(errorResponse);
  }
};
