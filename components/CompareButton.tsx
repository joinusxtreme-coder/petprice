'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  current_price: number;
}

interface Props {
  product: Product;
}

const STORAGE_KEY = 'petprice_compare';

function getCompareList(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCompareList(list: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function CompareButton({ product }: Props) {
  const [compareList, setCompareList] = useState<Product[]>([]);

  useEffect(() => {
    setCompareList(getCompareList());

    function onStorage() {
      setCompareList(getCompareList());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isAdded = compareList.some((p) => p.id === product.id);

  function handleClick() {
    const list = getCompareList();
    if (isAdded) {
      const next = list.filter((p) => p.id !== product.id);
      saveCompareList(next);
      setCompareList(next);
    } else {
      if (list.length >= 3) {
        alert('比較できるのは最大3商品です');
        return;
      }
      const next = [...list, product];
      saveCompareList(next);
      setCompareList(next);
    }
  }

  const compareIds = compareList.map((p) => p.id).join(',');

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1 border px-3 py-1.5 text-xs ${
          isAdded
            ? 'border-[#0058B3] bg-[#e8f0f8] text-[#0058B3]'
            : 'border-[#ddd] hover:bg-[#f0f0f0] text-[#333]'
        }`}
      >
        {isAdded ? '✓ 比較中' : '比較に追加'}
      </button>

      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0058B3] text-white py-2 px-4 flex items-center gap-3 z-50 text-xs">
          <span className="font-bold">比較中:</span>
          {compareList.map((p) => (
            <span key={p.id} className="bg-white text-[#0058B3] px-2 py-0.5 font-bold line-clamp-1 max-w-40">
              {p.name.slice(0, 15)}{p.name.length > 15 ? '...' : ''}
            </span>
          ))}
          <Link
            href={`/compare?ids=${compareIds}`}
            className="ml-auto bg-[#FF6600] text-white px-4 py-1.5 font-bold hover:bg-[#e55a00]"
          >
            比較する
          </Link>
        </div>
      )}
    </>
  );
}
