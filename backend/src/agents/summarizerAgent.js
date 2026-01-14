import { runLLM } from '../services/openai.js';

export async function summarizerAgent(event, userContext) {
  const tone = userContext.preferences?.tone || 'concise';
  
  const toneInstructions = {
    concise: 'Be brief and to the point.',
    detailed: 'Provide comprehensive analysis.',
    technical: 'Use technical terminology and deep details.'
  };
  
  const prompt = `
Summarize this event for someone interested in: ${userContext.interests.join(', ')}
Tone: ${tone}. ${toneInstructions[tone]}

Event: ${event.title}
Content: ${event.content || ''}
URL: ${event.url || ''}

Provide:
1. tldr: One sentence (max 150 chars)
2. bullets: 3-5 key points
3. impact: Who is affected?
4. actionRequired: What should readers do? (or "None" if just informational)

Return valid JSON:
{
  "tldr": "string",
  "bullets": ["string"],
  "impact": "string",
  "actionRequired": "string"
}
`;

  const response = await runLLM(prompt, { responseFormat: 'json_object' });
  return JSON.parse(response);
}