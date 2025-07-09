import Snoowrap from "snoowrap";
import { RedditMentions } from "../types";
import { Env } from "../config";

export async function getRedditMentions(
  gameName: string,
  daysBack: number = 30,
): Promise<RedditMentions[]> {
  let reddit: Snoowrap;
  try {
    reddit = new Snoowrap({
      userAgent: Env.REDDIT_USER_AGENT,
      clientId: Env.REDDIT_CLIENT_ID,
      clientSecret: Env.REDDIT_CLIENT_SECRET,
      username: Env.REDDIT_USERNAME,
      password: Env.REDDIT_PASSWORD,
    });
    console.log("[RedditScraper] Reddit API initialized successfully.");
  } catch (e: any) {
    console.error(
      `[RedditScraper] Error initializing Reddit API: ${e.message}`,
    );
    console.warn(
      "[RedditScraper] Please check your Reddit API credentials and network connection.",
    );
    return [];
  }

  const mentionsMap: { [date: string]: number } = {};
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // set to end of today
  const startDate = new Date(
    endDate.getTime() - daysBack * 24 * 60 * 60 * 1000,
  );
  startDate.setHours(0, 0, 0, 0); // set to start of the day

  console.log(
    `[RedditScraper] Searching Reddit for '${gameName}' mentions from ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
  );

  try {
    const searchResults = await reddit.search({
      query: gameName,
      sort: "new",
      time: "month", // searching within the last month
      limit: 500,
    });

    console.log(
      `[RedditScraper] Found ${searchResults.length} potential Reddit posts.`,
    );

    for (const submission of searchResults) {
      const postDate = new Date(submission.created_utc * 1000); // created_utc is in seconds

      if (postDate >= startDate && postDate <= endDate) {
        const dateStr = postDate.toISOString().split("T")[0]; // YYYY-MM-DD
        mentionsMap[dateStr] = (mentionsMap[dateStr] || 0) + 1;
      }
    }
  } catch (e: any) {
    console.error(
      `[RedditScraper] Error fetching Reddit submissions: ${e.message}`,
    );
    console.warn(
      "[RedditScraper] This might be due to incorrect API credentials, rate limits, or network issues.",
    );
    return [];
  }

  // filing in dates with 0 mentions if no posts for that day and format as array
  const dailyMentions: RedditMentions[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    dailyMentions.push({ Date: dateStr, Mentions: mentionsMap[dateStr] || 0 });
  }

  return dailyMentions.sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime(),
  );
}
