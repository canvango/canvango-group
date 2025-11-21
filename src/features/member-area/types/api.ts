export interface APIKey {
  key: string;
  createdAt: Date;
  lastUsed?: Date | null;
  usageCount: number;
}

export interface APIStats {
  totalRequests: number;
  requestsToday: number;
  lastRequest: Date | null;
  rateLimit: number;
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters: APIParameter[];
  requestExample?: string;
  responseExample?: string;
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}
