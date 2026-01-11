import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Favorite {
  id: string;
  celebrity_id: string | null;
  film_id: string | null;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id, celebrity_id, film_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = (id: string, type: 'celebrity' | 'film') => {
    return favorites.some(fav => 
      type === 'celebrity' ? fav.celebrity_id === id : fav.film_id === id
    );
  };

  const toggleFavorite = async (id: string, type: 'celebrity' | 'film') => {
    if (!user) {
      toast.error('Please sign in to add favorites');
      return;
    }

    setIsLoading(true);
    
    try {
      const existingFav = favorites.find(fav =>
        type === 'celebrity' ? fav.celebrity_id === id : fav.film_id === id
      );

      if (existingFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFav.id);

        if (error) throw error;
        
        setFavorites(prev => prev.filter(f => f.id !== existingFav.id));
        toast.success('Removed from favorites');
      } else {
        const newFav = {
          user_id: user.id,
          celebrity_id: type === 'celebrity' ? id : null,
          film_id: type === 'film' ? id : null,
        };

        const { data, error } = await supabase
          .from('favorites')
          .insert(newFav)
          .select()
          .single();

        if (error) throw error;
        
        setFavorites(prev => [...prev, data]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  return { favorites, isFavorite, toggleFavorite, isLoading, refetch: fetchFavorites };
}
