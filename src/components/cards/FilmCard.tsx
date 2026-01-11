import { Link } from 'react-router-dom';
import { Heart, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

interface FilmCardProps {
  id: string;
  title: string;
  posterUrl: string | null;
  releaseYear: number | null;
  genre: string | null;
  rating: number | null;
  duration: number | null;
}

export function FilmCard({ id, title, posterUrl, releaseYear, genre, rating, duration }: FilmCardProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const isFav = isFavorite(id, 'film');

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavorite(id, 'film');
    }
  };

  return (
    <Link to={`/film/${id}`} className="group block">
      <div className="glass-card rounded-xl overflow-hidden card-hover">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl || 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=400'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-70" />
          
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-background/50 backdrop-blur-sm hover:bg-background/70"
              onClick={handleFavoriteClick}
              disabled={isLoading}
            >
              <Heart className={`h-5 w-5 ${isFav ? 'fill-gold text-gold' : 'text-foreground'}`} />
            </Button>
          )}

          {rating && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-background/70 backdrop-blur-sm rounded-full">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="text-sm font-semibold text-foreground">{rating}</span>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              {releaseYear && <span>{releaseYear}</span>}
              {releaseYear && genre && <span>•</span>}
              {genre && <span>{genre}</span>}
            </div>
            {duration && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{duration} min</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
