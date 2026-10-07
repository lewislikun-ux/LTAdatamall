import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Gemini excuse generation API endpoint
app.post('/api/generate-excuse', async (req, res) => {
  try {
    const {
      friendName = 'friend',
      busNo = '65',
      destination = 'Somerset 313',
      delayMinutes = 15,
      singlishLevel = 3, // 1 to 4
      category = 'bus_drama', // bus_drama, weather, hawker, highway, unhinged, professional
      customPrompt = '',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    const singlishGuide = {
      1: 'Formal, polite, standard English with realistic delay explanation for professional or casual use.',
      2: 'Mild Singlish, casual Singaporean friend tone (occasional "lah", "ah", "sorry bro", friendly and chill).',
      3: 'High authentic Singlish (uses words like "wah piang", "jialat", "sial", "chope", "steady wait ah", "double decker passed by", "uncle driving slow").',
      4: 'Maximum hardcore Singlish / Hokkien slang / dramatic panic mode (hyper-authentic, hilarious, colorful phrases like "Aiyo bro steady wait ah", "uncle driving like tractor", "confirm plus chop", "rabak", "buy you Teh-C ping later").',
    }[singlishLevel as 1 | 2 | 3 | 4] || 'Authentic Singlish';

    const categoryGuide = {
      bus_drama: 'Public bus bunching, full double decker bus skipped the bus stop, tap card reader lag, slow bus captain changeover.',
      weather: 'Sudden tropical monsoon flash downpour in Singapore, no sheltered linkway, lightning warning, wet socks.',
      hawker: 'Kopitiam / hawker center queue drama: uncle pouring kopi extra slow, tissue packet chope seat stolen, queue for cai png too long.',
      highway: 'Expressway congestion: CTE tunnel crawl, PIE lorry breakdown, ERP gantry traffic bottleneck.',
      unhinged: 'Hilarious unexpected SG event: wild rooster or otter family crossed the bus lane, giant monitor lizard, left umbrella on upper deck.',
      professional: 'Polite corporate transit delay: sudden overrun client ping, transit bottleneck along Orchard corridor.',
    }[category as string] || 'Transit delay';

    if (apiKey) {
      const ai = new GoogleGenAI();
      const prompt = `You are a Singaporean commuter on public transport (bus/MRT) running late to meet your friend "${friendName}" at "${destination}".
Bus Service: Bus ${busNo}.
Delay Time: +${delayMinutes} minutes.
Singlish / Tone Level: ${singlishLevel}/4 (${singlishGuide}).
Delay Theme / Category: ${categoryGuide}.
${customPrompt ? `Extra Context: ${customPrompt}` : ''}

Generate a single authentic WhatsApp message (1 to 3 sentences maximum) to send to ${friendName}.
Keep it natural, witty, believable, and true to Singapore transit culture.
Do not add quotation marks around the message or explanations. Just output the message directly.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const generatedText = response.text?.trim() || '';
      return res.json({ excuse: generatedText, source: 'gemini' });
    }

    // High quality local fallback if GEMINI_API_KEY is not configured
    const fallbackTemplates: Record<string, Record<number, string[]>> = {
      bus_drama: {
        1: [
          `Hi ${friendName}, apologies! Bus ${busNo} was bunched up and the previous two buses were completely full. I'm on the next bus now, ETA delayed by around ${delayMinutes} mins.`,
          `Hey ${friendName}, sorry for the delay. Boarded Bus ${busNo} but traffic near ${destination} is heavier than usual. Running about ${delayMinutes} minutes late!`,
        ],
        2: [
          `Hey ${friendName}! Sorry ah, just boarded bus ${busNo}. Two full double-deckers passed by without stopping, so delayed by maybe ${delayMinutes} mins. Grab a seat first!`,
          `Bro sorry, bus ${busNo} took ages to arrive. Currently on the way to ${destination}, will reach in about ${delayMinutes} mins!`,
        ],
        3: [
          `Wah ${friendName} damn jialat, bus bunching then two double-deckers just zoom past my stop sia! Finally squeezed onto Bus ${busNo}, confirm late ${delayMinutes} mins. Chope seat first can?`,
          `Aiyo bro, wait for Bus ${busNo} until beard grow long! Squeezing on upper deck now, ETA around ${delayMinutes} mins late to ${destination}. Order drink first!`,
        ],
        4: [
          `Aiyo ${friendName} steady wait ah! Bus ${busNo} driver driving like tractor 20km/h and red light after red light sial! Confirm ${delayMinutes} mins late, don't rage quit I buy you Teh-C ping later!!`,
          `Wah piang eh, Bus ${busNo} EZ-Link machine hung then uncle reboot 5 minutes, then bus pack like sardine can't move! Late ${delayMinutes} mins bro, steady pom pi pi!`,
        ],
      },
      weather: {
        1: [
          `Hi ${friendName}, apologies, caught in the sudden monsoon downpour without shelter near the bus stop. Running approximately ${delayMinutes} mins behind schedule.`,
        ],
        2: [
          `Hey ${friendName}, sudden thunderstorm just hit! Waiting for the rain to slow down at the sheltered linkway, be there in ${delayMinutes} mins!`,
        ],
        3: [
          `Wah bro the sky suddenly open up like waterfall sia! No umbrella so dashed under bus stop, bus ${busNo} delayed by ${delayMinutes} mins. Head to aircon first!`,
        ],
        4: [
          `Aiyo ${friendName} sudden monsoon flood at bus stop sia, water reach ankle level! Bus ${busNo} crawling through the rain, give me ${delayMinutes} mins more, sorry bro!`,
        ],
      },
      highway: {
        1: [
          `Hi ${friendName}, my bus is stuck in sudden bottleneck traffic approaching ${destination}. Arriving around ${delayMinutes} mins late, apologies!`,
        ],
        2: [
          `Hey ${friendName}, CTE tunnel is crawling right now! Bus ${busNo} moving very slowly, gonna be about ${delayMinutes} mins late.`,
        ],
        3: [
          `Wah CTE jam until like carpark sia, Bus ${busNo} crawling at 10km/h. Confirm late ${delayMinutes} mins to ${destination}, chill somewhere first!`,
        ],
        4: [
          `Wah lao eh, CTE lorry breakdown one lane blocked completely! Bus ${busNo} stuck motionless sial. Bro give me ${delayMinutes} mins, order your food first I sponsor side dish!`,
        ],
      },
      hawker: {
        3: [
          `Wah bro kopitiam uncle pour kopi extra artistic today, queue 15 mins for toast! Running ${delayMinutes} mins late to ${destination}, chope place first!`,
        ],
        4: [
          `Bro you won't believe it, auntie take my tissue paper packet chope table, then Cai Png uncle scooping like slow motion! Sprinting for Bus ${busNo} now, late ${delayMinutes} mins!`,
        ],
      },
      unhinged: {
        3: [
          `Bro you confirm laugh, family of wild otters crossing the bus lane so Bus ${busNo} had to halt! Running ${delayMinutes} mins late to ${destination}!`,
        ],
        4: [
          `Aiyo bro wild rooster at void deck chase me until I miss the first bus ${busNo} sial! Squeezed into next bus already, late ${delayMinutes} mins, don't disown me!`,
        ],
      },
      professional: {
        1: [
          `Dear ${friendName}, please accept my apologies as unexpected public transport congestion has extended my transit time by ${delayMinutes} minutes. Looking forward to our discussion shortly.`,
        ],
        2: [
          `Hi ${friendName}, urgent message: transit delays along the corridor mean I'll arrive ${delayMinutes} mins later than expected at ${destination}. Thank you for your patience!`,
        ],
      },
    };

    const catList = fallbackTemplates[category] || fallbackTemplates.bus_drama;
    const levelKey = (catList[singlishLevel] ? singlishLevel : Object.keys(catList)[0]) as number;
    const pool = catList[levelKey] || fallbackTemplates.bus_drama[3];
    const picked = pool[Math.floor(Math.random() * pool.length)];

    return res.json({ excuse: picked, source: 'template' });
  } catch (error: any) {
    console.error('Error generating excuse:', error);
    return res.status(500).json({ error: 'Failed to generate excuse', message: error.message });
  }
});

// Configure Vite or serve static files
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CatchUp SG server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
