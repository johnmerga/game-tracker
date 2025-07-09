import { GameData } from "../types";
import { scrapeSteamchartsData } from "../scrapers/steamchartsScraper";
import { saveJson, saveGamesToCsv } from "../utils/fileHandler";
import { Env } from "../config";

interface CacheEntry {
  data: GameData[];
  timestamp: number; // unix timestamp in milliseconds
}

let topGamesCache: CacheEntry | null = null;

const CACHE_DURATION_SECONDS = Env.CACHE_DURATION_SECONDS;
const CACHE_DURATION_MS = CACHE_DURATION_SECONDS * 1000;

const isCacheValid = (): boolean => {
  if (!topGamesCache) {
    return false;
  }
  const now = Date.now();
  return now - topGamesCache.timestamp < CACHE_DURATION_MS;
};

export async function getCachedTopGames(): Promise<GameData[]> {
  console.log("[Cache] Checking if top games cache is valid...");
  if (isCacheValid()) {
    console.log("[Cache] Serving top games data from cache.");
    return topGamesCache!.data;
  }

  console.log("[Cache] Cache expired or not found. Scraping new data...");
  try {
    const scrapedData = await scrapeSteamchartsData();
    const timestamp = Date.now();

    // updating cache
    topGamesCache = {
      data: scrapedData,
      timestamp: timestamp,
    };

    console.log("[Cache] New data scraped and cached.");

    saveJson("top_games", {
      timestamp: new Date(timestamp).toISOString(),
      games: scrapedData,
    });
    saveGamesToCsv("top_games", scrapedData);

    return scrapedData;
  } catch (error) {
    console.error("[Cache] Error scraping new data for cache:", error);
    if (topGamesCache) {
      console.warn(
        "[Cache] Scraping failed, returning expired cache data as fallback.",
      );
      return topGamesCache.data;
    }
    return [];
  }
}

// // testing
// (async () => {
//   try {
//     const games = await getCachedTopGames();
//     console.log("Cached Top Games:", games);
//   } catch (error) {
//     console.error("Error fetching cached top games:", error);
//   }
// })();
