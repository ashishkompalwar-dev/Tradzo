const express = require('express');
const { body, validationResult } = require('express-validator');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

const DEFAULT_MODEL = 'gemini-2.0-flash';

function getApiKey() {
  return String(process.env.GEMINI_API_KEY || '').trim();
}

function extractText(response) {
  if (!response) return '';
  if (typeof response.text === 'function') return response.text();
  if (typeof response.text === 'string') return response.text;

  const firstCandidate = response.candidates?.[0];
  const parts = firstCandidate?.content?.parts || [];
  return parts.map((p) => p.text || '').join('\n').trim();
}

router.get('/', (req, res) => {
  const configured = Boolean(getApiKey());
  return res.json({
    message: 'Gemini chatbot endpoint is ready',
    configured,
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
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

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(503).json({
        message: 'GEMINI_API_KEY is missing in backend .env',
      });
    }

    const userMessage = String(req.body.message || '').trim();
    const context = req.body.context || {};
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    const prompt = `
You are Tradzo AI, an educational assistant for Indian stock market learning.

User message:
${userMessage}

Known user context:
${JSON.stringify(context)}

Rules:
1. Give practical and beginner-friendly tips for Indian markets (NSE/BSE, diversification, SIP discipline, valuation, risk, stop-loss, position sizing, taxation awareness).
2. Keep answer concise and structured in bullet points.
3. Add a short 3-step action plan at the end.
4. Do not promise returns or guaranteed profits.
5. End with: "Educational only, not financial advice."
`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
      const details =
        error?.message ||
        error?.error?.message ||
        (typeof error === 'string' ? error : 'Unknown Gemini error');

      return res.status(500).json({
        message: 'Gemini request failed',
        error: details,
      });
    }
  },
);

module.exports = router;
