import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get outgoing IP by calling external service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      outgoing_ip: data.ip,
      incoming_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      headers: req.headers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error',
    });
  }
}
