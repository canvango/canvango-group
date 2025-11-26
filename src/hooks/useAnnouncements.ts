import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/clients/supabase';
import type { Announcement, CreateAnnouncementInput, UpdateAnnouncementInput } from '@/types/announcement';

// Fetch published announcements for members
export const usePublishedAnnouncements = (limit = 5) => {
  return useQuery({
    queryKey: ['announcements', 'published', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Announcement[];
    }
  });
};

// Fetch all announcements for admin
export const useAllAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    }
  });
};

// Fetch single announcement
export const useAnnouncement = (id: string) => {
  return useQuery({
    queryKey: ['announcements', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Announcement;
    },
    enabled: !!id
  });
};

// Create announcement
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAnnouncementInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...input,
          created_by: user?.id,
          published_at: input.is_published ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;
      return data as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }
  });
};

// Update announcement
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateAnnouncementInput }) => {
      const updateData: any = { ...input };
      
      // Set published_at when publishing
      if (input.is_published && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }
  });
};

// Delete announcement
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }
  });
};
