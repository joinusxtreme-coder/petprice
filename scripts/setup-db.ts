import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setup() {
  console.log('Creating tables...');

  // productsテーブル
  const { error: e1 } = await supabase.rpc('exec_ddl', {
    sql: `CREATE TABLE IF NOT EXISTS products (
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
    )`
  });

  // テーブルが存在するか確認
  const { data, error } = await supabase.from('products').select('id').limit(1);
  if (error && error.code === '42P01') {
    console.log('Table does not exist. Please run schema.sql manually in Supabase SQL Editor.');
  } else {
    console.log('✅ products table OK');
  }

  const { data: d2, error: e2 } = await supabase.from('price_history').select('id').limit(1);
  if (e2 && e2.code === '42P01') {
    console.log('❌ price_history table missing');
  } else {
    console.log('✅ price_history table OK');
  }

  const { data: d3, error: e3 } = await supabase.from('price_alerts').select('id').limit(1);
  if (e3 && e3.code === '42P01') {
    console.log('❌ price_alerts table missing');
  } else {
    console.log('✅ price_alerts table OK');
  }
}

setup().catch(console.error);
