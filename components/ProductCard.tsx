import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  current_price: number;
  review_count: number;
  review_average: number;
  prev_price?: number;
}

interface ProductCardProps {
  product: Product;
  rank?: number;
}

// 価格.com風ランクバッジ色
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

  const stars = Math.round(product.review_average);

  return (
    <div className="bg-white border border-[#ddd] hover:border-[#FF6600] hover:shadow transition-all group relative">
      {/* Rank */}
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
      <div className="p-2">
        <Link href={`/product/${product.id}`} className="text-xs text-[#0058B3] hover:underline leading-snug line-clamp-3 block mb-1.5">
          {product.name}
        </Link>

        {product.prev_price && product.prev_price > product.current_price && (
          <p className="text-xs text-[#999] line-through">¥{product.prev_price.toLocaleString()}</p>
        )}
        <p className="text-base font-bold text-[#CC0000] leading-tight">
          ¥{product.current_price.toLocaleString()}
        </p>

        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-500 text-xs">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
          <span className="text-xs text-[#666]">
            ({product.review_count >= 1000
              ? `${(product.review_count / 1000).toFixed(1)}k`
              : product.review_count})
          </span>
        </div>

        <div className="mt-1.5">
          <Link
            href={`/product/${product.id}`}
            className="text-xs text-[#666] border border-[#ccc] px-2 py-0.5 hover:bg-[#f5f5f5] inline-block"
          >
            詳細を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
