import { Link } from 'react-router-dom';
import { ArrowRight, Star, Film, Users, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CelebrityCard } from '@/components/cards/CelebrityCard';
import { FilmCard } from '@/components/cards/FilmCard';
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

export default function Index() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [celebResult, filmResult] = await Promise.all([
        supabase.from('celebrities').select('*').limit(6),
        supabase.from('films').select('*').order('rating', { ascending: false }).limit(6),
      ]);
      
      if (celebResult.data) setCelebrities(celebResult.data);
      if (filmResult.data) setFilms(filmResult.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920)',
          }}
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in">
            <span className="text-gold-gradient">Discover</span> the Stars
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Explore your favorite celebrities, dive into their filmographies, 
            and connect with fellow cinema enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/celebrities">
              <Button variant="hero" size="xl">
                <Users className="mr-2 h-5 w-5" />
                Browse Celebrities
              </Button>
            </Link>
            <Link to="/films">
              <Button variant="gold-outline" size="lg">
                <Film className="mr-2 h-5 w-5" />
                Explore Films
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-8 md:gap-16">
          {[
            { icon: Users, label: 'Celebrities', value: '10+' },
            { icon: Film, label: 'Films', value: '10+' },
            { icon: Heart, label: 'Favorites', value: '∞' },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center animate-fade-in" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
              <stat.icon className="h-6 w-6 text-gold mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Celebrities */}
      <section className="py-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">
                <span className="text-gold-gradient">Featured</span> Celebrities
              </h2>
              <p className="text-muted-foreground mt-2">Discover the stars shaping cinema today</p>
            </div>
            <Link to="/celebrities">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-muted shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {celebrities.map((celeb, i) => (
                <div key={celeb.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
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
        </div>
      </section>

      {/* Top Rated Films */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">
                <Star className="inline-block h-8 w-8 text-gold mr-2" />
                Top Rated Films
              </h2>
              <p className="text-muted-foreground mt-2">The highest rated movies in our collection</p>
            </div>
            <Link to="/films">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-muted shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {films.map((film, i) => (
                <div key={film.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto glass-card rounded-2xl p-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Join the <span className="text-gold-gradient">CelebyFilm</span> Community
            </h2>
            <p className="text-muted-foreground mb-8">
              Sign up to save your favorite celebrities and films, write reviews, 
              and connect with fellow movie enthusiasts.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
