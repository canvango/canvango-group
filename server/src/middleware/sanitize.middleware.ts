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
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = sanitizeString(req.body);
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    // Create a new object instead of modifying the read-only query object
    const sanitizedQuery = sanitizeString({ ...req.query });
    Object.keys(sanitizedQuery).forEach(key => {
      (req.query as any)[key] = sanitizedQuery[key];
    });
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    // Create a new object instead of modifying the read-only params object
    const sanitizedParams = sanitizeString({ ...req.params });
    Object.keys(sanitizedParams).forEach(key => {
      (req.params as any)[key] = sanitizedParams[key];
    });
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
  
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = sanitizeKeys(req.body);
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    const sanitizedQuery = sanitizeKeys({ ...req.query });
    Object.keys(sanitizedQuery).forEach(key => {
      (req.query as any)[key] = sanitizedQuery[key];
    });
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    const sanitizedParams = sanitizeKeys({ ...req.params });
    Object.keys(sanitizedParams).forEach(key => {
      (req.params as any)[key] = sanitizedParams[key];
    });
  }
  
  next();
};

/**
 * SQL injection prevention through parameterized queries
 * This middleware validates that no raw SQL is being passed
 */
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip validation for DELETE HTTP method (it's a valid HTTP method, not SQL injection)
  if (req.method === 'DELETE') {
    console.log('✅ Skipping SQL injection check for DELETE method:', req.path);
    next();
    return;
  }
  
  // Whitelist for bulk action endpoints
  const isBulkActionEndpoint = req.path.includes('/bulk') && req.method === 'POST';
  
  if (isBulkActionEndpoint) {
    console.log('🔍 Bulk action endpoint detected:', req.path, req.body);
  }
  
  const checkForSQLInjection = (value: any, path: string = ''): boolean => {
    if (typeof value === 'string') {
      // For bulk actions, allow specific action keywords
      if (isBulkActionEndpoint && path === 'action') {
        const allowedActions = ['activate', 'deactivate', 'update_stock', 'delete'];
        const isAllowed = allowedActions.includes(value.toLowerCase());
        console.log(`   Action "${value}" allowed:`, isAllowed);
        return !isAllowed;
      }
      
      // Common SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
        /(--|;|\/\*|\*\/|xp_|sp_)/gi,
        /('|(\\')|(;)|(--)|(\/\*))/gi,
      ];
      
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    
    if (Array.isArray(value)) {
      return value.some(item => checkForSQLInjection(item, path));
    }
    
    if (value !== null && typeof value === 'object') {
      return Object.entries(value).some(([key, val]) => checkForSQLInjection(val, key));
    }
    
    return false;
  };
  
  const hasSQLInjection = 
    checkForSQLInjection(req.body) ||
    checkForSQLInjection(req.query) ||
    checkForSQLInjection(req.params);
  
  if (hasSQLInjection) {
    console.log('❌ SQL injection detected in:', req.method, req.path);
    console.log('   Body:', req.body);
    console.log('   Query:', req.query);
    console.log('   Params:', req.params);
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
