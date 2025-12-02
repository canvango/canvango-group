/**
 * Save Account Data
 * Create or update account data with automatic encryption
 * 
 * SECURITY:
 * - Only superadmin can create/update account data
 * - All new data is automatically encrypted
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encryptAccountData } from '../_shared/encryption.ts';
import { logSecurityEvent, logUnauthorizedAccess } from '../_shared/audit.ts';
import { SecuritySeverity, SecurityEventType } from '../_shared/constants.ts';
import { FEATURE_FLAGS } from '../_shared/constants.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is superadmin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'superadmin') {
      await logUnauthorizedAccess(supabase, {
        endpoint: '/save-account-data',
        source_ip: 'unknown',
        user_id: user.id,
        reason: 'Non-superadmin attempted to save account data',
      });

      return new Response(
        JSON.stringify({ success: false, message: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { account_id, product_id, account_data, status } = body;

    if (!account_data) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing account_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Encrypt account data if encryption is enabled
    let dataToStore = account_data;
    
    if (FEATURE_FLAGS.ENABLE_ENCRYPTION) {
      try {
        dataToStore = await encryptAccountData(account_data);
        console.log('✅ Account data encrypted');
      } catch (error) {
        console.error('❌ Encryption failed:', error);
        
        await logSecurityEvent(supabase, {
          event_type: SecurityEventType.ENCRYPTION_KEY_ACCESS,
          severity: SecuritySeverity.HIGH,
          user_id: user.id,
          endpoint: '/save-account-data',
          details: {
            error: 'Encryption failed',
          },
        });

        return new Response(
          JSON.stringify({ success: false, message: 'Failed to encrypt account data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.warn('⚠️ Encryption disabled - storing plaintext');
    }

    // Create or update account
    let result;
    if (account_id) {
      // Update existing account
      const { data, error } = await supabase
        .from('product_accounts')
        .update({
          account_data: dataToStore,
          status: status || 'available',
          updated_at: new Date().toISOString(),
        })
        .eq('id', account_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update account:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to update account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      result = data;
      console.log('✅ Account updated:', account_id);
    } else {
      // Create new account
      if (!product_id) {
        return new Response(
          JSON.stringify({ success: false, message: 'Missing product_id for new account' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('product_accounts')
        .insert({
          product_id,
          account_data: dataToStore,
          status: status || 'available',
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create account:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to create account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      result = data;
      console.log('✅ Account created:', result.id);
    }

    // Log account data save
    await logSecurityEvent(supabase, {
      event_type: SecurityEventType.ENCRYPTION_KEY_ACCESS,
      severity: SecuritySeverity.LOW,
      user_id: user.id,
      endpoint: '/save-account-data',
      details: {
        account_id: result.id,
        product_id: result.product_id,
        action: account_id ? 'update' : 'create',
        encrypted: FEATURE_FLAGS.ENABLE_ENCRYPTION,
      },
    });

    // Return success (without decrypted data)
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: result.id,
          product_id: result.product_id,
          status: result.status,
          encrypted: FEATURE_FLAGS.ENABLE_ENCRYPTION,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error saving account data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
