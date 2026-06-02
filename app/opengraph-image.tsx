import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ペットプライス | ペット用品の最安値比較';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FF6600',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 96,
            fontWeight: 'bold',
            letterSpacing: '-2px',
          }}
        >
          ペットプライス
        </div>
        <div
          style={{
            color: 'white',
            fontSize: 48,
            opacity: 0.9,
          }}
        >
          ペット用品の最安値比較
        </div>
      </div>
    ),
    size,
  );
}
