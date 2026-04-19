const express = require('express');
const { body, validationResult } = require('express-validator');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

let aiClient = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: "AIzaSyCXJnhM4QJTt9lemM0HSuJReePZeDo67Mc" });
  }
  return aiClient;
}

function extractText(response) {
  if (!response) return '';
  if (typeof response.text === 'string') return response.text;

  const firstCandidate = response.candidates?.[0];
  const parts = firstCandidate?.content?.parts || [];
  return parts.map((p) => p.text || '').join('\n').trim();
}

router.get('/', (req, res) => {
  const configured = Boolean(process.env.GEMINI_API_KEY);
  return res.json({
    message: 'Gemini chatbot endpoint',
    configured,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    endpoint: 'POST /api/chatbot/suggest',
  });
});

router.post(
  '/suggest',
  [
    body('message').trim().isLength({ min: 3, max: 1500 }).withMessage('Message should be 3-1500 characters'),
    body('context').optional().isObject(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        message: 'Gemini API key is not configured. Add GEMINI_API_KEY in backend .env',
      });
    }

    const userMessage = String(req.body.message || '').trim();
    const context = req.body.context || {};
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    const prompt = `
You are Tradzo AI, an educational assistant focused on Indian stock market basics.

User message:
${userMessage}

Known user context:
${JSON.stringify(context)}

Rules:
1. Give practical, beginner-friendly tips for Indian markets (NSE/BSE, NIFTY, risk, diversification, SIP discipline, valuation basics, result-season checks, sector cycles, stop-loss, asset allocation, taxation awareness).
2. Keep answer concise and actionable with bullets and a short 3-step action plan.
3. Do NOT promise returns or give guaranteed-profit advice.
4. Mention this is educational, not financial advice.
5. If user asks for high-risk speculation, respond with risk-managed alternatives.
`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.4,
          maxOutputTokens: 500,
        },
      });

      const reply = extractText(response) || 'I could not generate a response right now. Please try again.';

      return res.json({
        reply,
        model,
        disclaimer: 'Educational content only. Not financial advice.',
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Gemini request failed',
        error: error.message,
      });
    }
  },
);

module.exports = router;
