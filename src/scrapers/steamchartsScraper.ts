import puppeteer, { Browser, Page } from "puppeteer";
import { GameData, GameDayHours } from "../types";

const STEAMCHARTS_URL = "https://steamcharts.com/";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function scrapeSteamchartsData(): Promise<GameData[]> {
  let browser: Browser | undefined;
  try {
    //  launch a headless browser instance

    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium-browser",
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-features=TranslateUI",
        "--disable-ipc-flooding-protection",
        "--enable-features=NetworkService,NetworkServiceInProcess",
        "--force-color-profile=srgb",
        "--metrics-recording-only",
        "--use-mock-keychain",
      ],
    });
    const page: Page = await browser.newPage();

    // set a realistic user-agent to mimic a real browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    console.log(`[SteamchartsScraper] Navigating to ${STEAMCHARTS_URL}...`);
    //  navigate to the url and wait until the dom is loaded
    await page.goto(STEAMCHARTS_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    //  wait for the specific table element and its rows to be available
    console.log(
      "[SteamchartsScraper] Waiting for '#top-games' element and its rows...",
    );
    await page.waitForSelector("#top-games tbody tr", { timeout: 30000 });
    await page.waitForSelector("#topgames-chart-head", { timeout: 30000 });

    const gamesData: GameData[] = [];

    // Get all row element handles. We need handles to interact with each row.
    const rowHandles = await page.$$("#top-games tbody tr");
    console.log(`[SteamchartsScraper] Found ${rowHandles.length} game rows.`);

    // --- Step 1: Get initial data for all games ---
    for (let i = 0; i < rowHandles.length; i++) {
      const rowHandle = rowHandles[i];
      const initialRowData = await page.evaluate((row) => {
        const columns = Array.from(row.querySelectorAll("td"));
        if (columns.length < 6) {
          return null;
        }

        const parseNumber = (text: string) =>
          parseInt(text.replace(/,/g, ""), 10);

        const rank = parseNumber(columns[0].textContent || "0");
        const gameName =
          columns[1].querySelector("a")?.textContent?.trim() || "N/A";
        const currentPlayers = parseNumber(columns[2].textContent || "0");
        const totalHoursPlayed = parseNumber(columns[5].textContent || "0"); // Original 'Hours Played' is total

        // explicitly type hoursplayed30days as gamedayhours[] from the start
        const hoursPlayed30Days: GameDayHours[] = Array(30)
          .fill(null)
          .map(() => ({ Date: "", Hours: 0 }));

        return {
          Rank: rank,
          GameName: gameName,
          CurrentPlayers: currentPlayers,
          TotalHoursPlayed: totalHoursPlayed,
          HoursPlayed30Days: hoursPlayed30Days, // Now correctly typed
        };
      }, rowHandle);

      if (initialRowData) {
        gamesData.push(initialRowData as GameData); // Cast to GameData
      } else {
        console.warn(
          `[SteamchartsScraper] Skipping row ${i + 1} due to insufficient columns.`,
        );
      }
    }
    console.log(
      `[SteamchartsScraper] Initial data extracted for ${gamesData.length} games.`,
    );

    //  extract 30-day hours played by hovering on the first game's chart
    // find the chart column for the first game's row
    const firstGameChartColumn = await rowHandles[0]?.$("td.chart.period-col");
    if (!firstGameChartColumn) {
      console.error(
        "[SteamchartsScraper] Could not find the chart column for the first game. Cannot extract 30-day data.",
      );
      return gamesData; // Return what we have
    }

    // get all the individual day bars (rect elements) within the first game's chart
    const dayBarHandles = await firstGameChartColumn.$$("g rect.hours-bar");
    console.log(
      `[SteamchartsScraper] Found ${dayBarHandles.length} daily bars in the first game's chart.`,
    );

    if (dayBarHandles.length === 0) {
      console.warn(
        "[SteamchartsScraper] No daily bars found in the first game's chart. 30-day data will not be available.",
      );
      return gamesData;
    }

    // get the handle for the element that displays the date on hover
    const chartHeadElement = await page.$("#topgames-chart-head");
    if (!chartHeadElement) {
      console.error(
        "[SteamchartsScraper] Could not find '#topgames-chart-head' element. Dates for 30-day data might be missing.",
      );
    }

    // loop through each day bar (up to 30 days)
    for (
      let dayIndex = 0;
      dayIndex < Math.min(dayBarHandles.length, 30);
      dayIndex++
    ) {
      const dayBarHandle = dayBarHandles[dayIndex];

      console.log(
        `[SteamchartsScraper] Hovering over day ${dayIndex + 1} bar...`,
      );
      await dayBarHandle.hover();
      await sleep(50); // Small pause for the DOM to update after hover

      // get the date string from the #topgames-chart-head element
      let dateForDay = "";
      if (chartHeadElement) {
        dateForDay = await page.evaluate(
          (el) => el.textContent?.trim() || "",
          chartHeadElement,
        );
      }

      // now, for this specific day, extract the 'hours played' value for all games
      for (let gameIdx = 0; gameIdx < gamesData.length; gameIdx++) {
        const hoursPlayedColumnHandle = await rowHandles[gameIdx].$(
          "td.num.period-col.player-hours",
        );
        if (hoursPlayedColumnHandle) {
          const hoursText = await page.evaluate(
            (el) => el.textContent?.trim() || "0",
            hoursPlayedColumnHandle,
          );
          const hoursValue = parseInt(hoursText.replace(/,/g, ""), 10);

          // checking the entry for this day is present and update it
          gamesData[gameIdx].HoursPlayed30Days[dayIndex] = {
            Date: dateForDay,
            Hours: hoursValue,
          };
        } else {
          console.warn(
            `[SteamchartsScraper] Hours Played column not found for game ${gamesData[gameIdx].GameName} on day ${dayIndex + 1}.`,
          );
          // If not found, checking the entry for this day is still present with default/zero
          gamesData[gameIdx].HoursPlayed30Days[dayIndex] = {
            Date: dateForDay,
            Hours: 0,
          };
        }
      }
      // Move mouse away after processing all games for this day
      await page.mouse.move(0, 0);
      await sleep(20); // Very short pause
    }
    console.log(
      "[SteamchartsScraper] Finished collecting 30-day hours data for all games.",
    );

    return gamesData;
  } catch (error: any) {
    console.error(
      `[SteamchartsScraper] Error during scraping: ${error.message}`,
    );
    return []; // Return an empty array on error
  } finally {
    if (browser) {
      await browser.close(); // checking browser is closed
    }
  }
}
