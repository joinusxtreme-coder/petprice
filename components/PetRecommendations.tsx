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
  weight_kg: number | null;
  breed: string | null;
}

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  current_price: number;
  review_count: number;
  review_average: number;
}

interface Recommendation {
  products: Product[];
  reason: string;
  icon: string;
}

// 種類 → カテゴリのマッピング
const SPECIES_CATEGORIES: Record<string, string[]> = {
  '犬': ['dog-food', 'dog-snack', 'dog-care', 'dog-goods'],
  '猫': ['cat-food', 'cat-snack', 'cat-care', 'cat-goods'],
  '鳥': ['bird-food', 'bird-goods'],
  '小動物': ['small-animal-food', 'small-animal-goods'],
  '魚・水生': ['fish-food', 'fish-tank'],
  '爬虫類': ['reptile-food', 'reptile-goods'],
};

const FOOD_CATEGORIES: Record<string, string[]> = {
  '犬': ['dog-food', 'dog-snack'],
  '猫': ['cat-food', 'cat-snack'],
  '鳥': ['bird-food'],
  '小動物': ['small-animal-food'],
  '魚・水生': ['fish-food'],
  '爬虫類': ['reptile-food'],
};

function calcAgeMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

function ageLabel(months: number): string {
  if (months < 12) return `${months}ヶ月`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y}歳${m}ヶ月` : `${y}歳`;
}

// ルールベースでキーワードを決める
function buildRecommendationRule(pet: Pet): { keyword: string | null; categories: string[]; reason: string; icon: string } {
  const species = pet.species;
  const foodCats = FOOD_CATEGORIES[species] || FOOD_CATEGORIES['犬'];
  const allCats = SPECIES_CATEGORIES[species] || SPECIES_CATEGORIES['犬'];
  const ageMonths = pet.birth_date ? calcAgeMonths(pet.birth_date) : null;

  // 年齢ルール
  if (ageMonths !== null) {
    if (ageMonths < 12) {
      return {
        keyword: 'パピー',
        categories: foodCats,
        reason: `${pet.name}はまだ${ageLabel(ageMonths)}。成長期に必要な栄養が豊富なパピー用フードです`,
        icon: '🌱',
      };
    }
    if (species === '犬' && ageMonths >= 84) {
      return {
        keyword: 'シニア',
        categories: foodCats,
        reason: `${pet.name}は${ageLabel(ageMonths)}のシニア犬。関節・消化に配慮したシニア用フードです`,
        icon: '🏅',
      };
    }
    if (species === '猫' && ageMonths >= 120) {
      return {
        keyword: 'シニア',
        categories: foodCats,
        reason: `${pet.name}は${ageLabel(ageMonths)}のシニア猫。高齢猫の健康維持をサポートするフードです`,
        icon: '🏅',
      };
    }
    // 成犬・成猫
    if (ageMonths >= 12 && ageMonths < 36) {
      return {
        keyword: null,
        categories: foodCats,
        reason: `元気いっぱいの${pet.name}（${ageLabel(ageMonths)}）に人気のフードをピックアップ`,
        icon: '⚡',
      };
    }
  }

  // 体重チェック（犬・猫のみ）
  if (pet.weight_kg && (species === '犬' || species === '猫')) {
    const heavyDog = species === '犬' && pet.weight_kg > 25;
    const overweightCat = species === '猫' && pet.weight_kg > 6;
    if (heavyDog || overweightCat) {
      return {
        keyword: 'ダイエット',
        categories: foodCats,
        reason: `${pet.name}の体型管理に。カロリーコントロールされたダイエットフードです`,
        icon: '⚖️',
      };
    }
  }

  // デフォルト：高評価フード
  return {
    keyword: null,
    categories: allCats,
    reason: `${pet.name}（${species}）に人気の商品をレビュー順でお届けします`,
    icon: '🌟',
  };
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function fetchRecommendedProducts(categories: string[], keyword: string | null): Promise<Product[]> {
  // Direct fetch to avoid ilike timeout
  const qparts: string[] = [
    'select=id,name,image_url,current_price,review_count,review_average',
    `category=in.(${categories.join(',')})`,
    'order=review_count.desc',
    'limit=4',
  ];
  if (keyword) qparts.push(`name=ilike.*${encodeURIComponent(keyword)}*`);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?${qparts.join('&')}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  // キーワードで結果が少ない場合はフォールバック
  if (Array.isArray(data) && data.length < 2 && keyword) {
    return fetchRecommendedProducts(categories, null);
  }
  return Array.isArray(data) ? data : [];
}

export default function PetRecommendations() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePetIdx, setActivePetIdx] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabaseBrowser
      .from('pets')
      .select('id, name, species, birth_date, weight_kg, breed')
      .eq('user_id', user.id)
      .limit(5)
      .then(({ data }) => {
        if (!data || data.length === 0) { setLoading(false); return; }
        setPets(data as Pet[]);
        loadRec(data[0] as Pet);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadRec(pet: Pet) {
    setLoading(true);
    setRec(null);
    const rule = buildRecommendationRule(pet);
    const products = await fetchRecommendedProducts(rule.categories, rule.keyword);
    if (products.length > 0) {
      setRec({ products, reason: rule.reason, icon: rule.icon });
    }
    setLoading(false);
  }

  function switchPet(idx: number) {
    setActivePetIdx(idx);
    loadRec(pets[idx]);
  }

  if (!user || (!loading && pets.length === 0)) return null;
  if (!loading && !rec) return null;

  const pet = pets[activePetIdx];

  return (
    <section className="bg-white border border-[#ddd]">
      <div className="px-3 py-2 border-b border-[#ddd] bg-[#FFF5EE]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#FF6600]">
              {rec?.icon || '🐾'} {pet?.name}へのAIおすすめ
            </h2>
            {rec && <p className="text-xs text-[#666] mt-0.5">{rec.reason}</p>}
          </div>
          {pets.length > 1 && (
            <div className="flex gap-1">
              {pets.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => switchPet(i)}
                  className={`text-xs px-2 py-0.5 border transition-colors ${i === activePetIdx ? 'bg-[#FF6600] text-white border-[#FF6600]' : 'border-[#ddd] text-[#333] hover:border-[#FF6600]'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-xs text-[#999] text-center">おすすめを計算中...</div>
      ) : rec ? (
        <div className="grid grid-cols-4 divide-x divide-[#eee]">
          {rec.products.map((p) => (
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
              {p.review_count > 0 && (
                <p className="text-xs text-[#999]">⭐{Number(p.review_average).toFixed(1)}（{p.review_count.toLocaleString()}件）</p>
              )}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="px-3 py-1 border-t border-[#eee] flex items-center justify-between">
        <p className="text-xs text-[#999]">ペット情報・レビュー数・年齢をもとにしたレコメンド</p>
        <Link href="/mypage?tab=pets" className="text-xs text-[#0058B3] hover:underline">ペット設定 →</Link>
      </div>
    </section>
  );
}
