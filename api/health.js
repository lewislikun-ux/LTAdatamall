/**
 * Health Check API Endpoint
 * Path: /api/health.js
 * Used for monitoring if APIs and environment configurations are working properly.
 */

export default async function handler(req, res) {
  const ltaKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_API_KEY ||
    process.env['LTA _ACCOUNT_KEY'] ||
    '';

  const geminiKey = process.env.GEMINI_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const groqKey = process.env.GROQ_API_KEY || '';
  const openrouterKey = process.env.OPENROUTER_API_KEY || '';

  const isLtaConfigured = Boolean(ltaKey && ltaKey !== 'MY_LTA_KEY');

  const statusInfo = {
    status: 'ok',
    service: 'CatchUp SG API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: {
      lta_datamall: {
        configured: isLtaConfigured,
        endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
        status: isLtaConfigured ? 'Ready (AccountKey active)' : 'Pending (LTA_ACCOUNT_KEY not set in Vercel env)',
      },
      llm_providers: {
        gemini: Boolean(geminiKey && geminiKey !== 'MY_GEMINI_API_KEY'),
        openai: Boolean(openaiKey),
        anthropic: Boolean(anthropicKey),
        groq: Boolean(groqKey),
        openrouter: Boolean(openrouterKey),
      },
    },
    endpoints: {
      bus_arrival: '/api/bus-arrival?BusStopCode=04121',
      generate_excuse: '/api/generate-excuse',
      health: '/api/health',
    },
  };

  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  return res.status(200).json(statusInfo);
}
