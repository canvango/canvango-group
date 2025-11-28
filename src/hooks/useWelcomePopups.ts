import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/clients/supabase';
import { WelcomePopup, WelcomePopupFormData } from '@/types/welcome-popup';

// Fetch active popup for guest visitors
export const useActiveWelcomePopup = () => {
  return useQuery({
    queryKey: ['welcome-popup', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('welcome_popups')
        .select('*')
        .eq('is_active', true)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 on no data

      // Handle errors gracefully
      if (error) {
        // Log error but don't throw to prevent blocking UI
        console.warn('Welcome popup query error:', error.message);
        return null;
      }
      
      return data as WelcomePopup | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 406 errors
  });
};

// Fetch all popups for admin
export const useWelcomePopups = () => {
  return useQuery({
    queryKey: ['welcome-popups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('welcome_popups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WelcomePopup[];
    },
  });
};

// Create popup
export const useCreateWelcomePopup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: WelcomePopupFormData) => {
      const { data, error } = await supabase
        .from('welcome_popups')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      return data as WelcomePopup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcome-popups'] });
      queryClient.invalidateQueries({ queryKey: ['welcome-popup', 'active'] });
    },
  });
};

// Update popup
export const useUpdateWelcomePopup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<WelcomePopupFormData> }) => {
      const { data, error } = await supabase
        .from('welcome_popups')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as WelcomePopup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcome-popups'] });
      queryClient.invalidateQueries({ queryKey: ['welcome-popup', 'active'] });
    },
  });
};

// Toggle active status
export const useToggleWelcomePopupActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('welcome_popups')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as WelcomePopup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcome-popups'] });
      queryClient.invalidateQueries({ queryKey: ['welcome-popup', 'active'] });
    },
  });
};

// Delete popup
export const useDeleteWelcomePopup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('welcome_popups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcome-popups'] });
      queryClient.invalidateQueries({ queryKey: ['welcome-popup', 'active'] });
    },
  });
};

// Disable all popups (unpublish all)
export const useDisableAllWelcomePopups = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('welcome_popups')
        .update({ is_active: false })
        .eq('is_active', true);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcome-popups'] });
      queryClient.invalidateQueries({ queryKey: ['welcome-popup', 'active'] });
    },
  });
};
