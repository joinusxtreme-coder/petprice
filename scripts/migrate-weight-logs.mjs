import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check if table exists
const { error: checkError } = await supabase.from('pet_weight_logs').select('id').limit(1);

if (!checkError) {
  console.log('✅ pet_weight_logs table already exists!');
} else {
  console.log('❌ Table does not exist. Please run the following SQL in your Supabase SQL Editor:');
  console.log('');
  console.log(`CREATE TABLE IF NOT EXISTS pet_weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  weight_kg decimal(5,2) NOT NULL,
  recorded_at date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamp DEFAULT now()
);

ALTER TABLE pet_weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pet logs" ON pet_weight_logs
  USING (pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid()));`);
}
