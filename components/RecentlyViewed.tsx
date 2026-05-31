'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getHistory, clearHistory, type HistoryItem } from '@/lib/browsingHistory';

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const all = getHistory();
    setItems(excludeId ? all.filter((h) => h.id !== excludeId) : all);
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <section style={{ margin: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 'bold', color: '#333', margin: 0 }}>
          👁️ 最近チェックした商品
        </h2>
        <button
          onClick={() => { clearHistory(); setItems([]); }}
          style={{ fontSize: 12, color: '#999', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          履歴を消去
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
        {items.slice(0, 10).map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            style={{ textDecoration: 'none', flexShrink: 0, width: 120 }}
          >
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              overflow: 'hidden',
              background: '#fff',
              transition: 'box-shadow 0.15s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ position: 'relative', width: 120, height: 90, background: '#f5f5f5' }}>
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill style={{ objectFit: 'contain' }} sizes="120px" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🐾</div>
                )}
              </div>
              <div style={{ padding: '6px 8px' }}>
                <p style={{ fontSize: 11, color: '#333', margin: 0, lineHeight: 1.3, height: 32, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.name}
                </p>
                <p style={{ fontSize: 13, fontWeight: 'bold', color: '#CC0000', margin: '4px 0 0' }}>
                  ¥{item.current_price.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
