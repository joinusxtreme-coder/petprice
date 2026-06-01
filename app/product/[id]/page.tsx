export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PriceChart from '@/components/PriceChart';
import AlertForm from '@/components/AlertForm';
import AffiliateButton from '@/components/AffiliateButton';
import ProductCard from '@/components/ProductCard';
import SiteHeader from '@/components/SiteHeader';
import FavoriteButton from '@/components/FavoriteButton';
import UserReviewSection from '@/components/UserReviewSection';
import CompareButton from '@/components/CompareButton';
import RecordHistory from '@/components/RecordHistory';
import RecentlyViewed from '@/components/RecentlyViewed';
import SubscriptionSimulator from '@/components/SubscriptionSimulator';
import PetRecommendations from '@/components/PetRecommendations';
import { CATEGORY_CONFIG, SIDEBAR_GROUPS } from '@/lib/categories';
import { extractItemCode, fetchItemDetail, parseItemCaption } from '@/lib/rakuten';
import SiteFooter from '@/components/SiteFooter';
import IngredientScoreBadge from '@/components/IngredientScoreBadge';
import MultiMallPrices from '@/components/MultiMallPrices';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data: product } = await supabase.from('products').select('name, current_price, image_url').eq('id', id).single();
  if (!product) return {};
  return {
    title: `${product.name}の最安値・価格比較 | ペットプライス`,
    description: `${product.name}の楽天市場最安値${product.current_price.toLocaleString()}円。30日間の価格推移グラフで買い時がわかる。`,
    openGraph: {
      title: `${product.name} | ペットプライス`,
      description: `最安値 ¥${product.current_price.toLocaleString()}（税込）`,
      images: product.image_url ? [{ url: product.image_url, width: 400, height: 400 }] : [],
    },
    twitter: {
      card: 'summary',
      title: `${product.name} | ペットプライス`,
      description: `最安値 ¥${product.current_price.toLocaleString()}`,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const [{ data: product }, { data: history }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase
      .from('price_history')
      .select('price, recorded_at')
      .eq('product_id', id)
      .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: true }),
  ]);

  if (!product) notFound();

  // 楽天APIから正確なスペック情報を取得（1時間キャッシュ）
  const itemCode = extractItemCode(product.item_url || product.affiliate_url || '');
  const rakutenDetail = itemCode ? await fetchItemDetail(itemCode) : null;
  const apiSpec = rakutenDetail ? parseItemCaption(rakutenDetail.itemCaption) : null;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const prevHistory = (history || []).filter((h: { recorded_at: string }) => new Date(h.recorded_at) < yesterday);
  const prevPrice = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].price : null;
  const priceDiff = prevPrice ? product.current_price - prevPrice : null;

  const { data: related } = await supabase
    .from('products')
    .select('id, name, image_url, current_price, review_count, review_average, shop_name')
    .eq('category', product.category)
    .neq('id', id)
    .order('review_count', { ascending: false })
    .limit(4);

  // カテゴリ内ランキング順位を計算（自分より review_count が多い商品数 + 1）
  const { count: rankCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category', product.category)
    .gt('review_count', product.review_count);
  const rankPosition = (rankCount ?? 0) + 1;

  const stars = Math.round(product.review_average || 0);
  const config = CATEGORY_CONFIG[product.category];

  // 価格の最安値・最高値
  const allPrices = (history || []).map((h: { price: number }) => h.price);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;

  // 商品名から信頼性の高い情報のみ抽出（不確かなものは返さない）
  function extractProductInfo(name: string, price: number, category: string) {
    // ジャンル（療法食・サプリは商品名に明記されるので信頼性高）
    let genre = config?.label || '';
    if (/療法食|処方食/.test(name)) genre = '療養・療法食';
    else if (/サプリ|サプリメント/.test(name)) genre = 'サプリメント';
    else if (/グレインフリー|穀物不使用/.test(name)) genre = 'グレインフリー';

    // タイプ（商品名に明記される）
    let type = '';
    if (category.includes('food') || category.includes('snack')) {
      if (/フリーズドライ/.test(name)) type = 'フリーズドライ';
      else if (/ドライ|乾燥|カリカリ/.test(name)) type = 'ドライタイプ';
      else if (/パウチ/.test(name)) type = 'パウチ';
      else if (/缶詰|缶/.test(name)) type = '缶詰';
      else if (/ウェット|ウエット/.test(name)) type = 'ウェットタイプ';
      else if (/ジャーキー/.test(name)) type = 'ジャーキー';
      else if (/ガム/.test(name)) type = 'ガム';
      else if (/ビスケット|クッキー/.test(name)) type = 'ビスケット';
      else if (/半生|セミモイスト/.test(name)) type = '半生タイプ';
    } else if (category === 'dog-clothes' || category === 'cat-goods') {
      if (/ニット|セーター/.test(name)) type = 'ニット';
      else if (/レインコート|カッパ/.test(name)) type = 'レインコート';
      else if (/Tシャツ/.test(name)) type = 'Tシャツ';
      else if (/パーカー|フーディー/.test(name)) type = 'パーカー';
      else if (/ウェア|洋服|服/.test(name)) type = 'ウェア';
    } else if (category === 'dog-carrier' || category === 'cat-carrier') {
      if (/リュック|バックパック/.test(name)) type = 'リュック型';
      else if (/スリング/.test(name)) type = 'スリング型';
      else if (/カート/.test(name)) type = 'ペットカート';
      else if (/キャリー|バッグ/.test(name)) type = 'キャリーバッグ';
    }

    // 内容量（商品名に kg/g が明示されるので高信頼）
    let weight = '';
    let weightKg = 0;
    const multiKgMatch = name.match(/(\d+(?:\.\d+)?)\s*(kg|g)\s*[×xX×]\s*(\d+)/i);
    if (multiKgMatch) {
      const val = parseFloat(multiKgMatch[1]);
      const unit = multiKgMatch[2].toLowerCase();
      const cnt = parseInt(multiKgMatch[3]);
      const singleKg = unit === 'kg' ? val : val / 1000;
      weightKg = singleKg * cnt;
      const totalLabel = weightKg >= 1 ? `${weightKg}kg` : `${weightKg * 1000}g`;
      weight = `${multiKgMatch[1]}${multiKgMatch[2]}×${cnt}袋（計${totalLabel}）`;
    } else {
      const wm = name.match(/(?:^|[\s（(【])(\d+(?:\.\d+)?)\s*(kg|g)(?![a-zA-Z])/i)
        || name.match(/(\d+(?:\.\d+)?)\s*(kg|g)(?![a-zA-Z])/i);
      if (wm) {
        weight = `${wm[1]}${wm[2]}`;
        weightKg = wm[2].toLowerCase() === 'kg' ? parseFloat(wm[1]) : parseFloat(wm[1]) / 1000;
      }
    }

    // 枚・個・本（ペットシーツなど - 商品名に明記）
    const countMatch = name.match(/(\d+(?:,\d+)?)\s*(枚|個|本|袋|食|粒|包|シート)(?:入|セット|まとめ|×\d+)?/);
    let count = '';
    if (countMatch) count = `${countMatch[1].replace(',', '')}${countMatch[2]}`;

    // 1kgあたり価格（内容量が確定している場合のみ）
    let pricePerKg = '';
    if (weightKg > 0 && (category.includes('food') || category.includes('snack'))) {
      pricePerKg = `${Math.round(price / weightKg).toLocaleString()} 円/kg`;
    }

    // 対象年齢（商品名に明記されている場合のみ - 複数マッチは表示しない）
    const isPuppy = /パピー|子犬|子猫|キトン|幼犬|幼猫|1歳未満/.test(name);
    const isSenior = /シニア|高齢|老犬|老猫|7歳以上|11歳以上|12歳以上|7才以上|11才以上/.test(name);
    const isAdult = /成犬|成猫|アダルト|1歳以上/.test(name);
    const ageMatchCount = [isPuppy, isSenior, isAdult].filter(Boolean).length;
    let ageGroup = '';
    if (ageMatchCount === 1) {
      if (isPuppy) ageGroup = 'パピー・子猫用';
      else if (isSenior) ageGroup = 'シニア用（7歳以上）';
      else ageGroup = '成犬・成猫用';
    }
    // ※ 複数の年齢グループにマッチする場合や、明記がない場合は表示しない

    // 対象サイズ（商品名に明記されている場合のみ）
    let size = '';
    if (category.startsWith('dog')) {
      if (/超小型犬|トイ(?:プードル|サイズ)/.test(name)) size = '超小型犬（〜4kg）';
      else if (/小型犬|ミニチュア/.test(name)) size = '小型犬（〜10kg）';
      else if (/中型犬/.test(name)) size = '中型犬（10〜25kg）';
      else if (/大型犬/.test(name)) size = '大型犬（25kg以上）';
      else if (/全犬種|全サイズ|すべてのサイズ/.test(name)) size = '全犬種対応';
      // ※ デフォルト値なし
    }

    // サイズ表記（服・キャリーなど）
    let itemSize = '';
    if (['dog-clothes', 'cat-goods', 'dog-carrier', 'cat-carrier'].includes(category)) {
      const sizeM = name.match(/\b(SS|XS|S|M|L|XL|XXL|2L|3L)\b/);
      if (sizeM) itemSize = sizeM[1];
    }

    // 特徴・用途（商品名に明記されている場合のみ - 高信頼）
    const features: { label: string }[] = [
      { label: '皮膚・被毛ケア' },
      { label: '消化器ケア用' },
      { label: '関節ケア用' },
      { label: '泌尿器ケア用' },
      { label: '体重管理用' },
      { label: '毛玉ケア用' },
      { label: 'アレルギー対応' },
      { label: '療法食' },
      { label: '免疫サポート' },
      { label: '心臓ケア用' },
      { label: '腎臓ケア用' },
      { label: '無添加' },
      { label: '国産' },
      { label: 'オーガニック' },
      { label: '送料無料' },
    ].filter((f) => {
      const checks: Record<string, RegExp> = {
        '皮膚・被毛ケア': /皮膚|スキン|被毛|毛並み/,
        '消化器ケア用': /消化器|消化サポート|胃腸|便秘|下痢|整腸/,
        '関節ケア用': /関節|グルコサミン|コンドロイチン/,
        '泌尿器ケア用': /尿路|泌尿器|ストルバイト|シュウ酸|FLUTD|膀胱/,
        '体重管理用': /ライト|低カロリー|ダイエット|体重管理|肥満|ウェイト|減量/,
        '毛玉ケア用': /毛玉|ヘアボール/,
        'アレルギー対応': /アレルギー|低アレルゲン|グレインフリー|穀物不使用/,
        '療法食': /療法食|処方食/,
        '免疫サポート': /免疫|抗酸化/,
        '心臓ケア用': /心臓|心疾患/,
        '腎臓ケア用': /腎臓|腎不全|腎サポート/,
        '無添加': /無添加/,
        '国産': /国産/,
        'オーガニック': /オーガニック|有機/,
        '送料無料': /送料無料/,
      };
      return checks[f.label]?.test(name) ?? false;
    });

    // メーカー（商品名に明記されているブランドのみ - 高信頼）
    let maker = '';
    const makerPatterns = [
      { pattern: /ヒルズ|Hill's|HILL'S/i, label: "ヒルズ（Hill's）" },
      { pattern: /ロイヤルカナン|Royal Canin/i, label: 'ロイヤルカナン' },
      { pattern: /ニュートロ|Nutro/i, label: 'ニュートロ（Nutro）' },
      { pattern: /アカナ|ACANA/i, label: 'アカナ（ACANA）' },
      { pattern: /オリジン|ORIJEN/i, label: 'オリジン（ORIJEN）' },
      { pattern: /モグニャン/i, label: 'モグニャン' },
      { pattern: /モグワン/i, label: 'モグワン' },
      { pattern: /ピュリナ|Purina/i, label: 'ピュリナ（Nestle）' },
      { pattern: /サイエンス・ダイエット/i, label: 'ヒルズ サイエンス・ダイエット' },
      { pattern: /INABA|いなば/i, label: 'いなばペットフード' },
      { pattern: /アイシア|Aixia/i, label: 'アイシア' },
      { pattern: /カルカン/i, label: 'カルカン（Mars）' },
      { pattern: /デビフ|d\.b\.f/i, label: 'デビフ' },
      { pattern: /グランデリ/i, label: 'グランデリ（ドギーマン）' },
    ];
    for (const m of makerPatterns) {
      if (m.pattern.test(name)) { maker = m.label; break; }
    }

    return { genre, type, weight, count, pricePerKg, ageGroup, size, itemSize, features, maker };
  }

  const specData = extractProductInfo(product.name, product.current_price, product.category);
  const isFoodCategory = ['dog-food','cat-food','dog-snack','cat-snack','bird-food','small-animal-food','fish-food','reptile-food'].includes(product.category);

  // APIから取得したスペック（優先）。内容量はAPIの方が詳細な場合に上書き
  const displayWeight = apiSpec?.weightFromCaption || specData.weight;
  const displayCalorie = apiSpec?.calorie || '';  // 商品名からは取らない（不正確なため）
  const displayIngredients = apiSpec?.ingredients || '';
  const displayGuaranteedAnalysis = apiSpec?.guaranteedAnalysis || '';
  const displayCatchcopy = rakutenDetail?.catchcopy || product.description || '';

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <RecordHistory
        id={product.id}
        name={product.name}
        image_url={product.image_url}
        current_price={product.current_price}
        category={product.category}
      />
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#eee]">
        <div className="max-w-5xl mx-auto px-3 py-1 text-xs text-[#666]">
          <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
          <span className="mx-1">{'>'}</span>
          <Link href="/" className="text-[#0058B3] hover:underline">ペット</Link>
          {config && (
            <>
              <span className="mx-1">{'>'}</span>
              <Link href={`/${product.category}`} className="text-[#0058B3] hover:underline">{config.label}</Link>
            </>
          )}
          <span className="mx-1">{'>'}</span>
          <span className="line-clamp-1">{product.name.slice(0, 30)}...</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-3 flex gap-3">
        {/* Left sidebar */}
        <aside className="w-44 shrink-0 hidden md:block">
          {SIDEBAR_GROUPS.map((section) => (
            <div key={section.label} className="border border-[#ddd] border-b-0 mb-0">
              <div className="bg-[#FF6600] text-white text-xs font-bold px-2 py-1.5">{section.label}</div>
              {section.subgroups.map((sub) => (
                <div key={sub.label}>
                  <div className="bg-[#f5f5f5] text-[#666] text-xs px-2 py-1 border-t border-[#eee] font-bold">{sub.label}</div>
                  {sub.keys.map((key) => {
                    const c = CATEGORY_CONFIG[key];
                    return (
                      <Link
                        key={key}
                        href={`/${key}`}
                        className={`block px-3 py-1.5 text-xs border-t border-[#eee] transition-colors ${
                          key === product.category
                            ? 'bg-[#FFF5EE] text-[#FF6600] font-bold'
                            : 'text-[#0058B3] hover:text-[#FF6600] hover:bg-[#FFF5EE]'
                        }`}
                      >
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
              <div className="border-t border-[#eee]" />
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-3">
          {/* Product Info */}
          <div className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h1 className="text-sm font-bold text-[#333] leading-snug">{product.name}</h1>
            </div>
            <div className="p-3 flex gap-4">
              {/* Image */}
              <div className="shrink-0 w-48 h-48 relative bg-white border border-[#eee] overflow-hidden">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="192px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-5xl text-[#ccc]">🐾</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* 店舗名 */}
                {product.shop_name && (
                  <p className="text-xs text-[#999]">販売: {product.shop_name}</p>
                )}

                {/* 価格 */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#FF6600]">
                      ¥{product.current_price.toLocaleString()}
                    </span>
                    <span className="text-sm text-[#999]">（税込）</span>
                  </div>
                  {priceDiff !== null && (
                    <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 mt-1 ${priceDiff < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {priceDiff < 0 ? '▼' : '▲'} {Math.abs(priceDiff).toLocaleString()}円 昨日より{priceDiff < 0 ? '値下がり！' : '値上がり'}
                    </div>
                  )}
                </div>

                {/* 楽天ポイント概算 */}
                <div className="text-xs text-[#E95000] bg-[#FFF5EE] border border-[#FFD0A0] px-2 py-1 inline-flex items-center gap-1">
                  <span>🎁 楽天ポイント概算:</span>
                  <span className="font-bold">{Math.floor(product.current_price / 100).toLocaleString()} pt〜</span>
                  <span className="text-[#999]">（通常1%、SPUで最大15%以上）</span>
                </div>

                {/* 最安値情報 */}
                {minPrice && minPrice < product.current_price && (
                  <div className="text-xs text-[#666] bg-[#f8f8f8] border border-[#eee] px-2 py-1">
                    過去30日最安値: <span className="font-bold text-[#CC0000]">¥{minPrice.toLocaleString()}</span>
                  </div>
                )}

                {/* 売れ筋ランキング */}
                {config && (
                  <div className="flex items-center gap-2 text-xs bg-[#FFF5EE] border border-[#FFD0B0] px-2 py-1">
                    <span className="text-[#FF6600] font-bold">売れ筋ランキング</span>
                    <span className="font-bold text-[#CC0000] text-sm">{rankPosition}位</span>
                    <span className="text-[#999]">({config.label}カテゴリ)</span>
                    <Link href={`/${product.category}`} className="text-[#0058B3] hover:underline ml-auto">ランキングを見る</Link>
                  </div>
                )}

                {/* 星評価 */}
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-base">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
                  <span className="text-sm text-[#FF6600] font-bold">{product.review_average}</span>
                  <span className="text-xs text-[#0058B3] hover:underline cursor-pointer">
                    （{(product.review_count || 0).toLocaleString()}件のレビュー）
                  </span>
                </div>

                {/* 購入ボタン */}
                <div className="space-y-2">
                  <AffiliateButton url={product.affiliate_url || product.item_url || '#'} className="w-full" />
                  <div className="flex gap-2">
                    <FavoriteButton productId={product.id} />
                    <CompareButton product={{ id: product.id, name: product.name, current_price: product.current_price }} />
                  </div>
                </div>

                {/* カテゴリ一覧へ */}
                {config && (
                  <Link href={`/${product.category}`} className="text-xs text-[#0058B3] hover:underline">
                    ← {config.label}の一覧に戻る
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* レビュー・評価 */}
          <div className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">⭐ 楽天市場のレビュー</h2>
            </div>
            <div className="p-3">
              {product.review_count > 0 ? (
                <>
                  {/* 総合評価 */}
                  <div className="flex items-center gap-4 mb-4 pb-3 border-b border-[#eee]">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-[#FF6600]">{Number(product.review_average).toFixed(1)}</div>
                      <div className="text-yellow-500 text-xl mt-1">
                        {'★'.repeat(Math.round(product.review_average))}{'☆'.repeat(5 - Math.round(product.review_average))}
                      </div>
                      <div className="text-xs text-[#999] mt-0.5">{product.review_count.toLocaleString()}件</div>
                    </div>
                    <div className="flex-1">
                      {[5,4,3,2,1].map((star) => {
                        // 各星の割合をreview_averageから概算
                        const avg = product.review_average;
                        const pct = star === Math.round(avg) ? 45
                          : star === Math.ceil(avg) ? 25
                          : star === Math.floor(avg) ? 20
                          : star > avg ? Math.max(0, (star - avg) * 3)
                          : Math.max(0, (avg - star) * 3);
                        return (
                          <div key={star} className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-[#666] w-4">{star}</span>
                            <span className="text-yellow-400 text-xs">★</span>
                            <div className="flex-1 bg-[#eee] h-2 rounded">
                              <div className="bg-yellow-400 h-2 rounded" style={{ width: `${Math.min(100, pct * 2)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 全レビューを楽天で見る */}
                  <div className="text-center">
                    <a
                      href={`${product.item_url}#reviewlistWrapper`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#BF0000] text-white text-sm font-bold px-6 py-2 hover:bg-[#990000] transition-colors"
                    >
                      楽天市場で全{product.review_count.toLocaleString()}件のレビューを見る →
                    </a>
                    <p className="text-xs text-[#999] mt-2">※ レビューは楽天市場の商品ページに移動します</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#999] text-center py-4">まだレビューがありません</p>
              )}
            </div>
          </div>

          {/* ユーザーレビュー */}
          <UserReviewSection productId={product.id} />

          {/* スペック・仕様 */}
          <div className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">
                {product.name.slice(0, 40)}{product.name.length > 40 ? '...' : ''} のスペック・仕様
              </h2>
            </div>
            <div className="p-3">
              {/* キャッチコピー（楽天APIから取得） */}
              {displayCatchcopy && (
                <p className="text-xs text-[#555] bg-[#f8f8f8] border border-[#ddd] px-3 py-2 mb-3 leading-relaxed">
                  {displayCatchcopy}
                </p>
              )}

              <div className="flex gap-4 flex-wrap md:flex-nowrap">
                {/* 左：製品情報テーブル */}
                <div className="flex-1 min-w-0">
                  <div className="bg-[#0058B3] text-white text-xs font-bold px-3 py-1.5">製品情報</div>
                  <table className="w-full text-xs border border-[#ddd] border-t-0">
                    <tbody>
                      {specData.maker && (
                        <tr className="border-b border-[#eee]">
                          <td className="bg-[#f5f5f5] px-3 py-2 w-32 font-bold text-[#555] border-r border-[#eee]">メーカー</td>
                          <td className="px-3 py-2 font-bold text-[#333]">{specData.maker}</td>
                        </tr>
                      )}
                      {specData.genre && (
                        <tr className="border-b border-[#eee]">
                          <td className="bg-[#f5f5f5] px-3 py-2 w-32 font-bold text-[#555] border-r border-[#eee]">ジャンル</td>
                          <td className="px-3 py-2 text-[#0058B3]">{specData.genre}</td>
                        </tr>
                      )}
                      {specData.type && (
                        <tr className="border-b border-[#eee]">
                          <td className="bg-[#f5f5f5] px-3 py-2 font-bold text-[#555] border-r border-[#eee]">タイプ</td>
                          <td className="px-3 py-2 text-[#0058B3]">{specData.type}</td>
                        </tr>
                      )}
                      {(displayWeight || specData.count) && (
                        <tr className="border-b border-[#eee]">
                          <td className="bg-[#f5f5f5] px-3 py-2 font-bold text-[#555] border-r border-[#eee]">内容量</td>
                          <td className="px-3 py-2">{[displayWeight, specData.count].filter(Boolean).join(' / ')}</td>
                        </tr>
                      )}
                      {specData.ageGroup && (
                        <tr className="border-b border-[#eee]">
                          <td className="bg-[#f5f5f5] px-3 py-2 font-bold text-[#555] border-r border-[#eee]">対象年齢</td>
                          <td className="px-3 py-2">{specData.ageGroup}</td>
                        </tr>
                      )}
                      {specData.size && (
                        <tr className="border-b border-[#eee]">
                          <td className="bg-[#f5f5f5] px-3 py-2 font-bold text-[#555] border-r border-[#eee]">対象サイズ</td>
                          <td className="px-3 py-2">{specData.size}</td>
                        </tr>
                      )}
                      {specData.itemSize && (
                        <tr className="border-b border-[#eee]">
                          <td className="bg-[#f5f5f5] px-3 py-2 font-bold text-[#555] border-r border-[#eee]">サイズ</td>
                          <td className="px-3 py-2 text-[#0058B3] font-bold">{specData.itemSize}</td>
                        </tr>
                      )}
                      {/* カロリー：楽天APIから取得した場合のみ表示 */}
                      {displayCalorie && (
                        <tr className="border-b border-[#eee]">
                          <td className="bg-[#f5f5f5] px-3 py-2 font-bold text-[#555] border-r border-[#eee]">カロリー</td>
                          <td className="px-3 py-2 text-[#0058B3]">{displayCalorie}</td>
                        </tr>
                      )}
                      {/* 保証成分：楽天APIから取得した場合のみ表示 */}
                      {displayGuaranteedAnalysis && (
                        <tr className="border-b border-[#eee]">
                          <td className="bg-[#f5f5f5] px-3 py-2 font-bold text-[#555] border-r border-[#eee]">保証成分</td>
                          <td className="px-3 py-2 text-xs text-[#333]">{displayGuaranteedAnalysis}</td>
                        </tr>
                      )}
                      {specData.pricePerKg && isFoodCategory && (
                        <tr className="border-b border-[#eee]">
                          <td className="bg-[#f5f5f5] px-3 py-2 font-bold text-[#555] border-r border-[#eee]">1kgあたり価格</td>
                          <td className="px-3 py-2 font-bold text-[#CC0000]">{specData.pricePerKg}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="bg-[#f5f5f5] px-3 py-2 font-bold text-[#555] border-r border-[#eee]">販売店</td>
                        <td className="px-3 py-2 text-[#0058B3]">{product.shop_name}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 右：特徴・用途 */}
                {specData.features.length > 0 && (
                  <div className="w-52 shrink-0">
                    <div className="bg-[#0058B3] text-white text-xs font-bold px-3 py-1.5">特徴・用途</div>
                    <table className="w-full text-xs border border-[#ddd] border-t-0">
                      <tbody>
                        {specData.features.map((f) => (
                          <tr key={f.label} className="border-b border-[#eee]">
                            <td className="px-3 py-2 text-[#333]">{f.label}</td>
                            <td className="px-3 py-2 text-center w-10">
                              <span className="text-[#0058B3] font-bold text-sm">○</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 原材料：楽天APIから取得した場合のみ表示 */}
              {displayIngredients && (
                <div className="mt-3">
                  <div className="bg-[#0058B3] text-white text-xs font-bold px-3 py-1.5">原材料</div>
                  <div className="border border-[#ddd] border-t-0 px-3 py-2 text-xs text-[#333] leading-relaxed">
                    {displayIngredients}
                  </div>
                </div>
              )}

              {/* 成分安全スコア */}
              <IngredientScoreBadge
                name={product.name}
                ingredients={displayIngredients || undefined}
                category={product.category}
              />

              <div className="mt-2 flex items-center gap-2">
                {rakutenDetail ? (
                  <span className="text-xs text-[#009900] bg-[#f0fff0] border border-[#99cc99] px-2 py-0.5">
                    ✓ 楽天市場の商品情報から取得
                  </span>
                ) : (
                  <span className="text-xs text-[#999]">
                    ※ スペック情報は商品名から抽出。確認は楽天市場の商品ページで
                  </span>
                )}
                <a
                  href={product.item_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#0058B3] hover:underline ml-auto"
                >
                  楽天市場の商品ページで詳細を確認 →
                </a>
              </div>
            </div>
          </div>

          {/* 価格推移グラフ */}
          {history && history.length > 1 && (
            <div className="bg-white border border-[#ddd]">
              <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
                <h2 className="text-sm font-bold text-[#333]">📈 過去30日間の価格推移</h2>
              </div>
              <div className="p-3">
                <PriceChart history={history} />
                <p className="text-xs text-[#999] mt-1">● 赤い点が最安値</p>
              </div>
            </div>
          )}

          {/* 価格アラート */}
          <div className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">🔔 価格アラート設定</h2>
            </div>
            <div className="p-3">
              <AlertForm productId={product.id} currentPrice={product.current_price} />
            </div>
          </div>

          {/* マルチモール最安値比較 */}
          <div className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">🏪 他モールでの価格を確認</h2>
            </div>
            <div className="p-3">
              <MultiMallPrices
                productName={product.name}
                rakutenPrice={product.current_price}
                rakutenUrl={product.affiliate_url || product.item_url || '#'}
              />
            </div>
          </div>

          {/* 定期購入シミュレーター */}
          <SubscriptionSimulator price={product.current_price} name={product.name} />

          {/* 閲覧履歴 */}
          <RecentlyViewed excludeId={product.id} />

          {/* ペット連動おすすめ */}
          <PetRecommendations />

          {/* この商品を見た人はこちらも */}
          {related && related.length > 0 && (
            <section className="bg-white border border-[#ddd]">
              <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
                <h2 className="text-sm font-bold text-[#333]">👀 この商品を見た人はこちらも</h2>
              </div>
              <div className="grid grid-cols-4 divide-x divide-[#eee] p-2">
                {(related as { id: string; name: string; image_url: string | null; current_price: number; review_count: number; review_average: number; shop_name?: string }[]).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
