"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRedditMentionsToCsv = exports.saveGamesToCsv = exports.saveJson = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, "../../data");
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
const getTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};
const saveJson = (filenamePrefix, data) => {
    const timestamp = getTimestamp();
    const filename = `${filenamePrefix}_${timestamp}.json`;
    const filePath = path_1.default.join(DATA_DIR, filename);
    try {
        fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`[FileHandler] Saved JSON to ${filePath}`);
        return filePath;
    }
    catch (error) {
        console.error(`[FileHandler] Error saving JSON file ${filePath}:`, error);
        return null;
    }
};
exports.saveJson = saveJson;
const saveGamesToCsv = (filenamePrefix, games) => {
    if (games.length === 0) {
        console.log(`[FileHandler] No game data to export to CSV for ${filenamePrefix}.`);
        return null;
    }
    const timestamp = getTimestamp();
    const filename = `${filenamePrefix}_${timestamp}.csv`;
    const filePath = path_1.default.join(DATA_DIR, filename);
    // Dynamically create headers including the 30-day columns
    const baseHeaders = [
        "Rank",
        "GameName",
        "CurrentPlayers",
        "TotalHoursPlayed",
    ];
    // Assuming all games have the same structure for HoursPlayed30Days
    const firstGameHoursData = games[0].HoursPlayed30Days;
    const thirtyDayHeaders = firstGameHoursData.map((_, i) => `Hours (${firstGameHoursData[i].Date})`); // Use the actual dates
    const headers = [...baseHeaders, ...thirtyDayHeaders];
    const csvRows = [];
    csvRows.push(headers.join(",")); // Add header row
    for (const game of games) {
        const values = headers.map((header) => {
            if (header.startsWith("Hours (")) {
                const dateString = header.substring(7, header.length - 1); // Extract date from "Hours (YYYY-MM-DD)"
                const dayData = game.HoursPlayed30Days.find((d) => d.Date === dateString);
                return dayData ? String(dayData.Hours) : ""; // Return hours or empty string
            }
            else {
                const val = game[header]; // Cast to any to access properties dynamically
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
        fs_1.default.writeFileSync(filePath, csvContent);
        console.log(`[FileHandler] Saved CSV to ${filePath}`);
        return filePath;
    }
    catch (error) {
        console.error(`[FileHandler] Error saving CSV file ${filePath}:`, error);
        return null;
    }
};
exports.saveGamesToCsv = saveGamesToCsv;
const saveRedditMentionsToCsv = (filenamePrefix, mentions) => {
    if (mentions.length === 0) {
        console.log(`[FileHandler] No Reddit mentions data to export to CSV for ${filenamePrefix}.`);
        return null;
    }
    const timestamp = getTimestamp();
    const filename = `${filenamePrefix}_${timestamp}.csv`;
    const filePath = path_1.default.join(DATA_DIR, filename);
    const headers = ["Date", "Mentions"];
    const csvRows = [];
    csvRows.push(headers.join(","));
    for (const mention of mentions) {
        const values = headers.map((header) => {
            const val = mention[header];
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
        fs_1.default.writeFileSync(filePath, csvContent);
        console.log(`[FileHandler] Saved Reddit mentions CSV to ${filePath}`);
        return filePath;
    }
    catch (error) {
        console.error(`[FileHandler] Error saving Reddit mentions CSV file ${filePath}:`, error);
        return null;
    }
};
exports.saveRedditMentionsToCsv = saveRedditMentionsToCsv;
