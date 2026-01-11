import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, User, Film, Users, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Layout } from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface CommentWithDetails {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  celebrity_id: string | null;
  film_id: string | null;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  celebrity_name?: string;
  film_title?: string;
}

export default function Comments() {
  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComments() {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !commentsData || commentsData.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      // Fetch profiles
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap: Record<string, { username?: string; full_name?: string; avatar_url?: string }> = {};
      profilesData?.forEach(p => { profilesMap[p.user_id] = p; });

      // Fetch celebrities
      const celebIds = commentsData.filter(c => c.celebrity_id).map(c => c.celebrity_id!);
      const celebsMap: Record<string, string> = {};
      if (celebIds.length > 0) {
        const { data: celebsData } = await supabase.from('celebrities').select('id, name').in('id', celebIds);
        celebsData?.forEach(c => { celebsMap[c.id] = c.name; });
      }

      // Fetch films
      const filmIds = commentsData.filter(c => c.film_id).map(c => c.film_id!);
      const filmsMap: Record<string, string> = {};
      if (filmIds.length > 0) {
        const { data: filmsData } = await supabase.from('films').select('id, title').in('id', filmIds);
        filmsData?.forEach(f => { filmsMap[f.id] = f.title; });
      }

      const enrichedComments: CommentWithDetails[] = commentsData.map(comment => ({
        ...comment,
        username: profilesMap[comment.user_id]?.username,
        full_name: profilesMap[comment.user_id]?.full_name,
        avatar_url: profilesMap[comment.user_id]?.avatar_url,
        celebrity_name: comment.celebrity_id ? celebsMap[comment.celebrity_id] : undefined,
        film_title: comment.film_id ? filmsMap[comment.film_id] : undefined,
      }));

      setComments(enrichedComments);
      setLoading(false);
    }

    fetchComments();
  }, []);

  return (
    <Layout>
      <section className="py-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-10 w-10 text-gold" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              Recent <span className="text-gold-gradient">Comments</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">See what the community is saying.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-xl">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-semibold mb-2">No comments yet</h3>
                <p className="text-muted-foreground">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, i) => (
                  <div key={comment.id} className="glass-card rounded-xl p-5 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.avatar_url} />
                        <AvatarFallback className="bg-gold/20"><User className="h-5 w-5 text-gold" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.full_name || comment.username || 'Anonymous'}</span>
                          <span className="text-muted-foreground text-sm">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          {comment.celebrity_id ? (
                            <Link to={`/celebrity/${comment.celebrity_id}`} className="flex items-center gap-1 hover:text-gold"><Users className="h-4 w-4" />{comment.celebrity_name || 'Celebrity'}</Link>
                          ) : (
                            <Link to={`/film/${comment.film_id}`} className="flex items-center gap-1 hover:text-gold"><Film className="h-4 w-4" />{comment.film_title || 'Film'}</Link>
                          )}
                        </div>
                        <p className="text-foreground/90">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
