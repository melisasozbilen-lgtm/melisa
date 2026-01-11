import { Link } from 'react-router-dom';
import { Film, Heart, Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Film className="h-8 w-8 text-gold" />
              <span className="font-serif text-2xl font-bold text-gold-gradient">
                CelebyFilm
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Discover your favorite celebrities and their amazing filmography. 
              Built with passion for cinema lovers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/celebrities" className="text-muted-foreground hover:text-gold transition-colors">
                  Browse Celebrities
                </Link>
              </li>
              <li>
                <Link to="/films" className="text-muted-foreground hover:text-gold transition-colors">
                  Browse Films
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-muted-foreground hover:text-gold transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-foreground">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-gold transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-muted-foreground hover:text-gold transition-colors">
                  My Favorites
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-muted-foreground hover:text-gold transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-foreground">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-gold hover:text-primary-foreground transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-gold hover:text-primary-foreground transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary hover:bg-gold hover:text-primary-foreground transition-all">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 CelebyFilm. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-gold fill-gold" /> for cinema lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
