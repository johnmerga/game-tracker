import fs from "fs";
import path from "path";
import { GameData, RedditMentions } from "../types";

const DATA_DIR = path.join(__dirname, "../../data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

export const saveJson = (filenamePrefix: string, data: any): string | null => {
  const timestamp = getTimestamp();
  const filename = `${filenamePrefix}_${timestamp}.json`;
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`[FileHandler] Saved JSON to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`[FileHandler] Error saving JSON file ${filePath}:`, error);
    return null;
  }
};

export const saveGamesToCsv = (
  filenamePrefix: string,
  games: GameData[],
): string | null => {
  if (games.length === 0) {
    console.log(
      `[FileHandler] No game data to export to CSV for ${filenamePrefix}.`,
    );
    return null;
  }

  const timestamp = getTimestamp();
  const filename = `${filenamePrefix}_${timestamp}.csv`;
  const filePath = path.join(DATA_DIR, filename);

  // Dynamically create headers including the 30-day columns
  const baseHeaders = [
    "Rank",
    "GameName",
    "CurrentPlayers",
    "TotalHoursPlayed",
  ];
  // Assuming all games have the same structure for HoursPlayed30Days
  const firstGameHoursData = games[0].HoursPlayed30Days;
  const thirtyDayHeaders = firstGameHoursData.map(
    (_, i) => `Hours (${firstGameHoursData[i].Date})`,
  ); // Use the actual dates
  const headers = [...baseHeaders, ...thirtyDayHeaders];

  const csvRows: string[] = [];
  csvRows.push(headers.join(",")); // Add header row

  for (const game of games) {
    const values = headers.map((header) => {
      if (header.startsWith("Hours (")) {
        const dateString = header.substring(7, header.length - 1); // Extract date from "Hours (YYYY-MM-DD)"
        const dayData = game.HoursPlayed30Days.find(
          (d) => d.Date === dateString,
        );
        return dayData ? String(dayData.Hours) : ""; // Return hours or empty string
      } else {
        const val = (game as any)[header]; // Cast to any to access properties dynamically
        const stringVal = val === null || val === undefined ? "" : String(val);
        // Handle values that might contain commas or newlines by enclosing them in quotes
        return stringVal.includes(",") ||
          stringVal.includes("\n") ||
          stringVal.includes('"')
          ? `"${stringVal.replace(/"/g, '""')}"`
          : stringVal;
      }
    });
    csvRows.push(values.join(","));
  }

  const csvContent = csvRows.join("\n");
  try {
    fs.writeFileSync(filePath, csvContent);
    console.log(`[FileHandler] Saved CSV to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`[FileHandler] Error saving CSV file ${filePath}:`, error);
    return null;
  }
};

export const saveRedditMentionsToCsv = (
  filenamePrefix: string,
  mentions: RedditMentions[],
): string | null => {
  if (mentions.length === 0) {
    console.log(
      `[FileHandler] No Reddit mentions data to export to CSV for ${filenamePrefix}.`,
    );
    return null;
  }

  const timestamp = getTimestamp();
  const filename = `${filenamePrefix}_${timestamp}.csv`;
  const filePath = path.join(DATA_DIR, filename);

  const headers = ["Date", "Mentions"];
  const csvRows: string[] = [];
  csvRows.push(headers.join(","));

  for (const mention of mentions) {
    const values = headers.map((header) => {
      const val = (mention as any)[header];
      const stringVal = val === null || val === undefined ? "" : String(val);
      return stringVal.includes(",") ||
        stringVal.includes("\n") ||
        stringVal.includes('"')
        ? `"${stringVal.replace(/"/g, '""')}"`
        : stringVal;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = csvRows.join("\n");
  try {
    fs.writeFileSync(filePath, csvContent);
    console.log(`[FileHandler] Saved Reddit mentions CSV to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(
      `[FileHandler] Error saving Reddit mentions CSV file ${filePath}:`,
      error,
    );
    return null;
  }
};
