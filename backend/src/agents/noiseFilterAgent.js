import { runLLM } from "../services/openai.js";

export async function noiseFilterAgent(event, userContext) {
  const prompt = `
Analyze if this event is important for someone interested in: ${userContext.interests.join(
    ", "
  )}

Event Title: ${event.title}
Event Content: ${event.content?.substring(0, 500) || "No content"}

Return JSON with:
- important: boolean (true if this is newsworthy/significant)
- score: number 1-10 (importance level)
- reason: string (brief explanation)

Ignore: memes, jokes, personal opinions, low-quality posts
Focus on: releases, incidents, breaking news, major updates
`;

  const response = await runLLM(prompt, { responseFormat: "json_object" });
  return JSON.parse(response);
}
