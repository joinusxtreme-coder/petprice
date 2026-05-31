-- #19 レビュー写真
ALTER TABLE user_reviews ADD COLUMN IF NOT EXISTS photo_url text;

-- #20 購入済みマーク
CREATE TABLE IF NOT EXISTS purchased_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  purchased_at date DEFAULT CURRENT_DATE,
  UNIQUE(user_id, product_id)
);
ALTER TABLE purchased_products ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='purchased_products' AND policyname='Users can manage own purchases') THEN
    CREATE POLICY "Users can manage own purchases" ON purchased_products USING (auth.uid() = user_id);
  END IF;
END $$;

-- #21 複数お気に入りリスト
CREATE TABLE IF NOT EXISTS favorite_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'お気に入り',
  emoji text DEFAULT '❤️',
  created_at timestamp DEFAULT now()
);
ALTER TABLE favorite_lists ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorite_lists' AND policyname='Users can manage own lists') THEN
    CREATE POLICY "Users can manage own lists" ON favorite_lists USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS list_id uuid REFERENCES favorite_lists(id) ON DELETE SET NULL;

-- #22 ペットプロフィール公開
ALTER TABLE pets ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS profile_message text;

-- Storage バケット（review-photos）
INSERT INTO storage.buckets (id, name, public) VALUES ('review-photos', 'review-photos', true)
  ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Anyone can read review photos') THEN
    CREATE POLICY "Anyone can read review photos" ON storage.objects FOR SELECT USING (bucket_id = 'review-photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND schemaname='storage' AND policyname='Auth users can upload review photos') THEN
    CREATE POLICY "Auth users can upload review photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-photos' AND auth.role() = 'authenticated');
  END IF;
END $$;
