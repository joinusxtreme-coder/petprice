CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS user_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS review_helpful (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES user_reviews(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, review_id)
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  target_price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age_years INTEGER,
  weight_kg NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "own profile update" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public reviews" ON user_reviews FOR SELECT USING (true);
CREATE POLICY "own reviews" ON user_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own helpful" ON review_helpful FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own alerts" ON price_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own pets" ON pets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public forum posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "own forum posts" ON forum_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "own replies" ON forum_replies FOR ALL USING (auth.uid() = user_id);
