import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Heart, Film, ArrowLeft, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { FilmCard } from '@/components/cards/FilmCard';
import { CommentSection } from '@/components/comments/CommentSection';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Celebrity {
  id: string;
  name: string;
  image_url: string | null;
  bio: string | null;
  birth_date: string | null;
  birth_place: string | null;
  known_for: string | null;
  nationality: string | null;
}

interface FilmWithRole {
  id: string;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  genre: string | null;
  rating: number | null;
  duration_minutes: number | null;
  role_name: string | null;
  is_lead: boolean;
}

export default function CelebrityDetail() {
  const { id } = useParams<{ id: string }>();
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [films, setFilms] = useState<FilmWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isLoading: favLoading } = useFavorites();

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data: celebData, error: celebError } = await supabase
        .from('celebrities')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (celebError) {
        console.error('Error fetching celebrity:', celebError);
        setLoading(false);
        return;
      }

      setCelebrity(celebData);

      // Fetch filmography
      const { data: castData } = await supabase
        .from('film_cast')
        .select(`
          role_name,
          is_lead,
          films (
            id,
            title,
            poster_url,
            release_year,
            genre,
            rating,
            duration_minutes
          )
        `)
        .eq('celebrity_id', id);

      if (castData) {
        const filmsList = castData
          .filter(item => item.films)
          .map(item => ({
            ...(item.films as any),
            role_name: item.role_name,
            is_lead: item.is_lead,
          }))
          .sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
        setFilms(filmsList);
      }

      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 aspect-[3/4] bg-muted rounded-xl" />
              <div className="flex-1 space-y-4">
                <div className="h-10 w-2/3 bg-muted rounded" />
                <div className="h-6 w-1/3 bg-muted rounded" />
                <div className="h-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!celebrity) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Celebrity Not Found</h1>
          <p className="text-muted-foreground mb-6">The celebrity you're looking for doesn't exist.</p>
          <Link to="/celebrities">
            <Button variant="gold">Browse Celebrities</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isFav = id ? isFavorite(id, 'celebrity') : false;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <Link to="/celebrities" className="inline-flex items-center text-muted-foreground hover:text-gold transition-colors mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Celebrities
          </Link>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Image */}
            <div className="w-full lg:w-1/3">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden glass-card">
                <img
                  src={celebrity.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                  alt={celebrity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">{celebrity.name}</h1>
                  {celebrity.nationality && (
                    <span className="inline-block px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium">
                      {celebrity.nationality}
                    </span>
                  )}
                </div>
                {user && id && (
                  <Button
                    variant={isFav ? 'gold' : 'gold-outline'}
                    onClick={() => toggleFavorite(id, 'celebrity')}
                    disabled={favLoading}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isFav ? 'fill-current' : ''}`} />
                    {isFav ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
                {celebrity.birth_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gold" />
                    <span>Born {format(new Date(celebrity.birth_date), 'MMMM d, yyyy')}</span>
                  </div>
                )}
                {celebrity.birth_place && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gold" />
                    <span>{celebrity.birth_place}</span>
                  </div>
                )}
              </div>

              {celebrity.known_for && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Known For</h3>
                  <p className="text-lg text-foreground">{celebrity.known_for}</p>
                </div>
              )}

              {celebrity.bio && (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-serif text-xl font-semibold mb-3">Biography</h3>
                  <p className="text-foreground/80 leading-relaxed">{celebrity.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filmography */}
      {films.length > 0 && (
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Film className="h-6 w-6 text-gold" />
              <h2 className="font-serif text-2xl font-bold">Filmography</h2>
              <span className="text-muted-foreground">({films.length} films)</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {films.map((film, i) => (
                <div key={film.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="relative">
                    <FilmCard
                      id={film.id}
                      title={film.title}
                      posterUrl={film.poster_url}
                      releaseYear={film.release_year}
                      genre={film.genre}
                      rating={film.rating ? Number(film.rating) : null}
                      duration={film.duration_minutes}
                    />
                    {film.role_name && (
                      <div className="mt-2 text-center">
                        <span className="text-sm text-muted-foreground">as </span>
                        <span className="text-sm font-medium text-foreground">{film.role_name}</span>
                        {film.is_lead && (
                          <Star className="inline-block h-3 w-3 text-gold ml-1" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comments */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {id && <CommentSection entityId={id} type="celebrity" />}
          </div>
        </div>
      </section>
    </Layout>
  );
}
