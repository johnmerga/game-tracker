import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { X, TrendingUp, Users, Clock, MessageCircle } from "lucide-react";
import { useRedditMentions } from "../hooks/useGameData";
import { Game } from "../types";

interface GameDetailsModalProps {
  game: Game;
  onClose: () => void;
}

interface RedditData {
  timestamp: string;
  gameName: string;
  mentions: Array<{
    Date: string;
    Mentions: number;
  }>;
}



const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const formatHours = (hours: number): string => {
  if (hours > 1000000) {
    return `${(hours / 1000000).toFixed(1)}M`;
  } else if (hours > 1000) {
    return `${(hours / 1000).toFixed(1)}K`;
  }
  return hours.toString();
};

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  onClose,
}) => {
  const {
    data: redditData,
    isLoading,
    error,
  } = useRedditMentions(game.GameName) as { data: RedditData | undefined; isLoading: boolean; error: Error | null };

  // Process and combine data for the chart
  const chartData = React.useMemo(() => {
    if (!redditData) return [];

    const validHoursData = game.HoursPlayed30Days.filter((item) => {
      const date = new Date(item.Date);
      return (
        !isNaN(date.getTime()) && item.Hours !== null && !isNaN(item.Hours)
      );
    });

    return validHoursData.map((hoursItem) => {
      if (!redditData?.mentions) return null;
      const redditItem = redditData.mentions.find(
        (mention) => mention.Date === hoursItem.Date,
      );
      return {
        date: hoursItem.Date,
        hours: hoursItem.Hours,
        mentions: redditItem?.Mentions ?? 0,
      };
    });
  }, [game.HoursPlayed30Days, redditData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {game.GameName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Game Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Rank</span>
              </div>
              <span className="text-2xl font-bold text-blue-900">
                #{game.Rank}
              </span>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Current Players
                </span>
              </div>
              <span className="text-2xl font-bold text-green-900">
                {formatNumber(game.CurrentPlayers)}
              </span>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Total Hours
                </span>
              </div>
              <span className="text-2xl font-bold text-purple-900">
                {formatNumber(game.TotalHoursPlayed)}
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Hours Played vs Reddit Mentions (30 Days)
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">
                  Error loading Reddit data: {error.message}
                </p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis
                      yAxisId="hours"
                      orientation="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatHours}
                    />
                    <YAxis
                      yAxisId="mentions"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                      formatter={(value: any, name: string) => [
                        name === "hours" ? formatNumber(value) : value,
                        name === "hours" ? "Hours Played" : "Reddit Mentions",
                      ]}
                    />
                    <Legend />
                    <Line
                      yAxisId="hours"
                      type="monotone"
                      dataKey="hours"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Hours Played"
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                    />
                    <Line
                      yAxisId="mentions"
                      type="monotone"
                      dataKey="mentions"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Reddit Mentions"
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
