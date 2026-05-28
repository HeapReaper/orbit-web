import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runAI(prompt: string, system: string) {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    });

    return {
      status: 'success',
      data: { response: response.choices[0].message.content },
    };
  } catch (e) {
    return {
      status: 'error',
      error: e,
      data: null,
    };
  }
}
