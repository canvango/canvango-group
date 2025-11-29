import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
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
        JSON.stringify({ success: false, message: 'Missing authorization' }),
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

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Tripay credentials from database first, fallback to environment
    let tripayApiKey = '';
    let tripayMode = 'production';

    try {
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('tripay_config')
        .limit(1)
        .single();

      if (!settingsError && settings?.tripay_config) {
        const config = settings.tripay_config;
        tripayApiKey = config.api_key || '';
        tripayMode = config.mode || 'production';
        console.log('✅ Using Tripay credentials from database');
      } else {
        throw new Error('No database config');
      }
    } catch (dbError) {
      console.log('⚠️ Database config not found, using environment variables');
      tripayApiKey = Deno.env.get('TRIPAY_API_KEY') || '';
      tripayMode = Deno.env.get('TRIPAY_MODE') || 'production';
    }

    if (!tripayApiKey) {
      throw new Error('Tripay API key not configured');
    }

    // Determine Tripay API URL based on mode
    const tripayBaseUrl = tripayMode === 'production' 
      ? 'https://tripay.co.id/api'
      : 'https://tripay.co.id/api-sandbox';

    console.log('🚀 Fetching payment channels from Tripay');
    console.log('📍 Mode:', tripayMode);
    console.log('🔑 API Key:', tripayApiKey?.substring(0, 10) + '...');

    // Call Tripay API to get payment channels
    const tripayResponse = await fetch(`${tripayBaseUrl}/merchant/payment-channel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tripayApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Tripay response status:', tripayResponse.status);
    
    const tripayData = await tripayResponse.json();
    console.log('📦 Tripay response:', JSON.stringify(tripayData, null, 2));

    if (!tripayData.success) {
      console.error('❌ Tripay API error:', tripayData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: tripayData.message || 'Failed to fetch payment channels' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Payment channels fetched successfully');
    console.log('📊 Total channels:', tripayData.data?.length || 0);

    // Return success response
    return new Response(
      JSON.stringify(tripayData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error fetching payment channels:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
