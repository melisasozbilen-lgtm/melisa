import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, Users, Film, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CelebrityCard } from '@/components/cards/CelebrityCard';
import { FilmCard } from '@/components/cards/FilmCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';

interface Celebrity {
  id: string;
  name: string;
  image_url: string | null;
  known_for: string | null;
  nationality: string | null;
}

interface Film {
  id: string;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  genre: string | null;
  rating: number | null;
  duration_minutes: number | null;
}

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const { favorites } = useFavorites();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavoriteDetails() {
      if (!user || favorites.length === 0) {
        setCelebrities([]);
        setFilms([]);
        setLoading(false);
        return;
      }

      const celebIds = favorites.filter(f => f.celebrity_id).map(f => f.celebrity_id!);
      const filmIds = favorites.filter(f => f.film_id).map(f => f.film_id!);

      const [celebResult, filmResult] = await Promise.all([
        celebIds.length > 0
          ? supabase.from('celebrities').select('*').in('id', celebIds)
          : Promise.resolve({ data: [] }),
        filmIds.length > 0
          ? supabase.from('films').select('*').in('id', filmIds)
          : Promise.resolve({ data: [] }),
      ]);

      if (celebResult.data) setCelebrities(celebResult.data);
      if (filmResult.data) setFilms(filmResult.data);
      setLoading(false);
    }

    fetchFavoriteDetails();
  }, [user, favorites]);

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-10 w-10 text-gold fill-gold" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              My <span className="text-gold-gradient">Favorites</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your personal collection of beloved celebrities and films.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="celebrities" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="celebrities" className="gap-2">
                <Users className="h-4 w-4" />
                Celebrities ({celebrities.length})
              </TabsTrigger>
              <TabsTrigger value="films" className="gap-2">
                <Film className="h-4 w-4" />
                Films ({films.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="celebrities">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="aspect-[3/4] rounded-xl bg-muted shimmer" />
                  ))}
                </div>
              ) : celebrities.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-xl">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-semibold mb-2">No favorite celebrities yet</h3>
                  <p className="text-muted-foreground mb-6">Start exploring and add celebrities to your favorites!</p>
                  <Link to="/celebrities">
                    <Button variant="gold">Browse Celebrities</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {celebrities.map((celeb, i) => (
                    <div key={celeb.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <CelebrityCard
                        id={celeb.id}
                        name={celeb.name}
                        imageUrl={celeb.image_url}
                        knownFor={celeb.known_for}
                        nationality={celeb.nationality}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="films">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="aspect-[2/3] rounded-xl bg-muted shimmer" />
                  ))}
                </div>
              ) : films.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-xl">
                  <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-semibold mb-2">No favorite films yet</h3>
                  <p className="text-muted-foreground mb-6">Start exploring and add films to your favorites!</p>
                  <Link to="/films">
                    <Button variant="gold">Browse Films</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {films.map((film, i) => (
                    <div key={film.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <FilmCard
                        id={film.id}
                        title={film.title}
                        posterUrl={film.poster_url}
                        releaseYear={film.release_year}
                        genre={film.genre}
                        rating={film.rating ? Number(film.rating) : null}
                        duration={film.duration_minutes}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
