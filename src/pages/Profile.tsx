import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Mail, Camera, Loader2, Save, Heart, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_genre: string | null;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ favorites: 0, comments: 0 });

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    favorite_genre: '',
    avatar_url: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          bio: data.bio || '',
          favorite_genre: data.favorite_genre || '',
          avatar_url: data.avatar_url || '',
        });
      }

      // Fetch stats
      const [favsResult, commentsResult] = await Promise.all([
        supabase.from('favorites').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('comments').select('id', { count: 'exact' }).eq('user_id', user.id),
      ]);

      setStats({
        favorites: favsResult.count || 0,
        comments: commentsResult.count || 0,
      });

      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username || null,
          full_name: formData.full_name || null,
          bio: formData.bio || null,
          favorite_genre: formData.favorite_genre || null,
          avatar_url: formData.avatar_url || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
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
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-gold/30">
                <AvatarImage src={formData.avatar_url || undefined} />
                <AvatarFallback className="bg-gold/20 text-3xl">
                  <User className="h-12 w-12 text-gold" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 p-2 bg-gold rounded-full">
                <Camera className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">
                {formData.full_name || formData.username || 'Your Profile'}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-gold" />
                  <span className="font-semibold">{stats.favorites}</span>
                  <span className="text-muted-foreground">Favorites</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-gold" />
                  <span className="font-semibold">{stats.comments}</span>
                  <span className="text-muted-foreground">Comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="glass-card rounded-xl p-8">
              <h2 className="font-serif text-2xl font-bold mb-6">Edit Profile</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="@username"
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="John Doe"
                      className="bg-secondary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favorite_genre">Favorite Genre</Label>
                  <Input
                    id="favorite_genre"
                    value={formData.favorite_genre}
                    onChange={(e) => setFormData({ ...formData, favorite_genre: e.target.value })}
                    placeholder="Drama, Sci-Fi, Comedy..."
                    className="bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself and your love for cinema..."
                    className="bg-secondary/50 min-h-[120px]"
                  />
                </div>

                <Button type="submit" variant="gold" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
