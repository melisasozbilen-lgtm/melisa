import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Users, Film, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CelebrityCard } from '@/components/cards/CelebrityCard';
import { FilmCard } from '@/components/cards/FilmCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface Celebrity {
  id: string;
  name: string;
  image_url: string | null;
  known_for: string | null;
  nationality: string | null;
}

interface FilmResult {
  id: string;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  genre: string | null;
  rating: number | null;
  duration_minutes: number | null;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [films, setFilms] = useState<FilmResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setCelebrities([]);
      setFilms([]);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setSearchParams({ q: searchQuery });

    try {
      const [celebResult, filmResult] = await Promise.all([
        supabase
          .from('celebrities')
          .select('*')
          .or(`name.ilike.%${searchQuery}%,known_for.ilike.%${searchQuery}%,nationality.ilike.%${searchQuery}%`)
          .limit(20),
        supabase
          .from('films')
          .select('*')
          .or(`title.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%,director.ilike.%${searchQuery}%`)
          .limit(20),
      ]);

      if (celebResult.data) setCelebrities(celebResult.data);
      if (filmResult.data) setFilms(filmResult.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const totalResults = celebrities.length + films.length;

  return (
    <Layout>
      {/* Search Header */}
      <section className="py-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              <SearchIcon className="inline-block h-10 w-10 text-gold mr-3" />
              <span className="text-gold-gradient">Search</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Find your favorite celebrities and films
            </p>

            <form onSubmit={handleSearch}>
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search celebrities, films, genres..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-secondary/50 border-border focus:border-gold rounded-xl"
                  autoFocus
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto" />
              <p className="text-muted-foreground mt-4">Searching...</p>
            </div>
          ) : hasSearched ? (
            totalResults === 0 ? (
              <div className="text-center py-20">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">Try different keywords or browse our collections</p>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-6">
                  Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{query}"
                </p>

                <Tabs defaultValue={celebrities.length > 0 ? 'celebrities' : 'films'} className="w-full">
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
                    {celebrities.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">No celebrities found</p>
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
                    {films.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">No films found</p>
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
              </>
            )
          ) : (
            <div className="text-center py-20">
              <SearchIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-muted-foreground">Enter a search term to begin</h3>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
