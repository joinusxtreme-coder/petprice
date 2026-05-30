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
}

function PriceBadge({ current, prev }: { current: number; prev?: number }) {
  if (!prev) return null;
  const diff = current - prev;
  if (diff === 0) return null;
  const isDown = diff < 0;
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        isDown ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
      }`}
    >
      {isDown ? '▼' : '▲'}
      {Math.abs(diff).toLocaleString()}円
    </span>
  );
}

function StarRating({ average, count }: { average: number; count: number }) {
  const stars = Math.round(average);
  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <span className="text-yellow-400">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
      <span>({count.toLocaleString()}件)</span>
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="block bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-4xl">🐾</div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-sm text-[#333333] font-medium line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-red-600">¥{product.current_price.toLocaleString()}</span>
          <PriceBadge current={product.current_price} prev={product.prev_price} />
        </div>
        <StarRating average={product.review_average} count={product.review_count} />
        <div className="pt-1">
          <span className="inline-block text-xs bg-[#2E4057] text-white px-3 py-1 rounded-full">詳細を見る</span>
        </div>
      </div>
    </Link>
  );
}
