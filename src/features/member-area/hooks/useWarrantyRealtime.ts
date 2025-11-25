import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/clients/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { WarrantyClaimDB } from '../services/warranty.service';

export interface WarrantyRealtimeCallbacks {
  onStatusChange?: (claim: WarrantyClaimDB, oldStatus: string, newStatus: string) => void;
  onNewClaim?: (claim: WarrantyClaimDB) => void;
}

/**
 * Custom hook for real-time warranty claims updates
 * Subscribes to warranty_claims table changes and updates React Query cache
 */
export const useWarrantyRealtime = (userId?: string, callbacks?: WarrantyRealtimeCallbacks) => {
  const queryClient = useQueryClient();

  const handleInsert = useCallback((payload: RealtimePostgresChangesPayload<WarrantyClaimDB>) => {
    console.log('🔔 [Realtime] New warranty claim:', payload.new);
    
    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ['warranty', 'claims'] });
    queryClient.invalidateQueries({ queryKey: ['warranty', 'stats'] });
    queryClient.invalidateQueries({ queryKey: ['warranty', 'eligible-accounts'] });
  }, [queryClient]);

  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<WarrantyClaimDB>) => {
    console.log('🔔 [Realtime] Warranty claim updated:', payload.new);
    
    // Check if status changed
    const oldClaim = payload.old as Partial<WarrantyClaimDB>;
    const newClaim = payload.new as WarrantyClaimDB;
    const oldStatus = oldClaim?.status;
    const newStatus = newClaim?.status;
    
    if (oldStatus && newStatus && oldStatus !== newStatus && callbacks?.onStatusChange) {
      callbacks.onStatusChange(newClaim, oldStatus, newStatus);
    }
    
    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ['warranty', 'claims'] });
    queryClient.invalidateQueries({ queryKey: ['warranty', 'stats'] });
    
    // Optionally update specific claim in cache
    if (newClaim?.id) {
      queryClient.invalidateQueries({ queryKey: ['warranty', 'claims', newClaim.id] });
    }
  }, [queryClient, callbacks]);

  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<WarrantyClaimDB>) => {
    console.log('🔔 [Realtime] Warranty claim deleted:', payload.old);
    
    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ['warranty', 'claims'] });
    queryClient.invalidateQueries({ queryKey: ['warranty', 'stats'] });
  }, [queryClient]);

  useEffect(() => {
    // Don't subscribe if no user
    if (!userId) {
      console.log('⏸️ [Realtime] No user ID, skipping subscription');
      return;
    }

    console.log('🔌 [Realtime] Subscribing to warranty_claims changes for user:', userId);

    // Create realtime channel
    const channel: RealtimeChannel = supabase
      .channel('warranty_claims_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'warranty_claims',
          filter: `user_id=eq.${userId}`
        },
        handleInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'warranty_claims',
          filter: `user_id=eq.${userId}`
        },
        handleUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'warranty_claims',
          filter: `user_id=eq.${userId}`
        },
        handleDelete
      )
      .subscribe((status) => {
        console.log('🔌 [Realtime] Subscription status:', status);
      });

    // Cleanup on unmount
    return () => {
      console.log('🔌 [Realtime] Unsubscribing from warranty_claims changes');
      supabase.removeChannel(channel);
    };
  }, [userId, handleInsert, handleUpdate, handleDelete]);

  return {
    // Can add connection status here if needed
  };
};

/**
 * Hook for admin to subscribe to all warranty claims (no user filter)
 */
export const useWarrantyRealtimeAdmin = () => {
  const queryClient = useQueryClient();

  const handleInsert = useCallback((payload: RealtimePostgresChangesPayload<WarrantyClaimDB>) => {
    console.log('🔔 [Realtime Admin] New warranty claim:', payload.new);
    
    // Invalidate admin queries
    queryClient.invalidateQueries({ queryKey: ['admin', 'warranty-claims'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
  }, [queryClient]);

  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<WarrantyClaimDB>) => {
    console.log('🔔 [Realtime Admin] Warranty claim updated:', payload.new);
    
    // Invalidate admin queries
    queryClient.invalidateQueries({ queryKey: ['admin', 'warranty-claims'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
  }, [queryClient]);

  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<WarrantyClaimDB>) => {
    console.log('🔔 [Realtime Admin] Warranty claim deleted:', payload.old);
    
    // Invalidate admin queries
    queryClient.invalidateQueries({ queryKey: ['admin', 'warranty-claims'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
  }, [queryClient]);

  useEffect(() => {
    console.log('🔌 [Realtime Admin] Subscribing to all warranty_claims changes');

    // Create realtime channel for admin (no user filter)
    const channel: RealtimeChannel = supabase
      .channel('warranty_claims_admin')
      .on(
        'postgres_changes',
        {
          event: '*', // All events
          schema: 'public',
          table: 'warranty_claims'
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') handleInsert(payload as RealtimePostgresChangesPayload<WarrantyClaimDB>);
          else if (payload.eventType === 'UPDATE') handleUpdate(payload as RealtimePostgresChangesPayload<WarrantyClaimDB>);
          else if (payload.eventType === 'DELETE') handleDelete(payload as RealtimePostgresChangesPayload<WarrantyClaimDB>);
        }
      )
      .subscribe((status) => {
        console.log('🔌 [Realtime Admin] Subscription status:', status);
      });

    // Cleanup on unmount
    return () => {
      console.log('🔌 [Realtime Admin] Unsubscribing from warranty_claims changes');
      supabase.removeChannel(channel);
    };
  }, [handleInsert, handleUpdate, handleDelete]);

  return {
    // Can add connection status here if needed
  };
};
