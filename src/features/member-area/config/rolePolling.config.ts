/**
 * Role Polling Configuration
 * 
 * Configures the role polling mechanism that detects role changes
 * for logged-in users.
 */

/**
 * Default polling interval in milliseconds (5 seconds)
 */
export const DEFAULT_ROLE_POLLING_INTERVAL = 5000;

/**
 * Get the configured role polling interval from environment variable
 * Falls back to default if not configured or invalid
 * 
 * @returns Polling interval in milliseconds
 */
export const getRolePollingInterval = (): number => {
  const envValue = import.meta.env.VITE_ROLE_POLLING_INTERVAL;
  
  if (!envValue) {
    return DEFAULT_ROLE_POLLING_INTERVAL;
  }
  
  const parsed = parseInt(envValue, 10);
  
  // Validate: must be a positive number and at least 1 second
  if (isNaN(parsed) || parsed < 1000) {
    console.warn(
      `Invalid VITE_ROLE_POLLING_INTERVAL: ${envValue}. Using default: ${DEFAULT_ROLE_POLLING_INTERVAL}ms`
    );
    return DEFAULT_ROLE_POLLING_INTERVAL;
  }
  
  return parsed;
};

/**
 * Check if role polling is enabled
 * Can be disabled by setting VITE_ROLE_POLLING_ENABLED=false
 * 
 * @returns true if polling is enabled, false otherwise
 */
export const isRolePollingEnabled = (): boolean => {
  const envValue = import.meta.env.VITE_ROLE_POLLING_ENABLED;
  
  // Default to enabled if not specified
  if (envValue === undefined || envValue === '') {
    return true;
  }
  
  // Check for explicit false values
  return envValue !== 'false' && envValue !== '0' && envValue !== 'no';
};

/**
 * Check if Realtime subscription should be used instead of polling
 * Can be enabled by setting VITE_USE_REALTIME_ROLE_UPDATES=true
 * 
 * @returns true if Realtime should be used, false for polling
 */
export const useRealtimeRoleUpdates = (): boolean => {
  const envValue = import.meta.env.VITE_USE_REALTIME_ROLE_UPDATES;
  
  // Default to false (use polling)
  if (envValue === undefined || envValue === '') {
    return false;
  }
  
  // Check for explicit true values
  return envValue === 'true' || envValue === '1' || envValue === 'yes';
};
