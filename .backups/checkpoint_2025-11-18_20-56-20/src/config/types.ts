export interface GitHubConfig {
  token: string;
  owner?: string;
  repository?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class IntegrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public service: 'github' | 'supabase' | 'config',
    public recoverable: boolean
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export const ERROR_CODES = {
  MISSING_CONFIG: 'MISSING_CONFIG',
  INVALID_TOKEN: 'INVALID_TOKEN',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INVALID_FORMAT: 'INVALID_FORMAT'
} as const;
