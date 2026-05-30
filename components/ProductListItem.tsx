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

const RANK_STYLE: Record<number, string> = {
  1: 'bg-yellow-400 text-white',
  2: 'bg-gray-400 text-white',
  3: 'bg-orange-500 text-white',
};

export default function ProductListItem({ product, rank }: Props) {
  const discountRate =
    product.prev_price && product.prev_price > product.current_price
      ? Math.round((1 - product.current_price / product.prev_price) * 100)
      : null;

  const stars = Math.round(product.review_average);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:border-[#E4007F] hover:shadow-md transition-all"
    >
      {/* Rank */}
      {rank && (
        <div className="shrink-0 flex flex-col items-center justify-start pt-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              RANK_STYLE[rank] || 'bg-gray-200 text-gray-600'
            }`}
          >
            {rank}
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-1 group-hover:scale-105 transition-transform"
            sizes="80px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-2xl">🐾</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#333] leading-snug line-clamp-2 group-hover:text-[#E4007F] transition-colors">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex text-yellow-400 text-xs">
            {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
          </div>
          <span className="text-xs text-gray-500">{product.review_average}</span>
          <span className="text-xs text-blue-600 underline">
            ({product.review_count.toLocaleString()}件)
          </span>
        </div>
        {product.shop_name && (
          <p className="text-xs text-gray-400 mt-1">販売: {product.shop_name}</p>
        )}
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        {product.prev_price && product.prev_price > product.current_price && (
          <p className="text-xs text-gray-400 line-through">¥{product.prev_price.toLocaleString()}</p>
        )}
        <p className="text-xl font-bold text-[#E4007F]">
          ¥{product.current_price.toLocaleString()}
        </p>
        {discountRate && discountRate >= 3 && (
          <span className="inline-block text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded mt-0.5">
            -{discountRate}%
          </span>
        )}
        <p className="text-xs text-gray-500 mt-1">楽天市場</p>
      </div>
    </Link>
  );
}
