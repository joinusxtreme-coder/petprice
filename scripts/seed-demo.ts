import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const demoProducts = [
  // Dog food
  { rakuten_item_id: 'demo-dog-1', name: 'ロイヤルカナン ドッグフード 中型犬 アダルト 4kg', category: 'dog-food', pet_type: 'dog', age_group: 'all', current_price: 3280, review_count: 1523, review_average: 4.52, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'ペットの専門店コジマ' },
  { rakuten_item_id: 'demo-dog-2', name: 'ヒルズ サイエンスダイエット ドッグ 小粒 成犬用 3kg', category: 'dog-food', pet_type: 'dog', age_group: 'all', current_price: 2980, review_count: 986, review_average: 4.41, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'チャーム' },
  { rakuten_item_id: 'demo-dog-3', name: 'ニュートロ ナチュラルチョイス 成犬用 ラム&玄米 4kg', category: 'dog-food', pet_type: 'dog', age_group: 'all', current_price: 2750, review_count: 742, review_average: 4.38, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'ペッツビレッジ' },
  { rakuten_item_id: 'demo-dog-4', name: 'アカナ ドッグフード フリーランアダルト 2kg グレインフリー', category: 'dog-food', pet_type: 'dog', age_group: 'all', current_price: 4580, review_count: 618, review_average: 4.65, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: '楽天ペット' },
  { rakuten_item_id: 'demo-dog-5', name: 'パピー ドッグフード 子犬用 チキン味 1.5kg', category: 'dog-food', pet_type: 'dog', age_group: 'puppy', current_price: 1980, review_count: 455, review_average: 4.30, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'ペット館' },
  // Cat food
  { rakuten_item_id: 'demo-cat-1', name: 'ロイヤルカナン キャットフード 室内猫 成猫用 4kg', category: 'cat-food', pet_type: 'cat', age_group: 'all', current_price: 3580, review_count: 2150, review_average: 4.61, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'チャーム' },
  { rakuten_item_id: 'demo-cat-2', name: 'モグニャン キャットフード 魚 グレインフリー 1.5kg', category: 'cat-food', pet_type: 'cat', age_group: 'all', current_price: 3280, review_count: 1820, review_average: 4.55, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'ペットの専門店コジマ' },
  { rakuten_item_id: 'demo-cat-3', name: 'ピュリナ プロプラン キャット 去勢・避妊猫用 3kg', category: 'cat-food', pet_type: 'cat', age_group: 'all', current_price: 2780, review_count: 1240, review_average: 4.44, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: '楽天ペット' },
  { rakuten_item_id: 'demo-cat-4', name: 'ヒルズ サイエンスダイエット 猫 シニア 6歳以上 1.8kg', category: 'cat-food', pet_type: 'cat', age_group: 'senior', current_price: 2580, review_count: 890, review_average: 4.39, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'ペッツビレッジ' },
  { rakuten_item_id: 'demo-cat-5', name: 'ネコおやつ まぐろ&かつお 減塩 12g×20袋', category: 'cat-food', pet_type: 'cat', age_group: 'all', current_price: 880, review_count: 3200, review_average: 4.70, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'ペット館' },
  // Dog goods
  { rakuten_item_id: 'demo-dog-g1', name: 'デオシート ペットシーツ 薄型 レギュラー 200枚', category: 'dog-goods', pet_type: 'dog', age_group: 'all', current_price: 1280, review_count: 5420, review_average: 4.68, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'チャーム' },
  { rakuten_item_id: 'demo-dog-g2', name: '犬用おやつ ジャーキー チキン 300g 無添加', category: 'dog-goods', pet_type: 'dog', age_group: 'all', current_price: 1580, review_count: 2100, review_average: 4.52, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: '楽天ペット' },
  // Cat goods
  { rakuten_item_id: 'demo-cat-g1', name: '猫砂 ニャンとも清潔トイレ 脱臭・抗菌チップ 大粒 4L×4袋', category: 'cat-goods', pet_type: 'cat', age_group: 'all', current_price: 2980, review_count: 3800, review_average: 4.72, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'チャーム' },
  { rakuten_item_id: 'demo-cat-g2', name: 'シリカゲル猫砂 消臭力抜群 3.8L×4個', category: 'cat-goods', pet_type: 'cat', age_group: 'all', current_price: 2280, review_count: 1650, review_average: 4.48, image_url: null, item_url: 'https://www.rakuten.co.jp', affiliate_url: 'https://www.rakuten.co.jp', shop_name: 'ペット館' },
];

async function seed() {
  console.log('Seeding demo products...');

  for (const product of demoProducts) {
    const { data, error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'rakuten_item_id' })
      .select('id')
      .single();

    if (error) {
      console.error(`Error: ${product.name}`, error.message);
      continue;
    }

    if (data) {
      // 30日分の価格履歴を生成
      const basePrice = product.current_price;
      const historyRecords = Array.from({ length: 30 }, (_, i) => {
        const daysAgo = 30 - i;
        const variation = (Math.random() - 0.5) * 0.15; // ±7.5%
        const price = Math.round(basePrice * (1 + variation));
        const recorded_at = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        return { product_id: data.id, price, shop_name: product.shop_name, recorded_at };
      });

      await supabase.from('price_history').insert(historyRecords);
    }

    console.log(`✅ ${product.name}`);
  }

  console.log('\nDone! Demo data seeded successfully.');
}

seed().catch(console.error);
