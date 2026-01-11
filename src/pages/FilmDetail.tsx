import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Heart, Users, ArrowLeft, Star, Clapperboard } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CelebrityCard } from '@/components/cards/CelebrityCard';
import { CommentSection } from '@/components/comments/CommentSection';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';

interface Film {
  id: string;
  title: string;
  poster_url: string | null;
  synopsis: string | null;
  release_year: number | null;
  genre: string | null;
  director: string | null;
  rating: number | null;
  duration_minutes: number | null;
}

interface CastMember {
  id: string;
  name: string;
  image_url: string | null;
  known_for: string | null;
  nationality: string | null;
  role_name: string | null;
  is_lead: boolean;
}

export default function FilmDetail() {
  const { id } = useParams<{ id: string }>();
  const [film, setFilm] = useState<Film | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isLoading: favLoading } = useFavorites();

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data: filmData, error: filmError } = await supabase
        .from('films')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (filmError) {
        console.error('Error fetching film:', filmError);
        setLoading(false);
        return;
      }

      setFilm(filmData);

      // Fetch cast
      const { data: castData } = await supabase
        .from('film_cast')
        .select(`
          role_name,
          is_lead,
          celebrities (
            id,
            name,
            image_url,
            known_for,
            nationality
          )
        `)
        .eq('film_id', id);

      if (castData) {
        const castList = castData
          .filter(item => item.celebrities)
          .map(item => ({
            ...(item.celebrities as any),
            role_name: item.role_name,
            is_lead: item.is_lead,
          }))
          .sort((a, b) => (b.is_lead ? 1 : 0) - (a.is_lead ? 1 : 0));
        setCast(castList);
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
              <div className="w-full md:w-1/3 aspect-[2/3] bg-muted rounded-xl" />
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

  if (!film) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Film Not Found</h1>
          <p className="text-muted-foreground mb-6">The film you're looking for doesn't exist.</p>
          <Link to="/films">
            <Button variant="gold">Browse Films</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isFav = id ? isFavorite(id, 'film') : false;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <Link to="/films" className="inline-flex items-center text-muted-foreground hover:text-gold transition-colors mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Films
          </Link>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Poster */}
            <div className="w-full lg:w-1/3">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden glass-card">
                <img
                  src={film.poster_url || 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=600'}
                  alt={film.title}
                  className="w-full h-full object-cover"
                />
                {film.rating && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-sm rounded-lg">
                    <Star className="h-5 w-5 fill-gold text-gold" />
                    <span className="text-xl font-bold">{film.rating}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">{film.title}</h1>
                  {film.genre && (
                    <span className="inline-block px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium">
                      {film.genre}
                    </span>
                  )}
                </div>
                {user && id && (
                  <Button
                    variant={isFav ? 'gold' : 'gold-outline'}
                    onClick={() => toggleFavorite(id, 'film')}
                    disabled={favLoading}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isFav ? 'fill-current' : ''}`} />
                    {isFav ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
                {film.release_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gold" />
                    <span>{film.release_year}</span>
                  </div>
                )}
                {film.duration_minutes && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gold" />
                    <span>{film.duration_minutes} minutes</span>
                  </div>
                )}
                {film.director && (
                  <div className="flex items-center gap-2">
                    <Clapperboard className="h-5 w-5 text-gold" />
                    <span>Directed by {film.director}</span>
                  </div>
                )}
              </div>

              {film.synopsis && (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-serif text-xl font-semibold mb-3">Synopsis</h3>
                  <p className="text-foreground/80 leading-relaxed">{film.synopsis}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cast */}
      {cast.length > 0 && (
        <section className="py-12 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Users className="h-6 w-6 text-gold" />
              <h2 className="font-serif text-2xl font-bold">Cast</h2>
              <span className="text-muted-foreground">({cast.length} actors)</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {cast.map((member, i) => (
                <div key={member.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="relative">
                    <CelebrityCard
                      id={member.id}
                      name={member.name}
                      imageUrl={member.image_url}
                      knownFor={member.role_name || member.known_for}
                      nationality={member.nationality}
                    />
                    {member.is_lead && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-gold text-primary-foreground text-xs font-semibold rounded">
                        Lead
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
            {id && <CommentSection entityId={id} type="film" />}
          </div>
        </div>
      </section>
    </Layout>
  );
}
