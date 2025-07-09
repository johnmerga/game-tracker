process.loadEnvFile();
export const Env = {
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID || "",
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET || "",
  REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT || "",
  REDDIT_USERNAME: process.env.REDDIT_USERNAME || "",
  REDDIT_PASSWORD: process.env.REDDIT_PASSWORD || "",
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  CACHE_DURATION_SECONDS: parseInt(
    process.env.CACHE_DURATION_SECONDS || "3600",
    10,
  ),
};
