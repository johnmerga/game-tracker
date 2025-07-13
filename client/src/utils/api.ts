import {
  TopGamesSchema,
  RedditMentionsSchema,
  TopGamesResponse,
  RedditMentions,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
console.log("------------------------API Base URL:", API_BASE_URL);

export const fetchTopGames = async (): Promise<TopGamesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/top-games`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return TopGamesSchema.parse(data);
  } catch (error) {
    // Fallback to mock data if API is not available
    console.warn("API not available, using mock data:", error);

    const mockData = {
      timestamp: "2025-07-08T23:44:57.392Z",
      games: [
        {
          Rank: 1,
          GameName: "Counter-Strike 2",
          CurrentPlayers: 855732,
          TotalHoursPlayed: 732733704,
          HoursPlayed30Days: Array.from({ length: 30 }, (_, i) => ({
            Date: new Date(2025, 5, 8 + i).toISOString().split("T")[0],
            Hours: Math.floor(Math.random() * 30000000) + 20000000,
          })),
        },
        {
          Rank: 2,
          GameName: "Dota 2",
          CurrentPlayers: 456789,
          TotalHoursPlayed: 523456789,
          HoursPlayed30Days: Array.from({ length: 30 }, (_, i) => ({
            Date: new Date(2025, 5, 8 + i).toISOString().split("T")[0],
            Hours: Math.floor(Math.random() * 25000000) + 15000000,
          })),
        },
      ],
    };

    return TopGamesSchema.parse(mockData);
  }
};

export const fetchRedditMentions = async (
  gameName: string,
): Promise<RedditMentions> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reddit-mentions/${encodeURIComponent(gameName)}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return RedditMentionsSchema.parse(data);
  } catch (error) {
    // Fallback to mock data if API is not available
    console.warn("API not available, using mock data:", error);

    const mockData = {
      gameName,
      timestamp: "2025-07-09T03:06:26.218Z",
      mentions: Array.from({ length: 30 }, (_, i) => ({
        Date: new Date(2025, 5, 8 + i).toISOString().split("T")[0],
        Mentions: Math.floor(Math.random() * 100),
      })),
    };

    return RedditMentionsSchema.parse(mockData);
  }
};
