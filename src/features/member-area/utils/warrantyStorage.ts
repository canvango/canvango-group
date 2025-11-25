import { supabase } from '../../../clients/supabase';

/**
 * Extract file path from public URL or return path as is
 */
const extractFilePath = (urlOrPath: string): string => {
  // If it's already a path (no http), return as is
  if (!urlOrPath.startsWith('http')) {
    return urlOrPath;
  }

  // Extract path from public URL format:
  // https://xxx.supabase.co/storage/v1/object/public/warranty-screenshots/user-id/filename.jpg
  // -> user-id/filename.jpg
  try {
    const url = new URL(urlOrPath);
    const pathParts = url.pathname.split('/warranty-screenshots/');
    if (pathParts.length > 1) {
      return pathParts[1];
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
  }

  return urlOrPath;
};

/**
 * Generate signed URL for warranty screenshot
 * Signed URLs are valid for 1 hour and work with private buckets
 */
export const getWarrantyScreenshotUrl = async (urlOrPath: string): Promise<string | null> => {
  try {
    // Extract file path from URL if needed
    const filePath = extractFilePath(urlOrPath);

    // Generate signed URL valid for 1 hour
    const { data, error } = await supabase.storage
      .from('warranty-screenshots')
      .createSignedUrl(filePath, 3600); // 3600 seconds = 1 hour

    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error in getWarrantyScreenshotUrl:', error);
    return null;
  }
};

/**
 * Generate signed URLs for multiple warranty screenshots
 */
export const getWarrantyScreenshotUrls = async (filePaths: string[]): Promise<string[]> => {
  if (!filePaths || filePaths.length === 0) return [];

  const urlPromises = filePaths.map(path => getWarrantyScreenshotUrl(path));
  const urls = await Promise.all(urlPromises);
  
  // Filter out null values
  return urls.filter((url): url is string => url !== null);
};
