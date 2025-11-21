import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to enforce HTTPS in production
 * Redirects HTTP requests to HTTPS
 */
export const enforceHTTPS = (req: Request, res: Response, next: NextFunction): void => {
  // Only enforce HTTPS in production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  // Check if request is already secure
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }
  
  // Redirect to HTTPS
  const httpsUrl = `https://${req.headers.host}${req.url}`;
  console.log(`🔒 Redirecting HTTP to HTTPS: ${httpsUrl}`);
  res.redirect(301, httpsUrl);
};

/**
 * Middleware to set Strict-Transport-Security header
 * Tells browsers to only use HTTPS for future requests
 */
export const setHSTSHeader = (req: Request, res: Response, next: NextFunction): void => {
  // Only set HSTS in production
  if (process.env.NODE_ENV === 'production') {
    // max-age=31536000 (1 year), includeSubDomains, preload
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  next();
};

/**
 * Combined HTTPS security middleware
 */
export const httpsSecurityMiddleware = [
  enforceHTTPS,
  setHSTSHeader,
];
