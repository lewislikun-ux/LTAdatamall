/**
 * Multi-Provider LLM Excuse & Delay Generator
 * Path: /api/generate-excuse.js
 * Supports: Google Gemini, OpenAI, Anthropic Claude, Groq, OpenRouter, and Custom OpenAI-compatible endpoints.
 * Environment keys loaded from Vercel:
 * - GEMINI_API_KEY
 * - OPENAI_API_KEY
 * - ANTHROPIC_API_KEY
 * - GROQ_API_KEY
 * - OPENROUTER_API_KEY
 */

import { GoogleGenAI } from '@google/genai';

// Singlish and Category Prompt Builders
function buildPrompt({
  friendName = 'friend',
  busNo = '65',
  destination = 'Somerset 313',
  delayMinutes = 15,
  singlishLevel = 3,
  category = 'bus_drama',
  customPrompt = '',
}) {
  const singlishGuide = {
    1: 'Formal, polite, standard English for professional or casual use (no slang).',
    2: 'Mild Singlish, casual Singaporean friend tone (friendly, occasional "lah", "ah", "sorry bro").',
    3: 'High authentic Singlish (uses words like "wah piang", "jialat", "sial", "chope", "steady wait ah", "double decker passed by").',
    4: 'Maximum hardcore Singlish / Hokkien slang / dramatic panic mode (hyper-authentic, colorful phrases like "Aiyo bro steady wait ah", "uncle driving like tractor", "confirm plus chop", "rabak", "buy you Teh-C ping later").',
  }[singlishLevel] || 'Authentic Singlish';

  const categoryGuide = {
    bus_drama: 'Public bus bunching, full double decker bus skipped the bus stop, tap card reader lag, slow bus captain changeover.',
    weather: 'Sudden tropical monsoon flash downpour in Singapore, no sheltered linkway, lightning warning, wet shoes.',
    hawker: 'Kopitiam / hawker center queue drama: uncle pouring kopi extra slow, tissue packet chope seat stolen, queue for cai png too long.',
    highway: 'Expressway congestion: CTE tunnel crawl, PIE lorry breakdown, ERP gantry traffic bottleneck.',
    unhinged: 'Hilarious unexpected SG event: wild rooster or otter family crossed the bus lane, giant monitor lizard, left umbrella on upper deck.',
    professional: 'Polite corporate transit delay: sudden overrun client ping, transit bottleneck along Orchard corridor.',
  }[category] || 'Transit delay';

  return `You are a Singaporean commuter on public transport (bus/MRT) running late to meet your friend "${friendName}" at "${destination}".
Bus Service: Bus ${busNo}.
Delay Time: +${delayMinutes} minutes.
Singlish / Tone Level: ${singlishLevel}/4 (${singlishGuide}).
Delay Theme / Category: ${categoryGuide}.
${customPrompt ? `Extra Context: ${customPrompt}` : ''}

Generate a single authentic WhatsApp message (1 to 3 sentences maximum) to send to ${friendName}.
Keep it natural, witty, believable, and true to Singapore transit culture.
Do not add quotation marks around the message or explanations. Just output the message directly.`;
}

// Built-in high-quality fallback template generator
function getFallbackExcuse({
  friendName,
  busNo,
  destination,
  delayMinutes,
  singlishLevel = 3,
  category = 'bus_drama',
}) {
  const templates = {
    bus_drama: [
      `Wah ${friendName} damn jialat, bus bunching then two double-deckers just zoom past my stop sia! Finally squeezed onto Bus ${busNo}, confirm late ${delayMinutes} mins. Chope seat first can?`,
      `Aiyo bro wait for Bus ${busNo} until beard grow long! Squeezing on upper deck now, ETA around ${delayMinutes} mins late to ${destination}. Order drink first!`,
      `Aiyo ${friendName} steady wait ah! Bus ${busNo} driver driving like tractor 20km/h and red light after red light sial! Confirm ${delayMinutes} mins late, don't rage quit I buy you Teh-C ping later!!`,
      `Hi ${friendName}, apologies! Bus ${busNo} was bunched up and the previous two buses were completely full. Running about ${delayMinutes} mins behind schedule to ${destination}.`,
    ],
    weather: [
      `Wah bro the sky suddenly open up like waterfall sia! No umbrella so dashed under bus stop, bus ${busNo} delayed by ${delayMinutes} mins. Head to aircon first!`,
      `Aiyo ${friendName} sudden monsoon flood at bus stop sia, water reach ankle level! Bus ${busNo} crawling through the rain, give me ${delayMinutes} mins more, sorry bro!`,
    ],
    highway: [
      `Wah CTE jam until like carpark sia, Bus ${busNo} crawling at 10km/h. Confirm late ${delayMinutes} mins to ${destination}, chill somewhere first!`,
      `Wah lao eh, CTE lorry breakdown one lane blocked completely! Bus ${busNo} stuck motionless sial. Bro give me ${delayMinutes} mins, order your food first I sponsor side dish!`,
    ],
    hawker: [
      `Wah bro kopitiam uncle pour kopi extra artistic today, queue 15 mins for toast! Running ${delayMinutes} mins late to ${destination}, chope place first!`,
    ],
    unhinged: [
      `Bro you confirm laugh, family of wild otters crossing the bus lane so Bus ${busNo} had to halt! Running ${delayMinutes} mins late to ${destination}!`,
      `Aiyo bro wild rooster at void deck chase me until I miss the first bus ${busNo} sial! Squeezed into next bus already, late ${delayMinutes} mins, don't disown me!`,
    ],
    professional: [
      `Dear ${friendName}, unexpected transit congestion along the corridor has delayed my arrival by ${delayMinutes} minutes. Looking forward to catching up shortly.`,
    ],
  };

  const pool = templates[category] || templates.bus_drama;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const {
    friendName = 'Chloe',
    busNo = '65',
    destination = 'Somerset 313',
    delayMinutes = 15,
    singlishLevel = 3,
    category = 'bus_drama',
    customPrompt = '',
    provider = 'gemini', // 'gemini' | 'openai' | 'anthropic' | 'groq' | 'openrouter' | 'custom'
    model = '',
    apiKey: userApiKey = '',
    customBaseUrl = '',
  } = req.body || {};

  const promptText = buildPrompt({
    friendName,
    busNo,
    destination,
    delayMinutes,
    singlishLevel,
    category,
    customPrompt,
  });

  try {
    // 1. Google Gemini Provider
    if (provider === 'gemini') {
      const activeKey = userApiKey || process.env.GEMINI_API_KEY;
      if (activeKey && activeKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({ apiKey: activeKey });
        const selectedModel = model || 'gemini-2.5-flash';

        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: promptText,
        });

        const generatedText = response.text?.trim() || '';
        if (generatedText) {
          return res.status(200).json({
            excuse: generatedText,
            source: 'gemini',
            provider: 'Google Gemini',
            model: selectedModel,
          });
        }
      }
    }

    // 2. OpenAI Provider
    if (provider === 'openai') {
      const activeKey = userApiKey || process.env.OPENAI_API_KEY;
      if (activeKey) {
        const selectedModel = model || 'gpt-4o-mini';
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeKey}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: 'You are an authentic Singapore commuter creating WhatsApp messages.' },
              { role: 'user', content: promptText },
            ],
            temperature: 0.85,
            max_tokens: 150,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.choices?.[0]?.message?.content?.trim();
          if (generatedText) {
            return res.status(200).json({
              excuse: generatedText,
              source: 'openai',
              provider: 'OpenAI',
              model: selectedModel,
            });
          }
        }
      }
    }

    // 3. Anthropic Claude Provider
    if (provider === 'anthropic') {
      const activeKey = userApiKey || process.env.ANTHROPIC_API_KEY;
      if (activeKey) {
        const selectedModel = model || 'claude-3-5-haiku-20241022';
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': activeKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: selectedModel,
            max_tokens: 150,
            messages: [{ role: 'user', content: promptText }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.content?.[0]?.text?.trim();
          if (generatedText) {
            return res.status(200).json({
              excuse: generatedText,
              source: 'anthropic',
              provider: 'Anthropic Claude',
              model: selectedModel,
            });
          }
        }
      }
    }

    // 4. Groq Provider
    if (provider === 'groq') {
      const activeKey = userApiKey || process.env.GROQ_API_KEY;
      if (activeKey) {
        const selectedModel = model || 'llama-3.3-70b-versatile';
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeKey}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [{ role: 'user', content: promptText }],
            temperature: 0.85,
            max_tokens: 150,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.choices?.[0]?.message?.content?.trim();
          if (generatedText) {
            return res.status(200).json({
              excuse: generatedText,
              source: 'groq',
              provider: 'Groq',
              model: selectedModel,
            });
          }
        }
      }
    }

    // 5. OpenRouter Provider
    if (provider === 'openrouter') {
      const activeKey = userApiKey || process.env.OPENROUTER_API_KEY;
      if (activeKey) {
        const selectedModel = model || 'meta-llama/llama-3.3-70b-instruct';
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeKey}`,
            'HTTP-Referer': 'https://catchup.sg',
            'X-Title': 'CatchUp SG',
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [{ role: 'user', content: promptText }],
            temperature: 0.85,
            max_tokens: 150,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.choices?.[0]?.message?.content?.trim();
          if (generatedText) {
            return res.status(200).json({
              excuse: generatedText,
              source: 'openrouter',
              provider: 'OpenRouter',
              model: selectedModel,
            });
          }
        }
      }
    }

    // 6. Custom OpenAI-compatible Provider
    if (provider === 'custom' && customBaseUrl) {
      const response = await fetch(`${customBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey ? { Authorization: `Bearer ${userApiKey}` } : {}),
        },
        body: JSON.stringify({
          model: model || 'default',
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.85,
          max_tokens: 150,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.choices?.[0]?.message?.content?.trim();
        if (generatedText) {
          return res.status(200).json({
            excuse: generatedText,
            source: 'custom',
            provider: 'Custom Endpoint',
            model: model || 'custom',
          });
        }
      }
    }

    // Graceful fallback to Singlish template engine if keys aren't added yet
    const fallback = getFallbackExcuse({
      friendName,
      busNo,
      destination,
      delayMinutes,
      singlishLevel,
      category,
    });

    return res.status(200).json({
      excuse: fallback,
      source: 'template_fallback',
      provider: 'Local Singlish Engine',
      model: 'template',
      note: `To enable live AI generation with ${provider}, configure your API key in Vercel environment variables or enter it in settings.`,
    });
  } catch (err) {
    console.error('Error in multi-provider excuse generation:', err);
    const fallback = getFallbackExcuse({
      friendName,
      busNo,
      destination,
      delayMinutes,
      singlishLevel,
      category,
    });

    return res.status(200).json({
      excuse: fallback,
      source: 'template_error_fallback',
      error: err.message,
    });
  }
}
