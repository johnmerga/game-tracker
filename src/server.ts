import express from "express";
import { Env } from "./config"; // Import Env from config
import { errorHandler } from "./middleware/errorHandler";
import { validateRequest } from "./middleware/validationMiddleware";
import { getTopGames } from "./controllers/gameController";
import { getRedditMentionsByGameName } from "./controllers/redditController";
import { GameNameParamSchema } from "./types"; // Import schema for validation

const app = express();
const PORT = Env.PORT;

app.use(express.json());

app.get("/api/top-games", getTopGames);
app.get(
  "/api/reddit-mentions/:gameName",
  validateRequest(GameNameParamSchema, "params"), // Validate gameName parameter
  getRedditMentionsByGameName,
);

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(
    `Access top games data at: http://localhost:${PORT}/api/top-games`,
  );
  console.log(
    `Access Reddit mentions at: http://localhost:${PORT}/api/reddit-mentions/:gameName (e.g., /api/reddit-mentions/Counter-Strike%202)`,
  );
});
