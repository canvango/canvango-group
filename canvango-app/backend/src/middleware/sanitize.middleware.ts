import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize input to prevent XSS attacks
 * Removes potentially dangerous HTML/script tags from strings
 */
const sanitizeString = (value: any): any => {
  if (typeof value === 'string') {
    // Remove script tags and their content
    let sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers (onclick, onerror, etc.)
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
    
    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove data: protocol (can be used for XSS)
    sanitized = sanitized.replace(/data:text\/html/gi, '');
    
    // Remove potentially dangerous HTML tags
    const dangerousTags = ['iframe', 'object', 'embed', 'applet', 'meta', 'link', 'style'];
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
      // Also remove self-closing tags
      const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
      sanitized = sanitized.replace(selfClosingRegex, '');
    });
    
    return sanitized.trim();
  }
  
  if (Array.isArray(value)) {
    return value.map(item => sanitizeString(item));
  }
  
  if (value !== null && typeof value === 'object') {
    const sanitized: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        sanitized[key] = sanitizeString(value[key]);
      }
    }
    return sanitized;
  }
  
  return value;
};

/**
 * Middleware to sanitize request body, query, and params
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeString(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeString(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeString(req.params);
  }
  
  next();
};

/**
 * Prevent NoSQL injection by removing $ and . from keys
 */
export const preventNoSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeKeys = (obj: any): any => {
    if (obj !== null && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeKeys(item));
      }
      
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // Remove $ and . from keys to prevent NoSQL injection
          const sanitizedKey = key.replace(/[$\.]/g, '');
          sanitized[sanitizedKey] = sanitizeKeys(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitizeKeys(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeKeys(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeKeys(req.params);
  }
  
  next();
};

/**
 * SQL injection prevention through parameterized queries
 * This middleware validates that no raw SQL is being passed
 */
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value === 'string') {
      // Common SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
        /(--|;|\/\*|\*\/|xp_|sp_)/gi,
        /('|(\\')|(;)|(--)|(\/\*))/gi,
      ];
      
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    
    if (Array.isArray(value)) {
      return value.some(item => checkForSQLInjection(item));
    }
    
    if (value !== null && typeof value === 'object') {
      return Object.values(value).some(val => checkForSQLInjection(val));
    }
    
    return false;
  };
  
  const hasSQLInjection = 
    checkForSQLInjection(req.body) ||
    checkForSQLInjection(req.query) ||
    checkForSQLInjection(req.params);
  
  if (hasSQLInjection) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Input mengandung karakter yang tidak diizinkan.',
      },
    });
    return;
  }
  
  next();
};
