import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export function useComments(entityId: string, type: 'celebrity' | 'film') {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const column = type === 'celebrity' ? 'celebrity_id' : 'film_id';
      
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('id, user_id, content, created_at')
        .eq(column, entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const enrichedComments = commentsData?.map(comment => ({
        ...comment,
        username: profilesMap.get(comment.user_id)?.username,
        full_name: profilesMap.get(comment.user_id)?.full_name,
        avatar_url: profilesMap.get(comment.user_id)?.avatar_url,
      })) || [];

      setComments(enrichedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, type]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    try {
      const newComment = {
        user_id: user.id,
        content,
        celebrity_id: type === 'celebrity' ? entityId : null,
        film_id: type === 'film' ? entityId : null,
      };

      const { error } = await supabase
        .from('comments')
        .insert(newComment);

      if (error) throw error;
      
      toast.success('Comment added');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return { comments, isLoading, addComment, deleteComment, refetch: fetchComments };
}
