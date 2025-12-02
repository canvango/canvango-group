/**
 * Migrate Account Encryption
 * Background job to encrypt existing plaintext account data
 * 
 * SECURITY:
 * - Only superadmin can run this migration
 * - Processes accounts in batches to avoid load spikes
 * - Verifies data integrity after encryption
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encryptAccountData, decryptAccountData, isEncrypted } from '../_shared/encryption.ts';
import { logSecurityEvent, logUnauthorizedAccess } from '../_shared/audit.ts';
import { SecuritySeverity, SecurityEventType } from '../_shared/constants.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 100; // Process 100 accounts per batch

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
        endpoint: '/migrate-account-encryption',
        source_ip: 'unknown',
        user_id: user.id,
        reason: 'Non-superadmin attempted to run encryption migration',
      });

      return new Response(
        JSON.stringify({ success: false, message: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Starting account encryption migration...');

    // Get all accounts with plaintext data
    const { data: accounts, error: fetchError } = await supabase
      .from('product_accounts')
      .select('id, account_data')
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error('❌ Failed to fetch accounts:', fetchError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch accounts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!accounts || accounts.length === 0) {
      console.log('✅ No accounts to migrate');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No accounts to migrate',
          migrated: 0,
          failed: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let migrated = 0;
    let failed = 0;
    let skipped = 0;
    const errors: any[] = [];

    // Process each account
    for (const account of accounts) {
      try {
        // Skip if already encrypted
        if (isEncrypted(account.account_data)) {
          console.log(`⏭️ Account ${account.id} already encrypted, skipping`);
          skipped++;
          continue;
        }

        // Encrypt the data
        const encryptedData = await encryptAccountData(account.account_data);

        // Verify encryption by decrypting
        const decryptedData = await decryptAccountData(encryptedData);
        
        // Compare original and decrypted data
        const originalStr = JSON.stringify(account.account_data);
        const decryptedStr = JSON.stringify(decryptedData);
        
        if (originalStr !== decryptedStr) {
          throw new Error('Data integrity check failed - decrypted data does not match original');
        }

        // Update account with encrypted data
        const { error: updateError } = await supabase
          .from('product_accounts')
          .update({
            account_data: encryptedData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Account ${account.id} encrypted successfully`);
        migrated++;

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.error(`❌ Failed to encrypt account ${account.id}:`, error);
        failed++;
        errors.push({
          account_id: account.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log migration results
    await logSecurityEvent(supabase, {
      event_type: SecurityEventType.ENCRYPTION_KEY_ACCESS,
      severity: SecuritySeverity.MEDIUM,
      user_id: user.id,
      endpoint: '/migrate-account-encryption',
      details: {
        action: 'Batch migration completed',
        total_processed: accounts.length,
        migrated,
        failed,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
      },
    });

    console.log('✅ Migration batch completed:', {
      total: accounts.length,
      migrated,
      failed,
      skipped,
    });

    // Return results
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Migration batch completed',
        total_processed: accounts.length,
        migrated,
        failed,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
        has_more: accounts.length === BATCH_SIZE,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in migration:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
