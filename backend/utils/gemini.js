// Gemini AI utility with multi-key rotation
// Ported from the original utils/Geminimodel.js
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const keyPool = (() => {
  const keys = process.env.GEMINI_API_KEYS || '';
  return keys.split(',').map(k => k.trim()).filter(Boolean);
})();

if (keyPool.length === 0) {
  console.warn('[Gemini] No API keys found. Set GEMINI_API_KEYS in .env');
} else {
  console.log(`[Gemini] Initialized with ${keyPool.length} key(s)`);
}

let currentKeyIndex = 0;

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 2048,
  responseMimeType: 'application/json',
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
];

function isKeyExhausted(error) {
  const msg = (error?.message || '').toLowerCase();
  const status = error?.status || error?.code;
  if ([400, 429, 403, 500, 503].includes(status)) return true;
  return (
    msg.includes('resource has been exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('api key not valid') ||
    msg.includes('permission denied') ||
    msg.includes('503') ||
    msg.includes('overloaded')
  );
}

function buildChatSession(apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  return model.startChat({ generationConfig, safetySettings });
}

async function sendMessage(prompt) {
  const total = keyPool.length;
  if (total === 0) throw new Error('[Gemini] No API keys configured.');

  let lastError;
  for (let attempt = 0; attempt < total; attempt++) {
    const key = keyPool[currentKeyIndex];
    try {
      const session = buildChatSession(key);
      const result = await session.sendMessage(prompt);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`[Gemini] Key #${currentKeyIndex + 1} failed: ${error?.message}`);
      if (isKeyExhausted(error) && total > 1) {
        currentKeyIndex = (currentKeyIndex + 1) % total;
        console.info(`[Gemini] Rotating to key #${currentKeyIndex + 1}`);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

module.exports = { sendMessage };
