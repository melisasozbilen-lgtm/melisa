import { useEffect, useState } from 'react';
import { Search, Film as FilmIcon, Filter, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { FilmCard } from '@/components/cards/FilmCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Film {
  id: string;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  genre: string | null;
  rating: number | null;
  duration_minutes: number | null;
}

export default function Films() {
  const [films, setFilms] = useState<Film[]>([]);
  const [filteredFilms, setFilteredFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    async function fetchFilms() {
      const { data, error } = await supabase
        .from('films')
        .select('*');

      if (error) {
        console.error('Error fetching films:', error);
      } else if (data) {
        setFilms(data);
        setFilteredFilms(data);
        
        const uniqueGenres = [...new Set(data.map(f => f.genre).filter(Boolean))] as string[];
        setGenres(uniqueGenres);
      }
      setLoading(false);
    }
    fetchFilms();
  }, []);

  useEffect(() => {
    let filtered = films;

    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (genreFilter !== 'all') {
      filtered = filtered.filter(f => f.genre === genreFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        case 'year':
          return (b.release_year || 0) - (a.release_year || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredFilms(filtered);
  }, [searchQuery, genreFilter, sortBy, films]);

  return (
    <Layout>
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <FilmIcon className="h-10 w-10 text-gold" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              <span className="text-gold-gradient">Browse</span> Films
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover our curated collection of acclaimed films from various genres and eras.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search films..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border focus:border-gold"
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-[160px] bg-secondary/50">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] bg-secondary/50">
                  <Star className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="year">Most Recent</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || genreFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setGenreFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-muted shimmer" />
              ))}
            </div>
          ) : filteredFilms.length === 0 ? (
            <div className="text-center py-20">
              <FilmIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-semibold mb-2">No films found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">
                Showing {filteredFilms.length} {filteredFilms.length === 1 ? 'film' : 'films'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredFilms.map((film, i) => (
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
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
