import { runLLM } from "../services/openai.js";

export async function classificationAgent(event, userContext) {
  const prompt = `
Classify this event into ONE category and determine relevant topics.

Event: ${event.title}
Content: ${event.content?.substring(0, 300) || ""}

Categories:
- release: New product/feature launches
- incident: Outages, downtimes, breaking issues
- security: Vulnerabilities, CVEs, security updates
- upgrade: Major version updates, breaking changes
- trend: Industry trends, discussions
- policy: Regulations, laws, government decisions

Topics (select all that apply):
- technology, politics, finance, ai, cloud, sports, startups

Return JSON:
{
  "category": "string",
  "topics": ["string"],
  "confidence": number (0-1)
}
`;

  const response = await runLLM(prompt, { responseFormat: "json_object" });
  return JSON.parse(response);
}
