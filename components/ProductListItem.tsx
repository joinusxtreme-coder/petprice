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

interface Props {
  product: Product;
  rank?: number;
}

function RankBadge({ rank }: { rank: number }) {
  const style =
    rank === 1 ? 'bg-[#FF6600] text-white' :
    rank === 2 ? 'bg-[#999] text-white' :
    rank === 3 ? 'bg-[#CC6600] text-white' :
    'bg-[#eee] text-[#555]';
  return (
    <div className={`shrink-0 w-7 h-7 flex items-center justify-center text-sm font-bold ${style}`}>
      {rank}
    </div>
  );
}

export default function ProductListItem({ product, rank }: Props) {
  const discountRate =
    product.prev_price && product.prev_price > product.current_price
      ? Math.round((1 - product.current_price / product.prev_price) * 100)
      : null;
  const stars = Math.round(product.review_average);

  return (
    <div className="flex gap-3 items-start py-3 border-b border-[#eee] last:border-0 hover:bg-[#FFFBF7] transition-colors group">
      {rank && <RankBadge rank={rank} />}

      {/* Image */}
      <Link href={`/product/${product.id}`} className="shrink-0">
        <div className="relative w-16 h-16 bg-white border border-[#eee] overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-1 group-hover:scale-105 transition-transform"
              sizes="64px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[#ccc] text-2xl">🐾</div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/product/${product.id}`} className="text-sm text-[#0058B3] hover:underline leading-snug line-clamp-2">
          {product.name}
        </Link>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-yellow-500 text-xs">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
          <span className="text-xs text-[#0058B3] hover:underline cursor-pointer">
            ({product.review_count.toLocaleString()}件)
          </span>
        </div>
        {product.shop_name && (
          <p className="text-xs text-[#999] mt-0.5">販売: {product.shop_name}</p>
        )}
      </div>

      {/* Price */}
      <div className="shrink-0 text-right min-w-[90px]">
        {product.prev_price && product.prev_price > product.current_price && (
          <p className="text-xs text-[#999] line-through">¥{product.prev_price.toLocaleString()}</p>
        )}
        <p className="text-lg font-bold text-[#CC0000]">
          ¥{product.current_price.toLocaleString()}
        </p>
        {discountRate && discountRate >= 3 && (
          <span className="text-xs text-white bg-red-600 px-1 py-0.5 font-bold">
            -{discountRate}%
          </span>
        )}
        <p className="text-xs text-[#999] mt-0.5">楽天市場</p>
      </div>
    </div>
  );
}
