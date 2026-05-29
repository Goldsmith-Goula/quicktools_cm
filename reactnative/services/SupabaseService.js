/**
 * SupabaseService.js
 *
 * Manages all communication with the Supabase backend.
 *
 * Table: crowdsourced_codes
 *   id              uuid (auto)
 *   code            text (e.g. *157#)
 *   network         text (MTN | Orange | Camtel | All)
 *   usage_count     int  (default 1)
 *   shortname       text (nullable — filled by Gemini at threshold)
 *   description     text (nullable — filled by Gemini at threshold)
 *   is_verified     bool (default false — true once threshold reached)
 *   created_at      timestamp (auto)
 *
 * Note: The (code, network) combination has a UNIQUE constraint.
 *       upsert uses that as conflict target.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// ─── Check if backend is actually configured ──────────────────────────────────
const isConfigured =
  SUPABASE_URL &&
  !SUPABASE_URL.startsWith('YOUR_') &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.startsWith('YOUR_');

// Only initialise the client if keys are present
const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const TABLE = 'crowdsourced_codes';
const VERIFIED_THRESHOLD = 10;

// ─── fetchVerifiedCodes ────────────────────────────────────────────────────────
/**
 * Fetches all verified community codes from Supabase at startup.
 * Returns an empty array gracefully when not configured or offline.
 */
export async function fetchVerifiedCodes() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('is_verified', true);

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('[SupabaseService] fetchVerifiedCodes failed:', e.message);
    return [];
  }
}

// ─── registerCodeUsage ────────────────────────────────────────────────────────
/**
 * Called whenever a user:
 *   (a) Submits a new custom code, OR
 *   (b) Dials / saves a Gemini-suggested code.
 *
 * Upserts the (code, network) pair and increments usage_count by 1.
 *
 * Returns the updated usage_count so the caller can detect the threshold.
 * Returns null when Supabase is not configured.
 */
export async function registerCodeUsage(code, network) {
  if (!supabase) return null;

  try {
    // Attempt to insert first; if conflict, increment usage_count
    const { data: existing } = await supabase
      .from(TABLE)
      .select('id, usage_count')
      .eq('code', code)
      .eq('network', network)
      .maybeSingle();

    if (existing) {
      const newCount = (existing.usage_count || 1) + 1;
      await supabase
        .from(TABLE)
        .update({ usage_count: newCount })
        .eq('id', existing.id);
      return newCount;
    } else {
      await supabase
        .from(TABLE)
        .insert({ code, network, usage_count: 1, is_verified: false });
      return 1;
    }
  } catch (e) {
    console.warn('[SupabaseService] registerCodeUsage failed:', e.message);
    return null;
  }
}

// ─── promoteToVerified ────────────────────────────────────────────────────────
/**
 * Called by the threshold engine when usage_count hits VERIFIED_THRESHOLD.
 * Updates the Supabase row with Gemini-generated metadata and marks it verified.
 */
export async function promoteToVerified(code, network, shortname, description) {
  if (!supabase) return;

  try {
    await supabase
      .from(TABLE)
      .update({ shortname, description, is_verified: true })
      .eq('code', code)
      .eq('network', network);
  } catch (e) {
    console.warn('[SupabaseService] promoteToVerified failed:', e.message);
  }
}

export { VERIFIED_THRESHOLD };
