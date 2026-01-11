import { useEffect, useState } from 'react';
import { Search, Users, Filter } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CelebrityCard } from '@/components/cards/CelebrityCard';
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

interface Celebrity {
  id: string;
  name: string;
  image_url: string | null;
  known_for: string | null;
  nationality: string | null;
}

export default function Celebrities() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [filteredCelebrities, setFilteredCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('all');
  const [nationalities, setNationalities] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCelebrities() {
      const { data, error } = await supabase
        .from('celebrities')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching celebrities:', error);
      } else if (data) {
        setCelebrities(data);
        setFilteredCelebrities(data);
        
        const uniqueNationalities = [...new Set(data.map(c => c.nationality).filter(Boolean))] as string[];
        setNationalities(uniqueNationalities);
      }
      setLoading(false);
    }
    fetchCelebrities();
  }, []);

  useEffect(() => {
    let filtered = celebrities;

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.known_for?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (nationalityFilter !== 'all') {
      filtered = filtered.filter(c => c.nationality === nationalityFilter);
    }

    setFilteredCelebrities(filtered);
  }, [searchQuery, nationalityFilter, celebrities]);

  return (
    <Layout>
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-10 w-10 text-gold" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              <span className="text-gold-gradient">Browse</span> Celebrities
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Explore our collection of talented actors, directors, and artists from around the world.
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
                placeholder="Search celebrities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border focus:border-gold"
              />
            </div>
            <div className="flex gap-4">
              <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                <SelectTrigger className="w-[180px] bg-secondary/50">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nationalities</SelectItem>
                  {nationalities.map(nat => (
                    <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchQuery || nationalityFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setNationalityFilter('all');
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
                <div key={i} className="aspect-[3/4] rounded-xl bg-muted shimmer" />
              ))}
            </div>
          ) : filteredCelebrities.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-semibold mb-2">No celebrities found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-6">
                Showing {filteredCelebrities.length} {filteredCelebrities.length === 1 ? 'celebrity' : 'celebrities'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredCelebrities.map((celeb, i) => (
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
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
