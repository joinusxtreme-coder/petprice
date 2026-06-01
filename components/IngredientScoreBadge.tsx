'use client';

import { useState } from 'react';
import { calcIngredientScore, renderStars } from '@/lib/ingredientScore';

interface Props {
  name: string;
  ingredients?: string | null;
  category: string;
}

export default function IngredientScoreBadge({ name, ingredients, category }: Props) {
  const [expanded, setExpanded] = useState(false);
  const result = calcIngredientScore(name, ingredients, category);

  if (!result.applicable) return null;

  return (
    <div className="bg-white border border-[#ddd] p-4 mt-4">
      <h3 className="font-bold text-sm text-[#333] mb-3">🔬 成分安全スコア</h3>

      {/* スコアバー */}
      <div className="flex items-center gap-4 mb-3">
        {/* 円形スコア */}
        <div
          className="shrink-0 w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 font-bold"
          style={{ borderColor: result.color, backgroundColor: result.bgColor }}
        >
          <span className="text-xl leading-none" style={{ color: result.color }}>{result.score}</span>
          <span className="text-xs" style={{ color: result.color }}>/ 100</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-bold text-sm px-2 py-0.5 rounded"
              style={{ color: result.color, backgroundColor: result.bgColor }}
            >
              {result.label}
            </span>
            <span className="text-[#F5A623] text-base tracking-tight">{renderStars(result.stars)}</span>
          </div>
          {/* バー */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${result.score}%`, backgroundColor: result.color }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#999] mt-0.5">
            <span>0</span><span>50</span><span>100</span>
          </div>
        </div>
      </div>

      {/* 詳細ボタン */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xs text-[#0058B3] hover:underline"
      >
        {expanded ? '▲ 詳細を隠す' : '▼ スコアの根拠を見る'}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {result.pros.length > 0 && (
            <div>
              <div className="text-xs font-bold text-green-700 mb-1">✅ 評価ポイント（加点）</div>
              <ul className="space-y-1">
                {result.pros.map((p) => (
                  <li key={p} className="text-xs text-[#333] flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">+</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.cons.length > 0 && (
            <div>
              <div className="text-xs font-bold text-red-700 mb-1">⚠️ 懸念ポイント（減点）</div>
              <ul className="space-y-1">
                {result.cons.map((c) => (
                  <li key={c} className="text-xs text-[#333] flex items-start gap-1.5">
                    <span className="text-red-500 mt-0.5">−</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.pros.length === 0 && result.cons.length === 0 && (
            <p className="text-xs text-[#999]">商品名から評価できる情報が少ないため、スコアはベースライン（50点）です。</p>
          )}
          <p className="text-xs text-[#999] border-t border-[#eee] pt-2 mt-2">
            ※スコアは商品名・成分情報のキーワードをもとに自動算出した参考値です。獣医師の診断・推奨に代わるものではありません。
          </p>
        </div>
      )}
    </div>
  );
}
