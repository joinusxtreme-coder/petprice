/**
 * A8.net アフィリエイト広告コンポーネント
 * ペットプライス (メディアID: a26060120435)
 */

// モグワン 300×250バナー（素材ID:010）
export function MogwanBanner300() {
  return (
    <div className="text-center">
      <a
        href="https://px.a8.net/svt/ejp?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1"
        rel="nofollow"
        target="_blank"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={300}
          height={250}
          alt="モグワン ドッグフード"
          src="https://www27.a8.net/svt/bgt?aid=260601701989&wid=001&eno=01&mid=s00000000458008010000&mc=1"
          style={{ border: 0 }}
        />
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www18.a8.net/0.gif?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1"
        alt=""
        style={{ border: 0 }}
      />
    </div>
  );
}

// モグワン 320×50バナー（素材ID:014）
export function MogwanBanner320x50() {
  return (
    <div className="text-center">
      <a
        href="https://px.a8.net/svt/ejp?a8mat=4B5LK5+GCTQ2A+3J8+1BPOF5"
        rel="nofollow"
        target="_blank"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={320}
          height={50}
          alt="モグワン ドッグフード"
          src="https://www23.a8.net/svt/bgt?aid=260601701989&wid=001&eno=01&mid=s00000000458008014000&mc=1"
          style={{ border: 0 }}
        />
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www14.a8.net/0.gif?a8mat=4B5LK5+GCTQ2A+3J8+1BPOF5"
        alt=""
        style={{ border: 0 }}
      />
    </div>
  );
}

// モグワン テキストリンク（素材ID:002）
export function MogwanTextLink() {
  return (
    <>
      <a
        href="https://px.a8.net/svt/ejp?a8mat=4B5LK5+GCTQ2A+3J8+1BN3TU"
        rel="nofollow"
        target="_blank"
        className="text-[#0058B3] underline hover:text-[#FF6600] text-sm"
      >
        手作りレシピを追求したプレミアムドッグフード『モグワン』
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www17.a8.net/0.gif?a8mat=4B5LK5+GCTQ2A+3J8+1BN3TU"
        alt=""
        style={{ border: 0 }}
      />
    </>
  );
}

/**
 * サイドバー広告ウィジェット
 * 「PR」表記付き、300×250バナー
 */
export function SidebarAdWidget() {
  return (
    <div className="bg-white border border-[#ddd] p-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-[#999] font-bold tracking-widest">PR</span>
        <span className="text-[10px] text-[#999]">広告</span>
      </div>
      <MogwanBanner300 />
      <p className="text-[10px] text-[#999] mt-1 text-center">
        ※本広告はアフィリエイト広告です
      </p>
    </div>
  );
}

// ===== Catlog シリーズ（猫GPS首輪・体重計）EPC 35.88 =====

// Catlog テキストリンク「すべては猫様のために【Catlog】」
export function CatlogTextLink() {
  return (
    <>
      <a
        href="https://px.a8.net/svt/ejp?a8mat=4B5LK6+123RHU+4WPO+5YJRM"
        rel="nofollow"
        target="_blank"
        className="text-[#0058B3] underline hover:text-[#FF6600] text-sm"
      >
        すべては猫様のために【Catlog】
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www14.a8.net/0.gif?a8mat=4B5LK6+123RHU+4WPO+5YJRM"
        alt=""
        style={{ border: 0 }}
      />
    </>
  );
}

// Catlog Board テキストリンク（体調・体重記録）
export function CatlogBoardTextLink() {
  return (
    <>
      <a
        href="https://px.a8.net/svt/ejp?a8mat=4B5LK6+123RHU+4WPO+63OYA"
        rel="nofollow"
        target="_blank"
        className="text-[#0058B3] underline hover:text-[#FF6600] text-sm"
      >
        体調トラブルの早期発見やダイエットに。【Catlog Board】
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www14.a8.net/0.gif?a8mat=4B5LK6+123RHU+4WPO+63OYA"
        alt=""
        style={{ border: 0 }}
      />
    </>
  );
}

/**
 * 猫ページ向けサイドバー広告（Catlog）
 * PR表記付きテキスト型
 */
export function CatAdWidget() {
  return (
    <div className="bg-white border border-[#ddd] p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-[#999] font-bold tracking-widest">PR</span>
        <span className="text-[10px] text-[#999]">広告</span>
      </div>
      <div className="bg-[#F0F8FF] border border-[#ADD8E6] rounded p-3">
        <p className="text-sm font-bold text-[#333] leading-snug mb-1">
          🐱 愛猫の健康を24時間見守る【Catlog】
        </p>
        <p className="text-xs text-[#666] leading-relaxed mb-2">
          猫専用首輪型デバイスで活動量・睡眠・食事を自動記録。体調の小さな変化も見逃しません。
        </p>
        <a
          href="https://px.a8.net/svt/ejp?a8mat=4B5LK6+123RHU+4WPO+5YJRM"
          rel="nofollow"
          target="_blank"
          className="inline-block bg-[#5B9BD5] text-white text-xs font-bold px-3 py-1.5 rounded w-full text-center"
        >
          詳しく見る →
        </a>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www14.a8.net/0.gif?a8mat=4B5LK6+123RHU+4WPO+5YJRM"
        alt=""
        style={{ border: 0 }}
      />
    </div>
  );
}

/**
 * 猫フードページ向けインライン広告（Catlog）
 */
export function InlineCatAd() {
  return (
    <div className="bg-[#F0F8FF] border border-[#ADD8E6] rounded p-3 my-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-[#999] font-bold">PR</span>
          <p className="text-sm font-bold text-[#333] leading-snug">
            🐱 猫の健康を24時間見守る首輪型デバイス『Catlog』
          </p>
          <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
            活動量・睡眠・食事を自動記録。体調の変化を早期発見してペットの健康維持に。
          </p>
          <a
            href="https://px.a8.net/svt/ejp?a8mat=4B5LK6+123RHU+4WPO+5YJRM"
            rel="nofollow"
            target="_blank"
            className="inline-block mt-1.5 bg-[#5B9BD5] text-white text-xs font-bold px-3 py-1 rounded"
          >
            詳細を見る →
          </a>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www14.a8.net/0.gif?a8mat=4B5LK6+123RHU+4WPO+5YJRM"
        alt=""
        style={{ border: 0 }}
      />
    </div>
  );
}

// ===== 馬肉自然づくり（犬用プレミアムフード）EPC 33.77 =====

// 馬肉自然づくり テキストリンク
export function UmanikusenTextLink() {
  return (
    <>
      <a
        href="https://px.a8.net/svt/ejp?a8mat=4B5LK6+13W2B6+3E6W+NVWSI"
        rel="nofollow"
        target="_blank"
        className="text-[#0058B3] underline hover:text-[#FF6600] text-sm"
      >
        馬刺し専門店がつくる「馬肉ドッグフード」
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www10.a8.net/0.gif?a8mat=4B5LK6+13W2B6+3E6W+NVWSI"
        alt=""
        style={{ border: 0 }}
      />
    </>
  );
}

/**
 * 犬フードページ向けインライン広告（馬肉自然づくり）
 */
export function InlineDogFoodAd() {
  return (
    <div className="bg-[#FFF5E6] border border-[#DEB887] rounded p-3 my-4">
      <div className="min-w-0">
        <span className="text-[10px] text-[#999] font-bold">PR</span>
        <p className="text-sm font-bold text-[#333] leading-snug">
          🐕 馬刺し専門店がつくるプレミアムドッグフード『馬肉自然づくり』
        </p>
        <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
          本場熊本の馬刺し専門店が開発。添加物不使用・新鮮馬肉を贅沢に使用した安心・安全なドッグフード。
        </p>
        <a
          href="https://px.a8.net/svt/ejp?a8mat=4B5LK6+13W2B6+3E6W+NVWSI"
          rel="nofollow"
          target="_blank"
          className="inline-block mt-1.5 bg-[#8B4513] text-white text-xs font-bold px-3 py-1 rounded"
        >
          詳細を見る →
        </a>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www10.a8.net/0.gif?a8mat=4B5LK6+13W2B6+3E6W+NVWSI"
        alt=""
        style={{ border: 0 }}
      />
    </div>
  );
}

// ===== Dr.ケアワン（国産無添加ドッグフード）EPC 12.66 =====

// Dr.ケアワン テキストリンク
export function DrCareOneTextLink() {
  return (
    <>
      <a
        href="https://px.a8.net/svt/ejp?a8mat=4B5LK6+12P73M+3RW8+BWVTE"
        rel="nofollow"
        target="_blank"
        className="text-[#0058B3] underline hover:text-[#FF6600] text-sm"
      >
        国産無添加ドッグフード「Dr.ケアワン」
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www14.a8.net/0.gif?a8mat=4B5LK6+12P73M+3RW8+BWVTE"
        alt=""
        style={{ border: 0 }}
      />
    </>
  );
}

/**
 * インライン広告（フードページ向け）
 * テキスト付き横型
 */
export function InlineFoodAd() {
  return (
    <div className="bg-[#FFF9F0] border border-[#FFD700] rounded p-3 my-4">
      <div className="flex items-center gap-3">
        <a
          href="https://px.a8.net/svt/ejp?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1"
          rel="nofollow"
          target="_blank"
          className="flex-shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            width={120}
            height={100}
            alt="モグワン"
            src="https://www27.a8.net/svt/bgt?aid=260601701989&wid=001&eno=01&mid=s00000000458008010000&mc=1"
            className="object-cover"
            style={{ border: 0 }}
          />
        </a>
        <div className="min-w-0">
          <span className="text-[10px] text-[#999] font-bold">PR</span>
          <p className="text-sm font-bold text-[#333] leading-snug">
            🐕 プレミアムドッグフード『モグワン』
          </p>
          <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
            グレインフリー・チキン生肉とサーモン使用。獣医師も推奨するプレミアムフード。
          </p>
          <a
            href="https://px.a8.net/svt/ejp?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1"
            rel="nofollow"
            target="_blank"
            className="inline-block mt-1.5 bg-[#FF6600] text-white text-xs font-bold px-3 py-1 rounded"
          >
            詳細を見る →
          </a>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={1}
        height={1}
        src="https://www18.a8.net/0.gif?a8mat=4B5LK5+GCTQ2A+3J8+1BOTK1"
        alt=""
        style={{ border: 0 }}
      />
    </div>
  );
}
