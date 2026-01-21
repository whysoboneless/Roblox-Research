/**
 * Supabase Client
 * Database connection and configuration
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Supabase credentials not configured. Database features disabled.');
  console.warn('Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
}

// Create client (will be null if credentials missing)
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

/**
 * Check if database is configured and connected
 */
export async function isConnected() {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('games').select('id').limit(1);
    // Table might not exist yet, but connection works if no network error
    return !error || error.code === 'PGRST116'; // PGRST116 = table doesn't exist
  } catch (e) {
    return false;
  }
}

/**
 * Test connection and return status
 */
export async function testConnection() {
  if (!supabase) {
    return {
      connected: false,
      error: 'Supabase credentials not configured'
    };
  }

  try {
    // Try to query any table
    const { data, error } = await supabase.from('games').select('count').limit(1);

    if (error) {
      // Check if it's just missing table vs real connection error
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return {
          connected: true,
          tablesExist: false,
          message: 'Connected but tables not created. Run the migration SQL.'
        };
      }
      return {
        connected: false,
        error: error.message
      };
    }

    return {
      connected: true,
      tablesExist: true,
      message: 'Connected successfully'
    };
  } catch (e) {
    return {
      connected: false,
      error: e.message
    };
  }
}

export default supabase;
