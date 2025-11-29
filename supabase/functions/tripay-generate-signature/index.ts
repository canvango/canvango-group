import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Tripay config from database
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('tripay_config')
      .limit(1)
      .single();

    if (settingsError || !settings?.tripay_config) {
      throw new Error('Tripay configuration not found');
    }

    const config = settings.tripay_config;
    const { merchant_code, private_key } = config;

    if (!merchant_code || !private_key) {
      throw new Error('Tripay credentials incomplete');
    }

    // Parse request
    const { merchant_ref, amount } = await req.json();

    if (!merchant_ref || !amount) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate signature
    const signatureString = `${merchant_code}${merchant_ref}${amount}`;
    const hmac = createHmac('sha256', private_key);
    hmac.update(signatureString);
    const signature = hmac.digest('hex');

    console.log('✅ Signature generated for:', merchant_ref);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          signature,
          merchant_code,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error generating signature:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
