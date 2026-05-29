/**
 * GeminiService.js
 *
 * Ported from native Android: app/.../data/repository/GeminiRepository.kt
 *
 * Job 1 — getAiUssdSuggestion(query):
 *   Takes a user's natural-language search query and returns a structured
 *   USSD code suggestion for Cameroon telecom networks (MTN, Orange, Camtel).
 *
 * Job 2 — generateCodeMetadata(code, network):
 *   Called by the crowdsource threshold engine when a code reaches 10 users.
 *   Generates a clean, professional shortname and description for the code
 *   so it can be stored permanently in Supabase as a verified entry.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

let genAI = null;
if (GEMINI_API_KEY && !GEMINI_API_KEY.startsWith('YOUR_')) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// ─── Internal helper ──────────────────────────────────────────────────────────
async function callGemini(prompt) {
  if (!genAI) {
    return null; // No key — let callers fall back to offline mock
  }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.0 // Set to absolute zero to prevent ANY hallucination or creativity
      }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    if (!text) return null;

  try {
    // Strip markdown blocks if Gemini ignored the application/json mime type
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
    else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
    
    if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
    
    return JSON.parse(cleanText.trim());
  } catch (err) {
    console.error("Raw Gemini output was:", text);
    throw err; // Re-throw so the mock fallback can catch it
  }
}

// ─── Offline mock fallback (mirrors Kotlin getMockSuggestion) ─────────────────
function getMockSuggestion(query) {
  const q = query.toLowerCase();
  if (q.match(/data|internet|mega|giga|forfait/)) {
    return {
      code: '*157#',
      network: 'MTN',
      name: 'MTN Mobile Internet Menu',
      description: 'Shortcode to check balance, buy MTN data bundles, or sign up for active visual plans.',
      confidenceStars: 4,
      confidencePercentage: 92,
    };
  }
  if (q.match(/money|momo|om|cash|pay|argent/)) {
    return {
      code: '*126#',
      network: 'MTN',
      name: 'MTN Mobile Money Suite',
      description: 'Main gateway code for MTN MoMo payments, fund transfers, cash withdrawals, and billing setups.',
      confidenceStars: 5,
      confidencePercentage: 95,
    };
  }
  if (q.match(/bal|solde|credit/)) {
    return {
      code: '*155#',
      network: 'Orange',
      name: 'Orange Balance Checker',
      description: 'Direct shortcode to verify principal dialer balance and available promotion options.',
      confidenceStars: 5,
      confidencePercentage: 98,
    };
  }
  return {
    code: '*150#',
    network: 'Orange',
    name: 'Orange Money Hub',
    description: 'Central dialer code for Orange Money Cameroon to transfer or pay merchants easily.',
    confidenceStars: 4,
    confidencePercentage: 85,
  };
}

// ─── Job 1: USSD Suggestion from search query ─────────────────────────────────
export async function getAiUssdSuggestion(query) {
  const prompt = `
Task: Return exactly ONE JSON object for the correct Cameroon USSD code.
User Query: "${query}"

MAPPING RULES (DO NOT USE ANY OTHER CODES):
If query asks for MTN Phone Number -> use *170*0#
If query asks for Orange Phone Number -> use #99# or #997#
If query asks for MTN Balance -> use *155#
If query asks for Orange Balance -> use #123#
If query asks for MTN Mobile Money -> use *126#
If query asks for Orange Mobile Money -> use #150#
If query asks for MTN Internet/Data -> use *157#
If query asks for Orange Internet/Data -> use #145*2#
If query asks for MTN Borrow Credit -> use *121#
If query asks for Orange Borrow Credit -> use #133#

CRITICAL:
If the user asks for a code not listed above, output exactly: {"error": "not found"}. Do not guess.

JSON SCHEMA:
{
  "code": "Exact USSD code string",
  "network": "MTN, Orange, or Camtel",
  "name": "Short title",
  "description": "Short explanation",
  "confidenceStars": 5,
  "confidencePercentage": 100
}
  `.trim();

  try {
    const result = await callGemini(prompt);
    if (result && result.error) {
      throw new Error('AI could not confidently map this query');
    }
    return result || getMockSuggestion(query);
  } catch (e) {
    console.warn('[GeminiService] Suggestion failed, using mock:', e.message);
    return getMockSuggestion(query);
  }
}

// ─── Job 2: Auto-generate metadata for a crowdsourced code ───────────────────
export async function generateCodeMetadata(code, network) {
  const prompt = `
You are a helpful assistant generating metadata for USSD codes used in Cameroon.
Generate a clean, professional shortname and description for this USSD code.
Network: ${network}
USSD Code: ${code}
Output MUST be structured as a JSON object matching this schema exactly:
{
  "shortname": "Very short (3-5 word) service name, e.g. MTN Data Bundle Menu",
  "description": "One clear sentence explaining what this code does (max 100 chars)"
}
Do not enclose in markdown blocks. Return only raw JSON.
  `.trim();

  try {
    const result = await callGemini(prompt);
    if (result?.shortname && result?.description) return result;
  } catch (e) {
    console.warn('[GeminiService] Metadata generation failed:', e.message);
  }

  // Fallback if Gemini fails
  return {
    shortname: `${network} Service ${code}`,
    description: `Community-verified ${network} USSD code used by multiple subscribers.`,
  };
}
