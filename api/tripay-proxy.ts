import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// GCP Proxy URL
const GCP_PROXY_URL = process.env.GCP_PROXY_URL || 'http://34.182.126.200:3000';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Forward request to GCP proxy
    const response = await axios.post(
      `${GCP_PROXY_URL}/create-transaction`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds
      }
    );

    // Return response from GCP proxy
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error forwarding to GCP proxy:', error.message);
    
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
