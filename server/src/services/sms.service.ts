/**
 * SMS Service for sending OTP
 * 
 * IMPORTANT: Choose ONE provider and uncomment the implementation
 * Add the required npm package and environment variables
 */

// ============================================
// OPTION 1: TWILIO (Recommended - Global)
// ============================================
// npm install twilio
// 
// import twilio from 'twilio';
// 
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID!,
//   process.env.TWILIO_AUTH_TOKEN!
// );
// 
// export const sendOTPSMS = async (phone: string, code: string): Promise<void> => {
//   try {
//     await twilioClient.messages.create({
//       body: `Kode OTP Canvango: ${code}. Berlaku 10 menit. Jangan bagikan kode ini.`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: phone
//     });
//     console.log(`✅ OTP sent to ${phone} via Twilio`);
//   } catch (error) {
//     console.error('Twilio SMS error:', error);
//     throw new Error('Failed to send OTP SMS');
//   }
// };

// ============================================
// OPTION 2: ZENZIVA (Indonesia)
// ============================================
// npm install axios (already installed)
// 
// import axios from 'axios';
// 
// export const sendOTPSMS = async (phone: string, code: string): Promise<void> => {
//   try {
//     await axios.post('https://console.zenziva.net/wareguler/api/sendWA/', {
//       userkey: process.env.ZENZIVA_USERKEY,
//       passkey: process.env.ZENZIVA_PASSKEY,
//       to: phone,
//       message: `Kode OTP Canvango: ${code}. Berlaku 10 menit. Jangan bagikan kode ini.`
//     });
//     console.log(`✅ OTP sent to ${phone} via Zenziva`);
//   } catch (error) {
//     console.error('Zenziva SMS error:', error);
//     throw new Error('Failed to send OTP SMS');
//   }
// };

// ============================================
// OPTION 3: VONAGE (Nexmo) (Global)
// ============================================
// npm install @vonage/server-sdk
// 
// import { Vonage } from '@vonage/server-sdk';
// 
// const vonage = new Vonage({
//   apiKey: process.env.VONAGE_API_KEY!,
//   apiSecret: process.env.VONAGE_API_SECRET!
// });
// 
// export const sendOTPSMS = async (phone: string, code: string): Promise<void> => {
//   try {
//     await vonage.sms.send({
//       to: phone,
//       from: 'Canvango',
//       text: `Kode OTP Canvango: ${code}. Berlaku 10 menit. Jangan bagikan kode ini.`
//     });
//     console.log(`✅ OTP sent to ${phone} via Vonage`);
//   } catch (error) {
//     console.error('Vonage SMS error:', error);
//     throw new Error('Failed to send OTP SMS');
//   }
// };

// ============================================
// OPTION 4: AWS SNS (If using AWS)
// ============================================
// npm install @aws-sdk/client-sns
// 
// import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
// 
// const snsClient = new SNSClient({ 
//   region: process.env.AWS_REGION || 'ap-southeast-1' 
// });
// 
// export const sendOTPSMS = async (phone: string, code: string): Promise<void> => {
//   try {
//     await snsClient.send(new PublishCommand({
//       PhoneNumber: phone,
//       Message: `Kode OTP Canvango: ${code}. Berlaku 10 menit. Jangan bagikan kode ini.`
//     }));
//     console.log(`✅ OTP sent to ${phone} via AWS SNS`);
//   } catch (error) {
//     console.error('AWS SNS error:', error);
//     throw new Error('Failed to send OTP SMS');
//   }
// };

// ============================================
// DEVELOPMENT MODE (Current - No SMS sent)
// ============================================
export const sendOTPSMS = async (phone: string, code: string): Promise<void> => {
  // In development, just log the OTP
  if (process.env.NODE_ENV === 'development') {
    console.log('='.repeat(50));
    console.log('📱 OTP SMS (DEVELOPMENT MODE)');
    console.log('='.repeat(50));
    console.log(`Phone: ${phone}`);
    console.log(`OTP Code: ${code}`);
    console.log(`Message: Kode OTP Canvango: ${code}. Berlaku 10 menit.`);
    console.log('='.repeat(50));
    return;
  }

  // In production without SMS provider configured
  console.warn('⚠️  SMS provider not configured. OTP not sent to:', phone);
  throw new Error('SMS provider not configured');
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Indonesian phone format: +62xxx or 08xxx
  const phoneRegex = /^(\+?62|0)8[0-9]{8,12}$/;
  return phoneRegex.test(phone);
};

/**
 * Normalize phone number to international format
 */
export const normalizePhoneNumber = (phone: string): string => {
  // Convert 08xxx to +62xxx
  if (phone.startsWith('0')) {
    return '+62' + phone.substring(1);
  }
  // Add + if missing
  if (!phone.startsWith('+')) {
    return '+' + phone;
  }
  return phone;
};
