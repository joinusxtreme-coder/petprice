'use client';

interface AffiliateButtonProps {
  url: string;
  label?: string;
  className?: string;
}

export default function AffiliateButton({ url, label = '楽天市場で購入する', className = '' }: AffiliateButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block bg-[#FF6B35] hover:bg-[#e55a24] text-white font-bold py-3 px-6 rounded-lg transition-colors text-center ${className}`}
    >
      {label}
    </a>
  );
}
