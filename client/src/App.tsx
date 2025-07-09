import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TopGamesTable, GameDetailsModal } from "./components";
import { Game } from "./types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gaming Dashboard
          </h1>
          <p className="text-gray-600">
            Track top games and their Reddit mentions
          </p>
        </div>

        <TopGamesTable onGameClick={setSelectedGame} />

        {selectedGame && (
          <GameDetailsModal
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </div>
    </div>
  );
};

const Root: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

export default Root;
