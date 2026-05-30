CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rakuten_item_id text UNIQUE NOT NULL,
  name text NOT NULL,
  brand text,
  category text NOT NULL,
  pet_type text NOT NULL,
  age_group text DEFAULT 'all',
  image_url text,
  item_url text,
  affiliate_url text,
  current_price integer NOT NULL,
  shop_name text,
  review_count integer DEFAULT 0,
  review_average decimal(3,2) DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  price integer NOT NULL,
  shop_name text,
  recorded_at timestamp DEFAULT now()
);

CREATE TABLE price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  email text NOT NULL,
  target_price integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);
