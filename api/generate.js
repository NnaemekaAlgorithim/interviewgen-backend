export default async function handler(req, res) {
  // 1. Enable Cross-Origin Resource Sharing (CORS) so your mobile app can call it
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle browser preflight checks
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title } = req.body;
  const API_KEY = process.env.OPENROUTER_API_KEY; // Safely pulled from Vercel settings

  try {
    const openRouterResponse = await fetch("https://openrouter.ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [{
          role: "user",
          content: `Task: Check if "${title}" is a realistic job title. If NOT realistic, reply ONLY: INVALID. If realistic, provide exactly 3 strong interview questions for that role. Format as a numbered list.`
        }]
      })
    });

    const data = await openRouterResponse.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to communicate with OpenRouter' });
  }
}
