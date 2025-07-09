"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedTopGames = getCachedTopGames;
const steamchartsScraper_1 = require("../scrapers/steamchartsScraper");
const fileHandler_1 = require("../utils/fileHandler");
let topGamesCache = null;
const CACHE_DURATION_SECONDS = parseInt(process.env.CACHE_DURATION_SECONDS || "3600", 10);
const CACHE_DURATION_MS = CACHE_DURATION_SECONDS * 1000;
const isCacheValid = () => {
    if (!topGamesCache) {
        return false;
    }
    const now = Date.now();
    return now - topGamesCache.timestamp < CACHE_DURATION_MS;
};
async function getCachedTopGames() {
    console.log("[Cache] Checking if top games cache is valid...");
    if (isCacheValid()) {
        console.log("[Cache] Serving top games data from cache.");
        return topGamesCache.data;
    }
    console.log("[Cache] Cache expired or not found. Scraping new data...");
    try {
        const scrapedData = await (0, steamchartsScraper_1.scrapeSteamchartsData)();
        const timestamp = Date.now();
        // updating cache
        topGamesCache = {
            data: scrapedData,
            timestamp: timestamp,
        };
        console.log("[Cache] New data scraped and cached.");
        (0, fileHandler_1.saveJson)("top_games", {
            timestamp: new Date(timestamp).toISOString(),
            games: scrapedData,
        });
        (0, fileHandler_1.saveGamesToCsv)("top_games", scrapedData);
        return scrapedData;
    }
    catch (error) {
        console.error("[Cache] Error scraping new data for cache:", error);
        if (topGamesCache) {
            console.warn("[Cache] Scraping failed, returning expired cache data as fallback.");
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
