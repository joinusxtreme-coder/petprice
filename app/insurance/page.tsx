'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { InlineFoodAd, MogwanBanner320x50 } from '@/components/A8Ads';

// ──────────────────────────────────────────
// 保険プランデータ（2025年調査時点）
// ──────────────────────────────────────────
interface Plan {
  company: string;
  planName: string;
  coverage: number; // 補償割合 %
  annualLimit: number | null; // 年間上限 (null = 無制限)
  monthlyBase: { dog: number; cat: number }; // 1歳時ベース保険料
  ageMultiplier: number[]; // インデックス = 年齢 (0〜15)
  deductible: boolean;
  features: string[];
  url: string;
  color: string;
}

const PLANS: Plan[] = [
  {
    company: 'アニコム損保',
    planName: 'どうぶつ健保ふぁみりぃ（70%プラン）',
    coverage: 70,
    annualLimit: null,
    monthlyBase: { dog: 2500, cat: 1800 },
    ageMultiplier: [1.0, 1.0, 1.05, 1.1, 1.15, 1.2, 1.3, 1.45, 1.6, 1.75, 1.9, 2.1, 2.3, 2.55, 2.8, 3.0],
    deductible: false,
    features: ['窓口精算対応（保険証だけで支払い）', '通院・入院・手術すべて補償', 'ペット健診割引あり', '日本最大手・加入実績No.1'],
    url: 'https://www.anicom-sompo.co.jp/',
    color: '#0072BC',
  },
  {
    company: 'ペット&ファミリー損保',
    planName: 'げんきナンバーワン（70%プラン）',
    coverage: 70,
    annualLimit: 500000,
    monthlyBase: { dog: 2200, cat: 1600 },
    ageMultiplier: [1.0, 1.0, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4, 1.55, 1.7, 1.85, 2.0, 2.2, 2.4, 2.6, 2.8],
    deductible: false,
    features: ['年間50万円まで補償', '7歳以降も継続可能', 'オンライン獣医師相談付き', 'シニアペットも加入しやすい'],
    url: 'https://www.petandfamily.co.jp/',
    color: '#E8380D',
  },
  {
    company: 'SBIいきいき少短',
    planName: 'いぬとねこの保険（プレミアム・70%）',
    coverage: 70,
    annualLimit: null,
    monthlyBase: { dog: 2100, cat: 1500 },
    ageMultiplier: [1.0, 1.0, 1.02, 1.08, 1.12, 1.18, 1.28, 1.42, 1.55, 1.65, 1.78, 1.95, 2.1, 2.3, 2.5, 2.7],
    deductible: false,
    features: ['年間無制限の補償', '先進医療特約あり', '歯科治療も一部補償', 'Web申込で最短即日'],
    url: 'https://www.sbi-ikiiki.co.jp/',
    color: '#005BAC',
  },
  {
    company: 'アクサ ダイレクト',
    planName: 'ペット保険（70%プラン）',
    coverage: 70,
    annualLimit: 300000,
    monthlyBase: { dog: 1900, cat: 1400 },
    ageMultiplier: [1.0, 1.0, 1.03, 1.08, 1.13, 1.19, 1.29, 1.43, 1.57, 1.72, 1.88, 2.05, 2.25, 2.48, 2.72, 3.0],
    deductible: false,
    features: ['年間30万円まで補償', '割安な保険料が特長', '24時間電話健康相談', 'ダイレクト型で余分なコスト削減'],
    url: 'https://www.axa-direct.co.jp/pet/',
    color: '#00008F',
  },
  {
    company: 'au損保',
    planName: 'ペットの保険（70%プラン）',
    coverage: 70,
    annualLimit: null,
    monthlyBase: { dog: 2300, cat: 1700 },
    ageMultiplier: [1.0, 1.0, 1.04, 1.09, 1.14, 1.2, 1.32, 1.46, 1.6, 1.75, 1.92, 2.1, 2.32, 2.55, 2.8, 3.05],
    deductible: false,
    features: ['年間無制限', 'auユーザー割引あり', '通院・入院・手術補償', 'スマホで簡単申込'],
    url: 'https://pet.au-sonpo.co.jp/',
    color: '#EA5504',
  },
];

function calcMonthlyPremium(plan: Plan, species: 'dog' | 'cat', age: number): number {
  const base = plan.monthlyBase[species];
  const multiplier = plan.ageMultiplier[Math.min(age, 15)] ?? plan.ageMultiplier[15];
  return Math.round(base * multiplier / 100) * 100;
}

export default function InsurancePage() {
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [age, setAge] = useState(3);
  const [coverageFilter, setCoverageFilter] = useState<number | 'all'>('all');
  const [sortKey, setSortKey] = useState<'price' | 'limit'>('price');

  const results = useMemo(() => {
    let list = PLANS.filter(p => coverageFilter === 'all' || p.coverage === coverageFilter);
    list = list.map(p => ({ ...p, monthly: calcMonthlyPremium(p, species, age) }));
    if (sortKey === 'price') {
      list.sort((a, b) => (a as any).monthly - (b as any).monthly);
    } else {
      list.sort((a, b) => {
        const al = a.annualLimit ?? 99999999;
        const bl = b.annualLimit ?? 99999999;
        return bl - al;
      });
    }
    return list as (Plan & { monthly: number })[];
  }, [species, age, coverageFilter, sortKey]);

  const cheapest = results[0];

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />

      {/* パンくず */}
      <div className="max-w-5xl mx-auto px-3 py-2 text-xs text-[#666]">
        <Link href="/" className="hover:underline text-[#0058B3]">トップ</Link>
        <span className="mx-1">›</span>
        <span>ペット保険比較シミュレーター</span>
      </div>

      <div className="max-w-5xl mx-auto px-3 pb-10">
        {/* ヘッダー */}
        <div className="bg-white border border-[#ddd] mb-4">
          <div className="bg-[#FF6600] text-white px-4 py-3">
            <h1 className="font-bold text-base">🐾 ペット保険 一括比較シミュレーター</h1>
            <p className="text-xs text-orange-100 mt-0.5">主要5社の保険料を年齢・種類別に比較。最安値プランをすぐ確認。</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-[#666] leading-relaxed">
              ペット保険は加入タイミングが早いほど保険料が安く、補償も手厚くなります。
              シミュレーターでペットの種類と年齢を選ぶと、各社の月額保険料が一覧で表示されます。
              ※保険料は目安です。実際の保険料は各社公式サイトをご確認ください。
            </p>
          </div>
        </div>

        {/* シミュレーター入力 */}
        <div className="bg-white border border-[#ddd] mb-4 p-4">
          <h2 className="font-bold text-sm text-[#333] mb-4">📋 条件を選ぶ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 種類 */}
            <div>
              <label className="block text-xs font-bold text-[#555] mb-2">ペットの種類</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSpecies('dog')}
                  className={`flex-1 py-2 text-sm font-bold border transition-colors ${species === 'dog' ? 'bg-[#FF6600] text-white border-[#FF6600]' : 'bg-white text-[#333] border-[#ccc] hover:border-[#FF6600]'}`}
                >
                  🐕 犬
                </button>
                <button
                  onClick={() => setSpecies('cat')}
                  className={`flex-1 py-2 text-sm font-bold border transition-colors ${species === 'cat' ? 'bg-[#FF6600] text-white border-[#FF6600]' : 'bg-white text-[#333] border-[#ccc] hover:border-[#FF6600]'}`}
                >
                  🐈 猫
                </button>
              </div>
            </div>

            {/* 年齢 */}
            <div>
              <label className="block text-xs font-bold text-[#555] mb-2">
                ペットの年齢：<span className="text-[#FF6600]">{age}歳</span>
              </label>
              <input
                type="range"
                min={0}
                max={15}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-[#FF6600]"
              />
              <div className="flex justify-between text-xs text-[#999] mt-1">
                <span>0歳</span><span>5歳</span><span>10歳</span><span>15歳</span>
              </div>
            </div>

            {/* ソート */}
            <div>
              <label className="block text-xs font-bold text-[#555] mb-2">並び替え</label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as 'price' | 'limit')}
                className="w-full border border-[#ccc] px-2 py-2 text-sm"
              >
                <option value="price">月額保険料が安い順</option>
                <option value="limit">年間補償上限が高い順</option>
              </select>
            </div>
          </div>

          {/* 年齢別注意 */}
          {age >= 8 && (
            <div className="mt-3 bg-yellow-50 border border-yellow-300 text-yellow-800 text-xs px-3 py-2">
              ⚠️ {age}歳以上は加入できないプランや条件が付く場合があります。各社で要確認。
            </div>
          )}
          {age === 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-300 text-blue-800 text-xs px-3 py-2">
              💡 生後2ヶ月〜加入可能なプランが多いです。早めの加入で保険料が割安になります。
            </div>
          )}
        </div>

        {/* 最安値ハイライト */}
        {cheapest && (
          <div className="bg-green-50 border border-green-400 mb-4 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5">最安値</span>
              <span className="font-bold text-sm text-[#333]">{cheapest.company}「{cheapest.planName}」</span>
            </div>
            <p className="text-xs text-[#555]">
              {species === 'dog' ? '🐕 犬' : '🐈 猫'} {age}歳の場合：月額
              <span className="text-xl font-bold text-green-600 mx-1">¥{cheapest.monthly.toLocaleString()}</span>
              （年間 ¥{(cheapest.monthly * 12).toLocaleString()}〜）
            </p>
          </div>
        )}

        {/* 比較カード一覧 */}
        <div className="space-y-3">
          {results.map((plan, idx) => (
            <div key={plan.company} className={`bg-white border-2 ${idx === 0 ? 'border-green-400' : 'border-[#ddd]'}`}>
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#eee]" style={{ borderLeftColor: plan.color, borderLeftWidth: 4 }}>
                {idx === 0 && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 shrink-0">最安値</span>}
                {idx === 1 && <span className="bg-gray-400 text-white text-xs font-bold px-2 py-0.5 shrink-0">2位</span>}
                {idx === 2 && <span className="bg-orange-400 text-white text-xs font-bold px-2 py-0.5 shrink-0">3位</span>}
                <span className="font-bold text-sm text-[#333]">{plan.company}</span>
                <span className="text-xs text-[#666] truncate">{plan.planName}</span>
              </div>
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* 保険料 */}
                  <div className="shrink-0 text-center sm:text-left border border-[#eee] px-4 py-3 sm:min-w-[160px]">
                    <div className="text-xs text-[#999] mb-1">月額保険料（目安）</div>
                    <div className="text-2xl font-bold text-[#FF6600]">¥{plan.monthly.toLocaleString()}</div>
                    <div className="text-xs text-[#666]">年間 ¥{(plan.monthly * 12).toLocaleString()}</div>
                  </div>

                  {/* スペック */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-[#F7F7F7] px-2 py-1.5">
                      <div className="text-[#999] mb-0.5">補償割合</div>
                      <div className="font-bold text-[#333]">{plan.coverage}%</div>
                    </div>
                    <div className="bg-[#F7F7F7] px-2 py-1.5">
                      <div className="text-[#999] mb-0.5">年間補償上限</div>
                      <div className="font-bold text-[#333]">{plan.annualLimit ? `${(plan.annualLimit / 10000).toFixed(0)}万円` : '無制限'}</div>
                    </div>
                    <div className="bg-[#F7F7F7] px-2 py-1.5">
                      <div className="text-[#999] mb-0.5">免責金額</div>
                      <div className="font-bold text-[#333]">{plan.deductible ? 'あり' : 'なし'}</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="shrink-0 text-center">
                    <a
                      href={plan.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#FF6600] text-white text-sm font-bold px-5 py-2 hover:bg-[#e55a00] transition-colors"
                    >
                      公式で確認 →
                    </a>
                  </div>
                </div>

                {/* 特徴 */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {plan.features.map((f) => (
                    <span key={f} className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-0.5">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 選び方ガイド */}
        <div className="bg-white border border-[#ddd] mt-6 p-4">
          <h2 className="font-bold text-sm text-[#333] mb-3">💡 ペット保険の選び方ポイント</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#555] leading-relaxed">
            <div>
              <div className="font-bold text-[#333] mb-1">① 補償割合（50%〜70%）</div>
              <p>治療費の何割を保険会社が負担するかです。70%なら10万円の治療費に7万円が支給されます。保険料が高くなりますが補償は手厚くなります。</p>
            </div>
            <div>
              <div className="font-bold text-[#333] mb-1">② 年間補償上限</div>
              <p>年間でもらえる最大金額です。「無制限」は大きな手術でも安心ですが保険料も高め。上限30〜50万円のプランは保険料が割安です。</p>
            </div>
            <div>
              <div className="font-bold text-[#333] mb-1">③ 窓口精算の有無</div>
              <p>アニコムなどは動物病院の窓口で保険証を提示するだけで清算できます。立替払い不要なので非常に便利です。</p>
            </div>
            <div>
              <div className="font-bold text-[#333] mb-1">④ 加入年齢と継続性</div>
              <p>多くの保険は7〜8歳以上での新規加入が難しくなります。若いうちに加入するほど保険料が安く、将来も継続しやすくなります。</p>
            </div>
          </div>
        </div>

        {/* A8.net アフィリエイト広告 */}
        <InlineFoodAd />

        {/* 横型バナー */}
        <div className="mt-4 flex justify-center">
          <MogwanBanner320x50 />
        </div>

        <p className="text-xs text-[#999] mt-4 text-center">
          ※掲載の保険料は参考値です。実際の保険料は各社公式サイトでご確認ください。<br />
          ※ペットプライスは各社のアフィリエイトプログラムに参加しています。
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
