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
