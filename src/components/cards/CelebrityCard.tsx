import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

interface CelebrityCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  knownFor: string | null;
  nationality: string | null;
}

export function CelebrityCard({ id, name, imageUrl, knownFor, nationality }: CelebrityCardProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const isFav = isFavorite(id, 'celebrity');

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavorite(id, 'celebrity');
    }
  };

  return (
    <Link to={`/celebrity/${id}`} className="group block">
      <div className="glass-card rounded-xl overflow-hidden card-hover">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
          
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
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
              {name}
            </h3>
            {knownFor && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
                {knownFor}
              </p>
            )}
            {nationality && (
              <span className="inline-block mt-2 px-2 py-1 bg-gold/20 text-gold text-xs rounded-full">
                {nationality}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
