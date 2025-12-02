/**
 * Get Account Data
 * Retrieve and decrypt account data for authorized users
 * 
 * SECURITY:
 * - Superadmin: Can access any account
 * - User: Can only access their own purchased accounts
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decryptAccountData, isEncrypted } from '../_shared/encryption.ts';
import { logSecurityEvent, logUnauthorizedAccess } from '../_shared/audit.ts';
import { SecuritySeverity, SecurityEventType } from '../_shared/constants.ts';

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

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userRole = userData.role;

    // Parse request body
    const body = await req.json();
    const { account_id } = body;

    if (!account_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing account_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get account data
    const { data: account, error: accountError } = await supabase
      .from('product_accounts')
      .select('*, products(product_name)')
      .eq('id', account_id)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ success: false, message: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check authorization
    const isSuperadmin = userRole === 'superadmin';
    const isOwner = account.assigned_to_transaction_id && await checkOwnership(
      supabase,
      user.id,
      account.assigned_to_transaction_id
    );

    if (!isSuperadmin && !isOwner) {
      await logUnauthorizedAccess(supabase, {
        endpoint: '/get-account-data',
        source_ip: 'unknown',
        user_id: user.id,
        reason: 'Attempted to access account without permission',
      });

      return new Response(
        JSON.stringify({ success: false, message: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt account data if encrypted
    let decryptedData = account.account_data;
    
    if (isEncrypted(account.account_data)) {
      try {
        decryptedData = await decryptAccountData(account.account_data);
        console.log('✅ Account data decrypted for user:', user.id);
      } catch (error) {
        console.error('❌ Decryption failed:', error);
        
        await logSecurityEvent(supabase, {
          event_type: SecurityEventType.ENCRYPTION_KEY_ACCESS,
          severity: SecuritySeverity.HIGH,
          user_id: user.id,
          endpoint: '/get-account-data',
          details: {
            account_id,
            error: 'Decryption failed',
          },
        });

        return new Response(
          JSON.stringify({ success: false, message: 'Failed to decrypt account data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Log access
    await logSecurityEvent(supabase, {
      event_type: SecurityEventType.ENCRYPTION_KEY_ACCESS,
      severity: SecuritySeverity.LOW,
      user_id: user.id,
      endpoint: '/get-account-data',
      details: {
        account_id,
        product_name: account.products?.product_name,
        was_encrypted: isEncrypted(account.account_data),
      },
    });

    // Return decrypted data
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: account.id,
          product_id: account.product_id,
          product_name: account.products?.product_name,
          account_data: decryptedData,
          status: account.status,
          assigned_at: account.assigned_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error getting account data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Check if user owns the transaction
 */
async function checkOwnership(
  supabase: any,
  userId: string,
  transactionId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('transactions')
    .select('user_id')
    .eq('id', transactionId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.user_id === userId;
}
