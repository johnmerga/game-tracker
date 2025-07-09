import { useQuery } from "@tanstack/react-query";
import { fetchTopGames, fetchRedditMentions } from "../utils/api";

export const useTopGames = () => {
  return useQuery({
    queryKey: ["topGames"],
    queryFn: fetchTopGames,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRedditMentions = (gameName: string) => {
  return useQuery({
    queryKey: ["redditMentions", gameName],
    queryFn: () => fetchRedditMentions(gameName),
    enabled: !!gameName,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
