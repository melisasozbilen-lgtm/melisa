import { Film, Heart, Users, Star, Globe, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export default function About() {
  const features = [
    {
      icon: Users,
      title: 'Celebrity Profiles',
      description: 'Explore detailed profiles of your favorite actors, directors, and artists with comprehensive biographies.',
    },
    {
      icon: Film,
      title: 'Film Database',
      description: 'Browse our extensive collection of films with ratings, synopses, and complete cast information.',
    },
    {
      icon: Heart,
      title: 'Personal Favorites',
      description: 'Create your own collection of favorite celebrities and films for quick access.',
    },
    {
      icon: Star,
      title: 'Ratings & Reviews',
      description: 'Share your thoughts and read what others have to say about celebrities and films.',
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Discover talent from around the world with our international celebrity database.',
    },
    {
      icon: Sparkles,
      title: 'Personalized Experience',
      description: 'Customize your profile and get recommendations based on your preferences.',
    },
  ];

  const stats = [
    { value: '10+', label: 'Celebrities' },
    { value: '10+', label: 'Films' },
    { value: '∞', label: 'Possibilities' },
    { value: '24/7', label: 'Access' },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Film className="h-12 w-12 text-gold" />
            <h1 className="font-serif text-5xl md:text-6xl font-bold">
              About <span className="text-gold-gradient">CelebyFilm</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            CelebyFilm is your ultimate destination for exploring the world of cinema. 
            We bring together celebrity profiles, filmographies, and a passionate community 
            of movie enthusiasts.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="font-serif text-4xl md:text-5xl font-bold text-gold-gradient">{stat.value}</p>
                <p className="text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              Our <span className="text-gold-gradient">Mission</span>
            </h2>
            <p className="text-lg text-foreground/80 leading-relaxed mb-8">
              We believe that cinema is one of the most powerful forms of storytelling. 
              Our mission is to celebrate the talented individuals who bring these stories 
              to life and connect fans with the films and celebrities they love.
            </p>
            <blockquote className="glass-card rounded-xl p-8 italic text-xl text-foreground/90">
              "Every great film should seem new every time you see it."
              <footer className="mt-4 text-gold font-semibold not-italic">— Roger Ebert</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12">
            What We <span className="text-gold-gradient">Offer</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-6 card-hover animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <feature.icon className="h-10 w-10 text-gold mb-4" />
                <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              Ready to <span className="text-gold-gradient">Explore?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of cinema lovers who use CelebyFilm to discover 
              new favorites and connect with the world of entertainment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
        </div>
      </section>
    </Layout>
  );
}
