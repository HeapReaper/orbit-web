export async function runAI(prompt: string, system: string) {
  try {
    const resp = await fetch(`${process.env.AI_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'model': 'llama3.2:3b',
        'prompt': prompt,
        'system': system,
        'stream': false,
      })
    });

    const data = await resp.json();

    return {
      status: 'success',
      data: data,
    }
  } catch (e) {
    return {
      status: 'error',
      error: e,
      data: null
    }
  }
}
