/**
 * TriPay Callback Proxy - GCP Cloud Function
 * 
 * This function forwards TriPay callbacks to Supabase Edge Function
 * while preserving the raw body for signature verification.
 * 
 * Deploy:
 *   gcloud functions deploy tripay-callback \
 *     --runtime nodejs20 \
 *     --trigger-http \
 *     --allow-unauthenticated \
 *     --region asia-southeast2 \
 *     --entry-point tripayCallback
 */

const SUPABASE_EDGE_FUNCTION_URL = 'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback';

/**
 * HTTP Cloud Function for TriPay callback
 * 
 * @param {Object} req Cloud Function request context
 * @param {Object} res Cloud Function response context
 */
exports.tripayCallback = async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Callback-Signature');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
    return;
  }

  try {
    // Get raw body (already parsed by Cloud Functions)
    const rawBody = JSON.stringify(req.body);
    
    // Get signature from header
    const signature = req.get('X-Callback-Signature');
    
    console.log('📥 Callback received');
    console.log('  Signature:', signature);
    console.log('  Body length:', rawBody.length);
    
    if (!signature) {
      console.error('❌ Missing signature');
      res.status(401).json({ 
        success: false, 
        message: 'Missing signature' 
      });
      return;
    }

    // Forward to Supabase Edge Function
    console.log('📤 Forwarding to Edge Function...');
    
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-Signature': signature,
      },
      body: rawBody,
    });

    const data = await response.json();
    
    console.log('📥 Edge Function response:', response.status, data);
    
    // Return response from Edge Function
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
