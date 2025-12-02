/**
 * Audit and Security Event Logging
 * Comprehensive logging for security events and monitoring
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SecuritySeverity, SecurityEventType } from './constants.ts';

export interface SecurityEvent {
  event_type: SecurityEventType | string;
  severity: SecuritySeverity;
  source_ip?: string;
  user_id?: string;
  endpoint?: string;
  details?: Record<string, any>;
}

export interface AuditLogEntry {
  admin_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log security event to security_events table
 */
export async function logSecurityEvent(
  supabase: SupabaseClient,
  event: SecurityEvent
): Promise<void> {
  try {
    const { error } = await supabase
      .from('security_events')
      .insert({
        event_type: event.event_type,
        severity: event.severity,
        source_ip: event.source_ip,
        user_id: event.user_id,
        endpoint: event.endpoint,
        details: event.details || {},
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to log security event:', error);
    } else {
      console.log(`🔒 Security event logged: ${event.event_type} (${event.severity})`);
    }

    // Alert admin for critical events
    if (event.severity === SecuritySeverity.CRITICAL) {
      await alertAdmin(supabase, event);
    }
  } catch (err) {
    console.error('❌ Error logging security event:', err);
  }
}

/**
 * Log to audit_logs table
 */
export async function logAuditEvent(
  supabase: SupabaseClient,
  entry: AuditLogEntry
): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        admin_id: entry.admin_id,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resource_id,
        details: entry.details || {},
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Failed to log audit event:', error);
    }
  } catch (err) {
    console.error('❌ Error logging audit event:', err);
  }
}

/**
 * Log callback attempt (success or failure)
 */
export async function logCallbackAttempt(
  supabase: SupabaseClient,
  data: {
    reference: string;
    merchant_ref: string;
    status: string;
    success: boolean;
    source_ip: string;
    error?: string;
    signature_valid?: boolean;
    ip_valid?: boolean;
  }
): Promise<void> {
  const severity = data.success ? SecuritySeverity.LOW : SecuritySeverity.HIGH;
  const event_type = data.success
    ? SecurityEventType.CALLBACK_RECEIVED
    : data.signature_valid === false
    ? SecurityEventType.CALLBACK_SIGNATURE_FAIL
    : data.ip_valid === false
    ? SecurityEventType.CALLBACK_IP_FAIL
    : SecurityEventType.CALLBACK_RECEIVED;

  await logSecurityEvent(supabase, {
    event_type,
    severity,
    source_ip: data.source_ip,
    endpoint: '/tripay-callback',
    details: {
      reference: data.reference,
      merchant_ref: data.merchant_ref,
      status: data.status,
      success: data.success,
      error: data.error,
      signature_valid: data.signature_valid,
      ip_valid: data.ip_valid,
    },
  });
}

/**
 * Log transaction mismatch
 */
export async function logTransactionMismatch(
  supabase: SupabaseClient,
  data: {
    reference: string;
    merchant_ref: string;
    mismatch_type: string;
    expected: any;
    received: any;
    source_ip: string;
  }
): Promise<void> {
  await logSecurityEvent(supabase, {
    event_type: SecurityEventType.TRANSACTION_MISMATCH,
    severity: SecuritySeverity.CRITICAL,
    source_ip: data.source_ip,
    endpoint: '/tripay-callback',
    details: {
      reference: data.reference,
      merchant_ref: data.merchant_ref,
      mismatch_type: data.mismatch_type,
      expected: data.expected,
      received: data.received,
    },
  });
}

/**
 * Log rate limit violation
 */
export async function logRateLimitViolation(
  supabase: SupabaseClient,
  data: {
    endpoint: string;
    source_ip: string;
    user_id?: string;
    limit: number;
    window: number;
  }
): Promise<void> {
  await logSecurityEvent(supabase, {
    event_type: SecurityEventType.RATE_LIMIT_EXCEEDED,
    severity: SecuritySeverity.MEDIUM,
    source_ip: data.source_ip,
    user_id: data.user_id,
    endpoint: data.endpoint,
    details: {
      limit: data.limit,
      window: data.window,
    },
  });
}

/**
 * Log unauthorized access attempt
 */
export async function logUnauthorizedAccess(
  supabase: SupabaseClient,
  data: {
    endpoint: string;
    source_ip: string;
    user_id?: string;
    reason: string;
  }
): Promise<void> {
  await logSecurityEvent(supabase, {
    event_type: SecurityEventType.UNAUTHORIZED_ACCESS,
    severity: SecuritySeverity.HIGH,
    source_ip: data.source_ip,
    user_id: data.user_id,
    endpoint: data.endpoint,
    details: {
      reason: data.reason,
    },
  });
}

/**
 * Alert admin for critical security events
 * TODO: Implement email/SMS notification
 */
async function alertAdmin(
  supabase: SupabaseClient,
  event: SecurityEvent
): Promise<void> {
  console.error('🚨 CRITICAL SECURITY EVENT:', {
    type: event.event_type,
    ip: event.source_ip,
    details: event.details,
  });

  // TODO: Send email/SMS to admin
  // For now, just log to console
}

/**
 * Check for repeated failed attempts from same IP
 */
export async function checkRepeatedFailures(
  supabase: SupabaseClient,
  source_ip: string,
  event_type: SecurityEventType,
  threshold: number = 3,
  timeWindow: number = 300 // 5 minutes
): Promise<boolean> {
  const since = new Date(Date.now() - timeWindow * 1000).toISOString();

  const { data, error } = await supabase
    .from('security_events')
    .select('id')
    .eq('event_type', event_type)
    .eq('source_ip', source_ip)
    .gte('created_at', since);

  if (error) {
    console.error('❌ Error checking repeated failures:', error);
    return false;
  }

  return (data?.length || 0) >= threshold;
}
