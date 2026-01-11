-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  favorite_genre TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create celebrities table
CREATE TABLE public.celebrities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE,
  birth_place TEXT,
  bio TEXT,
  image_url TEXT,
  known_for TEXT,
  nationality TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create films table
CREATE TABLE public.films (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  release_year INTEGER,
  genre TEXT,
  director TEXT,
  synopsis TEXT,
  poster_url TEXT,
  rating DECIMAL(3,1),
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create film_cast junction table for celebrities in films
CREATE TABLE public.film_cast (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  film_id UUID REFERENCES public.films(id) ON DELETE CASCADE NOT NULL,
  celebrity_id UUID REFERENCES public.celebrities(id) ON DELETE CASCADE NOT NULL,
  role_name TEXT,
  is_lead BOOLEAN DEFAULT false,
  UNIQUE(film_id, celebrity_id)
);

-- Create favorites table for user favorites
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  celebrity_id UUID REFERENCES public.celebrities(id) ON DELETE CASCADE,
  film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fav_type_check CHECK (
    (celebrity_id IS NOT NULL AND film_id IS NULL) OR
    (celebrity_id IS NULL AND film_id IS NOT NULL)
  )
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  celebrity_id UUID REFERENCES public.celebrities(id) ON DELETE CASCADE,
  film_id UUID REFERENCES public.films(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT comment_type_check CHECK (
    (celebrity_id IS NOT NULL AND film_id IS NULL) OR
    (celebrity_id IS NULL AND film_id IS NOT NULL)
  )
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebrities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_cast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Celebrities policies (public read)
CREATE POLICY "Celebrities are viewable by everyone" ON public.celebrities FOR SELECT USING (true);

-- Films policies (public read)
CREATE POLICY "Films are viewable by everyone" ON public.films FOR SELECT USING (true);

-- Film cast policies (public read)
CREATE POLICY "Film cast is viewable by everyone" ON public.film_cast FOR SELECT USING (true);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username', NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample celebrities
INSERT INTO public.celebrities (name, birth_date, birth_place, bio, image_url, known_for, nationality) VALUES
('Margot Robbie', '1990-07-02', 'Dalby, Queensland, Australia', 'Academy Award-nominated actress known for her versatile roles in both blockbusters and independent films.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'Barbie, The Wolf of Wall Street', 'Australian'),
('Timothée Chalamet', '1995-12-27', 'New York City, USA', 'Rising star known for his intense performances in coming-of-age and period dramas.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'Dune, Call Me By Your Name', 'American'),
('Zendaya', '1996-09-01', 'Oakland, California, USA', 'Multi-talented actress and singer who has successfully transitioned from Disney to critically acclaimed roles.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', 'Euphoria, Dune', 'American'),
('Ryan Gosling', '1980-11-12', 'London, Ontario, Canada', 'Acclaimed actor known for his diverse filmography spanning romantic dramas to action blockbusters.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'La La Land, Drive', 'Canadian'),
('Florence Pugh', '1996-01-03', 'Oxford, England', 'BAFTA-winning actress known for her powerful performances in both drama and action films.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'Little Women, Midsommar', 'British'),
('Austin Butler', '1991-08-17', 'Anaheim, California, USA', 'Golden Globe-winning actor who captivated audiences with his transformative role as Elvis Presley.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Elvis, Dune: Part Two', 'American'),
('Ana de Armas', '1988-04-30', 'Havana, Cuba', 'Cuban-Spanish actress who rose to international fame through both Spanish-language and Hollywood productions.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', 'Knives Out, Blonde', 'Cuban'),
('Pedro Pascal', '1975-04-02', 'Santiago, Chile', 'Chilean-American actor beloved for his charismatic roles in prestige television and blockbuster films.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'The Mandalorian, The Last of Us', 'Chilean-American'),
('Sydney Sweeney', '1997-09-12', 'Spokane, Washington, USA', 'Emmy-nominated actress making waves in both television and film with her compelling dramatic performances.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Euphoria, The White Lotus', 'American'),
('Glen Powell', '1988-10-21', 'Austin, Texas, USA', 'Charming leading man known for his action roles and romantic comedies.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'Top Gun: Maverick, Anyone But You', 'American');

-- Insert sample films
INSERT INTO public.films (title, release_year, genre, director, synopsis, poster_url, rating, duration_minutes) VALUES
('Dune: Part Two', 2024, 'Sci-Fi', 'Denis Villeneuve', 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400', 8.8, 166),
('Barbie', 2023, 'Comedy', 'Greta Gerwig', 'Barbie and Ken leave Barbieland and discover the joys and perils of living among humans.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 7.0, 114),
('Oppenheimer', 2023, 'Biography', 'Christopher Nolan', 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=400', 8.5, 180),
('La La Land', 2016, 'Musical', 'Damien Chazelle', 'A jazz musician and an aspiring actress fall in love while pursuing their dreams in Los Angeles.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', 8.0, 128),
('Little Women', 2019, 'Drama', 'Greta Gerwig', 'The March sisters come of age in Civil War-era America.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', 7.8, 135),
('Elvis', 2022, 'Biography', 'Baz Luhrmann', 'The life and music of Elvis Presley from his childhood to becoming a rock and movie star.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', 7.4, 159),
('Knives Out', 2019, 'Mystery', 'Rian Johnson', 'A detective investigates the death of a wealthy patriarch after his birthday party.', 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400', 7.9, 130),
('The Last of Us', 2023, 'Drama', 'Craig Mazin', 'Joel and Ellie must survive a brutal journey across what remains of the United States.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', 8.8, 60),
('Anyone But You', 2023, 'Romance', 'Will Gluck', 'Two people who hate each other pretend to be a couple at a destination wedding.', 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400', 6.3, 103),
('Top Gun: Maverick', 2022, 'Action', 'Joseph Kosinski', 'After more than thirty years of service, Pete Mitchell is where he belongs, pushing the envelope as a test pilot.', 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400', 8.3, 130);

-- Insert film cast relationships
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Chani', true FROM public.films f, public.celebrities c WHERE f.title = 'Dune: Part Two' AND c.name = 'Zendaya';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Paul Atreides', true FROM public.films f, public.celebrities c WHERE f.title = 'Dune: Part Two' AND c.name = 'Timothée Chalamet';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Feyd-Rautha', true FROM public.films f, public.celebrities c WHERE f.title = 'Dune: Part Two' AND c.name = 'Austin Butler';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Barbie', true FROM public.films f, public.celebrities c WHERE f.title = 'Barbie' AND c.name = 'Margot Robbie';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Ken', true FROM public.films f, public.celebrities c WHERE f.title = 'Barbie' AND c.name = 'Ryan Gosling';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Sebastian', true FROM public.films f, public.celebrities c WHERE f.title = 'La La Land' AND c.name = 'Ryan Gosling';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Amy March', true FROM public.films f, public.celebrities c WHERE f.title = 'Little Women' AND c.name = 'Florence Pugh';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Elvis Presley', true FROM public.films f, public.celebrities c WHERE f.title = 'Elvis' AND c.name = 'Austin Butler';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Marta Cabrera', true FROM public.films f, public.celebrities c WHERE f.title = 'Knives Out' AND c.name = 'Ana de Armas';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Joel Miller', true FROM public.films f, public.celebrities c WHERE f.title = 'The Last of Us' AND c.name = 'Pedro Pascal';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Bea', true FROM public.films f, public.celebrities c WHERE f.title = 'Anyone But You' AND c.name = 'Sydney Sweeney';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Ben', true FROM public.films f, public.celebrities c WHERE f.title = 'Anyone But You' AND c.name = 'Glen Powell';
INSERT INTO public.film_cast (film_id, celebrity_id, role_name, is_lead) 
SELECT f.id, c.id, 'Lt. Jake Seresin', true FROM public.films f, public.celebrities c WHERE f.title = 'Top Gun: Maverick' AND c.name = 'Glen Powell';