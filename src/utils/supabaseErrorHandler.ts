/**
 * Centralized Supabase Error Handler
 * 
 * Provides consistent error handling across all Supabase operations
 * with user-friendly messages and development logging.
 */

export interface SupabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

/**
 * Map of Supabase error codes to user-friendly messages in Indonesian
 */
const ERROR_MESSAGES: Record<string, string> = {
  // PostgreSQL constraint violations
  '23505': 'Data sudah ada. Silakan gunakan data yang berbeda.',
  '23503': 'Data terkait tidak ditemukan.',
  '23502': 'Data wajib tidak boleh kosong.',
  '23514': 'Data tidak memenuhi persyaratan validasi.',
  
  // PostgreSQL permission errors
  '42501': 'Anda tidak memiliki izin untuk operasi ini.',
  '42P01': 'Tabel tidak ditemukan.',
  
  // PostgREST errors
  'PGRST116': 'Data tidak ditemukan.',
  'PGRST204': 'Data tidak ditemukan.',
  'PGRST301': 'Permintaan tidak valid.',
  
  // Auth errors
  'invalid_grant': 'Email atau password salah.',
  'email_not_confirmed': 'Email belum diverifikasi. Silakan cek inbox Anda.',
  'user_not_found': 'Pengguna tidak ditemukan.',
  'invalid_credentials': 'Email atau password salah.',
  'email_exists': 'Email sudah terdaftar.',
  'weak_password': 'Password terlalu lemah. Gunakan minimal 6 karakter.',
  
  // Network errors
  'ECONNREFUSED': 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  'ETIMEDOUT': 'Koneksi timeout. Silakan coba lagi.',
  'ENOTFOUND': 'Server tidak ditemukan. Periksa koneksi internet Anda.',
};

/**
 * Get user-friendly error message based on error code
 */
function getUserFriendlyMessage(error: SupabaseError): string {
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  // Check if error message contains known patterns
  const message = error.message.toLowerCase();
  
  if (message.includes('duplicate key')) {
    return ERROR_MESSAGES['23505'];
  }
  if (message.includes('foreign key')) {
    return ERROR_MESSAGES['23503'];
  }
  if (message.includes('not null')) {
    return ERROR_MESSAGES['23502'];
  }
  if (message.includes('permission denied') || message.includes('insufficient privilege')) {
    return ERROR_MESSAGES['42501'];
  }
  if (message.includes('not found')) {
    return ERROR_MESSAGES['PGRST116'];
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Terjadi kesalahan jaringan. Silakan coba lagi.';
  }
  
  // Return original message if no mapping found
  return error.message || 'Terjadi kesalahan. Silakan coba lagi.';
}

/**
 * Log error details in development mode
 */
function logError(context: string, error: SupabaseError, additionalInfo?: any) {
  if (import.meta.env.DEV) {
    console.group(`🔴 Supabase Error: ${context}`);
    console.error('Error Code:', error.code || 'N/A');
    console.error('Error Message:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    if (additionalInfo) {
      console.error('Additional Info:', additionalInfo);
    }
    console.groupEnd();
  }
}

/**
 * Handle Supabase operation with centralized error handling
 * 
 * @param operation - Async function that performs Supabase operation
 * @param context - Context string for logging (e.g., 'fetchWarrantyClaims')
 * @returns Promise with operation result
 * @throws Error with user-friendly message
 * 
 * @example
 * ```typescript
 * const claims = await handleSupabaseOperation(
 *   async () => {
 *     const { data, error } = await supabase
 *       .from('warranty_claims')
 *       .select('*');
 *     return { data, error };
 *   },
 *   'fetchWarrantyClaims'
 * );
 * ```
 */
export async function handleSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: string
): Promise<T> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      logError(context, error);
      const userMessage = getUserFriendlyMessage(error);
      throw new Error(userMessage);
    }
    
    if (data === null || data === undefined) {
      const noDataError = {
        code: 'NO_DATA',
        message: 'Tidak ada data yang dikembalikan',
      };
      logError(context, noDataError);
      throw new Error('Tidak ada data yang dikembalikan');
    }
    
    return data;
  } catch (error: any) {
    // If error is already thrown by us, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle unexpected errors
    const unexpectedError = {
      code: 'UNEXPECTED',
      message: error?.message || 'Terjadi kesalahan yang tidak terduga',
    };
    logError(context, unexpectedError, error);
    throw new Error('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
  }
}

/**
 * Handle Supabase mutation operation (insert, update, delete)
 * Similar to handleSupabaseOperation but optimized for mutations
 * 
 * @param operation - Async function that performs Supabase mutation
 * @param context - Context string for logging
 * @param allowNull - Whether null data is acceptable (e.g., for delete operations)
 * @returns Promise with operation result
 * @throws Error with user-friendly message
 */
export async function handleSupabaseMutation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: string,
  allowNull: boolean = false
): Promise<T | null> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      logError(context, error);
      const userMessage = getUserFriendlyMessage(error);
      throw new Error(userMessage);
    }
    
    if (!allowNull && (data === null || data === undefined)) {
      const noDataError = {
        code: 'NO_DATA',
        message: 'Operasi gagal, tidak ada data yang dikembalikan',
      };
      logError(context, noDataError);
      throw new Error('Operasi gagal. Silakan coba lagi.');
    }
    
    return data;
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    
    const unexpectedError = {
      code: 'UNEXPECTED',
      message: error?.message || 'Terjadi kesalahan yang tidak terduga',
    };
    logError(context, unexpectedError, error);
    throw new Error('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
  }
}

/**
 * Handle Supabase auth operation
 * Specialized handler for authentication operations
 * 
 * @param operation - Async function that performs Supabase auth operation
 * @param context - Context string for logging
 * @returns Promise with operation result
 * @throws Error with user-friendly message
 */
export async function handleSupabaseAuth<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context: string
): Promise<T> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      logError(context, error);
      
      // Special handling for auth errors
      const authErrorMessages: Record<string, string> = {
        'invalid_credentials': 'Email atau password salah.',
        'email_not_confirmed': 'Email belum diverifikasi. Silakan cek inbox Anda.',
        'user_not_found': 'Pengguna tidak ditemukan.',
        'email_exists': 'Email sudah terdaftar.',
        'weak_password': 'Password terlalu lemah. Gunakan minimal 6 karakter.',
        'invalid_grant': 'Email atau password salah.',
      };
      
      const userMessage = authErrorMessages[error.message] || 
                         authErrorMessages[error.code] || 
                         getUserFriendlyMessage(error);
      throw new Error(userMessage);
    }
    
    if (!data) {
      throw new Error('Autentikasi gagal. Silakan coba lagi.');
    }
    
    return data;
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    
    const unexpectedError = {
      code: 'UNEXPECTED',
      message: error?.message || 'Terjadi kesalahan autentikasi',
    };
    logError(context, unexpectedError, error);
    throw new Error('Terjadi kesalahan autentikasi. Silakan coba lagi.');
  }
}
