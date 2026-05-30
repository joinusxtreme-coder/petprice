import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  current_price: number;
  review_count: number;
  review_average: number;
  shop_name?: string;
  prev_price?: number;
}

interface ProductCardProps {
  product: Product;
  rank?: number;
}

function RankBadge({ rank }: { rank: number }) {
  const style =
    rank === 1 ? 'bg-[#FF6600] text-white' :
    rank === 2 ? 'bg-[#999] text-white' :
    rank === 3 ? 'bg-[#CC6600] text-white' :
    'bg-[#eee] text-[#666]';
  return (
    <div className={`absolute top-0 left-0 w-6 h-6 flex items-center justify-center text-xs font-bold z-10 ${style}`}>
      {rank}
    </div>
  );
}

export default function ProductCard({ product, rank }: ProductCardProps) {
  const discountRate =
    product.prev_price && product.prev_price > product.current_price
      ? Math.round((1 - product.current_price / product.prev_price) * 100)
      : null;

  const stars = Math.round(product.review_average * 2) / 2; // 0.5刻み
  const fullStars = Math.floor(stars);
  const halfStar = stars % 1 >= 0.5;

  // レビュー数の表示（1000以上はk表示）
  const reviewDisplay =
    product.review_count >= 1000
      ? `${(product.review_count / 1000).toFixed(1)}k`
      : product.review_count.toString();

  return (
    <div className="bg-white hover:bg-[#FFFBF7] transition-colors group relative flex flex-col">
      {rank && <RankBadge rank={rank} />}

      {/* Image */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square bg-white border-b border-[#eee] overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 50vw, 20vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#ccc] text-4xl">🐾</div>
          )}
          {discountRate && discountRate >= 3 && (
            <div className="absolute bottom-0 right-0 bg-red-600 text-white text-xs font-bold px-1 py-0.5">
              -{discountRate}%
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-2 flex flex-col flex-1">
        {/* ショップ名（メーカー名代わり） */}
        {product.shop_name && (
          <p className="text-xs text-[#999] truncate mb-0.5">{product.shop_name}</p>
        )}

        <Link href={`/product/${product.id}`} className="text-xs text-[#0058B3] hover:underline leading-snug line-clamp-3 block mb-1 flex-1">
          {product.name}
        </Link>

        {product.prev_price && product.prev_price > product.current_price && (
          <p className="text-xs text-[#999] line-through">¥{product.prev_price.toLocaleString()}</p>
        )}
        <p className="text-base font-bold text-[#FF6600] leading-tight">
          ¥{product.current_price.toLocaleString()}<span className="text-xs font-normal">〜</span>
        </p>

        <div className="flex items-center gap-0.5 mt-0.5">
          <span className="text-yellow-500 text-xs">
            {'★'.repeat(fullStars)}
            {halfStar ? '½' : ''}
            {'☆'.repeat(5 - fullStars - (halfStar ? 1 : 0))}
          </span>
          <span className="text-xs text-[#666]">({reviewDisplay})</span>
        </div>
      </div>
    </div>
  );
}
