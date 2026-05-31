'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Pet {
  id: string;
  name: string;
  species: string;
  birth_date: string | null;
}

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  current_price: number;
  review_count: number;
}

// 種類 → カテゴリ・タグのマッピング
const SPECIES_MAP: Record<string, { categories: string[]; label: string; icon: string }> = {
  '犬': { categories: ['dog-food', 'dog-snack'], label: 'ドッグフード', icon: '🐕' },
  '猫': { categories: ['cat-food', 'cat-snack'], label: 'キャットフード', icon: '🐈' },
  '鳥': { categories: ['bird-food', 'bird-goods'], label: '鳥用品', icon: '🦜' },
  '小動物': { categories: ['small-animal-food', 'small-animal-goods'], label: '小動物用品', icon: '🐹' },
  '魚・水生': { categories: ['fish-food', 'fish-tank'], label: 'アクアリウム用品', icon: '🐠' },
  '爬虫類': { categories: ['reptile-food', 'reptile-goods'], label: '爬虫類用品', icon: '🦎' },
};

function calcAgeMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

export default function PetRecommendations() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabaseBrowser
      .from('pets')
      .select('id, name, species, birth_date')
      .eq('user_id', user.id)
      .limit(5)
      .then(({ data }) => {
        setPets(data || []);
        if (!data || data.length === 0) { setLoading(false); return; }

        // 最初のペットの種類でカテゴリを決める
        const primaryPet = data[0];
        const mapping = SPECIES_MAP[primaryPet.species] || SPECIES_MAP['犬'];
        const ageMonths = primaryPet.birth_date ? calcAgeMonths(primaryPet.birth_date) : null;

        // 年齢に応じた検索キーワード
        let keyword = '';
        if (ageMonths !== null) {
          if (ageMonths < 12) keyword = 'パピー';
          else if (ageMonths > 84) keyword = 'シニア'; // 7歳以上
        }

        let q = supabaseBrowser
          .from('products')
          .select('id, name, image_url, current_price, review_count')
          .in('category', mapping.categories)
          .order('review_count', { ascending: false });

        if (keyword) q = q.ilike('name', `%${keyword}%`);
        q = q.limit(4);

        q.then(({ data: products }) => {
          setProducts(products || []);
          setLoading(false);
        });
      });
  }, [user]);

  if (!user || loading || pets.length === 0) return null;

  const primaryPet = pets[0];
  const ageMonths = primaryPet.birth_date ? calcAgeMonths(primaryPet.birth_date) : null;
  const ageLabel = ageMonths !== null
    ? ageMonths < 12 ? `${ageMonths}ヶ月` : `${Math.floor(ageMonths / 12)}歳`
    : '';

  if (products.length === 0) return null;

  return (
    <section className="bg-white border border-[#ddd]">
      <div className="px-3 py-2 border-b border-[#ddd] bg-[#FFF5EE]">
        <h2 className="text-sm font-bold text-[#FF6600]">
          🐾 {primaryPet.name}ちゃん{ageLabel ? `（${ageLabel}）` : ''}へのおすすめ
        </h2>
        <p className="text-xs text-[#999] mt-0.5">登録ペット情報をもとにしたレコメンド</p>
      </div>
      <div className="grid grid-cols-4 divide-x divide-[#eee] p-2">
        {products.map((p) => (
          <Link key={p.id} href={`/product/${p.id}`} className="p-2 hover:bg-[#FFFBF7] flex flex-col items-center text-center">
            <div className="w-20 h-20 relative mb-1">
              {p.image_url ? (
                <Image src={p.image_url} alt={p.name} fill className="object-contain" sizes="80px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
              )}
            </div>
            <p className="text-xs text-[#0058B3] line-clamp-2 leading-snug mb-1">{p.name}</p>
            <p className="text-sm font-bold text-[#FF6600]">¥{p.current_price.toLocaleString()}</p>
          </Link>
        ))}
      </div>
      {pets.length > 1 && (
        <div className="px-3 py-1 border-t border-[#eee] text-xs text-[#999]">
          他のペット: {pets.slice(1).map(p => p.name).join('、')}
          <Link href="/mypage" className="ml-2 text-[#0058B3] hover:underline">ペット設定 →</Link>
        </div>
      )}
    </section>
  );
}
