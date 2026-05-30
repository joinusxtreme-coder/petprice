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

const RANK_COLORS: Record<number, string> = {
  1: 'bg-yellow-400 text-white',
  2: 'bg-gray-400 text-white',
  3: 'bg-orange-500 text-white',
};

function StarRating({ average, count }: { average: number; count: number }) {
  const full = Math.floor(average);
  const half = average - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-yellow-400 text-xs">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i}>{i <= full ? '★' : i === full + 1 && half ? '⯨' : '☆'}</span>
        ))}
      </div>
      <span className="text-xs text-gray-500">
        ({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})
      </span>
    </div>
  );
}

export default function ProductCard({ product, rank }: ProductCardProps) {
  const discountRate =
    product.prev_price && product.prev_price > product.current_price
      ? Math.round((1 - product.current_price / product.prev_price) * 100)
      : null;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-5xl">🐾</div>
        )}

        {/* Rank badge */}
        {rank && (
          <div
            className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow ${
              RANK_COLORS[rank] || 'bg-[#2E4057] text-white'
            }`}
          >
            {rank}
          </div>
        )}

        {/* Discount badge */}
        {discountRate && discountRate >= 5 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{discountRate}%
          </div>
        )}

        {/* Popular badge */}
        {!rank && !discountRate && product.review_count >= 10000 && (
          <div className="absolute top-2 right-2 bg-[#FF6B35] text-white text-xs font-bold px-1.5 py-0.5 rounded">
            人気
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-snug">{product.name}</p>

        <div className="space-y-0.5">
          {product.prev_price && product.prev_price > product.current_price && (
            <p className="text-xs text-gray-400 line-through">¥{product.prev_price.toLocaleString()}</p>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-red-600">¥{product.current_price.toLocaleString()}</span>
            {discountRate && discountRate >= 5 && (
              <span className="text-xs text-red-500 font-semibold">{discountRate}%OFF</span>
            )}
          </div>
        </div>

        <StarRating average={product.review_average} count={product.review_count} />
      </div>
    </Link>
  );
}
