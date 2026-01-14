import OpenAI from 'openai';

let openai = null;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

export async function runLLM(prompt, options = {}) {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.3,
    responseFormat = null
  } = options;
  
  const client = getOpenAIClient();
  
  try {
    const completion = await client.chat.completions.create({
      model,
      temperature,
      messages: [
        {
          role: 'system',
          content: 'You are a precise, factual analyst. Always respond in valid JSON when requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      ...(responseFormat && { response_format: { type: 'json_object' } })
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}