export const CATEGORY_CONFIG: Record<string, { label: string; icon: string; petType: string; dbCategory: string; group: string }> = {
  'dog-food':           { label: 'ドッグフード',              icon: '🐕',  petType: 'dog',     dbCategory: 'dog-food',          group: '犬用品' },
  'dog-snack':          { label: '犬のおやつ',                icon: '🦴',  petType: 'dog',     dbCategory: 'dog-snack',         group: '犬用品' },
  'dog-feeder':         { label: '食器類・給水器(犬)',        icon: '🥣',  petType: 'dog',     dbCategory: 'dog-feeder',        group: '犬用品' },
  'dog-toilet':         { label: 'トイレトレー',              icon: '🚽',  petType: 'dog',     dbCategory: 'dog-toilet',        group: '犬用品' },
  'dog-walk':           { label: 'お散歩・首輪・ハーネス',   icon: '🐕‍🦺', petType: 'dog',    dbCategory: 'dog-walk',          group: '犬用品' },
  'dog-care':           { label: 'シャンプー・ヘルスケア',   icon: '🛁',  petType: 'dog',     dbCategory: 'dog-care',          group: '犬用品' },
  'dog-clothes':        { label: '犬服・ペット服',            icon: '👕',  petType: 'dog',     dbCategory: 'dog-clothes',       group: '犬用品' },
  'dog-toy':            { label: '犬のおもちゃ',              icon: '🎾',  petType: 'dog',     dbCategory: 'dog-toy',           group: '犬用品' },
  'dog-goods':          { label: '犬小屋・ケージ・ベッド',   icon: '🏠',  petType: 'dog',     dbCategory: 'dog-goods',         group: '犬用品' },
  'dog-carrier':        { label: 'キャリーバッグ(犬)',        icon: '👜',  petType: 'dog',     dbCategory: 'dog-carrier',       group: '犬用品' },
  'cat-food':           { label: 'キャットフード',            icon: '🐈',  petType: 'cat',     dbCategory: 'cat-food',          group: '猫用品' },
  'cat-snack':          { label: '猫のおやつ',                icon: '🐟',  petType: 'cat',     dbCategory: 'cat-snack',         group: '猫用品' },
  'cat-feeder':         { label: '食器類・給水器(猫)',        icon: '🥣',  petType: 'cat',     dbCategory: 'cat-feeder',        group: '猫用品' },
  'cat-toilet':         { label: 'トイレ本体・猫砂',          icon: '🪣',  petType: 'cat',     dbCategory: 'cat-toilet',        group: '猫用品' },
  'cat-tower':          { label: 'キャットタワー・ケージ',   icon: '🏰',  petType: 'cat',     dbCategory: 'cat-tower',         group: '猫用品' },
  'cat-care':           { label: 'シャンプー・ヘルスケア',   icon: '✂️',  petType: 'cat',     dbCategory: 'cat-care',          group: '猫用品' },
  'cat-toy':            { label: '猫のおもちゃ',              icon: '🪀',  petType: 'cat',     dbCategory: 'cat-toy',           group: '猫用品' },
  'cat-goods':          { label: 'ベッド・マット・ハンモック', icon: '🧶', petType: 'cat',     dbCategory: 'cat-goods',         group: '猫用品' },
  'cat-carrier':        { label: 'キャリーバッグ(猫)',        icon: '👜',  petType: 'cat',     dbCategory: 'cat-carrier',       group: '猫用品' },
  'pet-sheets':         { label: 'ペットシーツ',              icon: '📄',  petType: 'other',   dbCategory: 'pet-sheets',        group: '共通' },
  'pet-toilet':         { label: 'その他ペット用トイレ用品', icon: '🚿',  petType: 'other',   dbCategory: 'pet-toilet',        group: '共通' },
  'bird-food':          { label: '鳥のえさ',                  icon: '🦜',  petType: 'bird',    dbCategory: 'bird-food',         group: '鳥・小動物用品' },
  'small-animal-food':  { label: '小動物フード',              icon: '🐹',  petType: 'small',   dbCategory: 'small-animal-food', group: '鳥・小動物用品' },
  'bird-goods':         { label: '鳥かご・ケージ・おもちゃ', icon: '🐦',  petType: 'bird',    dbCategory: 'bird-goods',        group: '鳥・小動物用品' },
  'small-animal-goods': { label: '小動物用品',                icon: '🐇',  petType: 'small',   dbCategory: 'small-animal-goods',group: '鳥・小動物用品' },
  'fish-food':          { label: '熱帯魚・アクアリウム用エサ', icon: '🐠', petType: 'fish',    dbCategory: 'fish-food',         group: '熱帯魚・アクアリウム用品' },
  'fish-tank':          { label: '水槽・照明・フィルター',   icon: '🐟',  petType: 'fish',    dbCategory: 'fish-tank',         group: '熱帯魚・アクアリウム用品' },
  'fish-goods':         { label: '水槽用品・水草',            icon: '🌿',  petType: 'fish',    dbCategory: 'fish-goods',        group: '熱帯魚・アクアリウム用品' },
  'reptile-food':       { label: '爬虫類・両生類用エサ',     icon: '🦎',  petType: 'reptile', dbCategory: 'reptile-food',      group: '爬虫類・両生類飼育用品' },
  'reptile-goods':      { label: '爬虫類・両生類用飼育用品', icon: '🐸',  petType: 'reptile', dbCategory: 'reptile-goods',     group: '爬虫類・両生類飼育用品' },
  'insect-goods':       { label: '昆虫飼育用品',              icon: '🪲',  petType: 'insect',  dbCategory: 'insect-goods',      group: '昆虫飼育用品' },
};

// カテゴリ別SEO説明文（meta description + ページ説明テキスト）
export const CATEGORY_SEO: Record<string, { description: string; seoText: string }> = {
  'dog-food': {
    description: 'ドッグフード・ドライフード・ウェットフードの最安値を価格比較。ロイヤルカナン・ヒルズ・ニュートロなど人気ブランドの価格推移グラフで買い時がわかる。',
    seoText: 'ペットプライスでは楽天市場の全ドッグフードを価格比較しています。ロイヤルカナン・サイエンスダイエット・ニュートロ・アカナなど人気ブランドの最安値を毎日自動更新。30日間の価格推移グラフで値下がりタイミングがひと目でわかります。子犬（パピー）・成犬・シニア犬向けのフードも網羅。',
  },
  'dog-snack': {
    description: '犬のおやつ・ジャーキー・ガムの最安値を価格比較。ささみ・牛皮・デンタルガムなど豊富な種類の価格推移で買い時をチェック。',
    seoText: 'ペットプライスでは犬のおやつを一括価格比較。ささみジャーキー・牛皮ガム・デンタルおやつ・無添加おやつなど幅広い商品の最安値を毎日更新。楽天市場での人気順ランキングも確認できます。',
  },
  'dog-feeder': {
    description: '犬用フードボウル・自動給餌器・給水器の最安値を価格比較。陶器・ステンレス・プラスチックなど素材別に比較。',
    seoText: 'ペットプライスでは犬用食器・給水器を価格比較。フードボウル・自動給水器・食器台・ウォーターファウンテンなど豊富な種類の最安値を確認できます。高さ調節可能なものや早食い防止タイプも比較可能。',
  },
  'dog-toilet': {
    description: '犬用トイレトレー・ペットシーツの最安値を価格比較。メッシュ付き・トレー単品など種類豊富に比較。',
    seoText: 'ペットプライスでは犬用トイレ用品を価格比較。トイレトレー・メッシュトレー・サークル用トイレなどの最安値を毎日更新。小型犬・中型犬・大型犬サイズ別に検索できます。',
  },
  'dog-walk': {
    description: 'ハーネス・首輪・リード・お散歩グッズの最安値を価格比較。小型犬〜大型犬まで豊富な種類を比較。',
    seoText: 'ペットプライスでは犬用ハーネス・首輪・リードを価格比較。小型犬・中型犬・大型犬向けのハーネス、伸縮リード、首輪の最安値を毎日更新。お散歩バッグ・水筒なども比較可能。',
  },
  'dog-care': {
    description: '犬用シャンプー・ブラシ・爪切り・デンタルケアの最安値を価格比較。グルーミング用品をまとめて比較。',
    seoText: 'ペットプライスでは犬用グルーミング・ヘルスケア用品を価格比較。シャンプー・コンディショナー・ブラシ・爪切り・歯ブラシ・耳掃除グッズの最安値を確認。ファーミネーターなどのトリミング用品も比較できます。',
  },
  'dog-clothes': {
    description: 'ドッグウェア・犬服の最安値を価格比較。Tシャツ・パーカー・カッパなど季節別に豊富な種類を比較。',
    seoText: 'ペットプライスでは犬服・ドッグウェアを価格比較。Tシャツ・パーカー・ダウン・カッパ・コスプレ衣装など豊富な種類の最安値を毎日更新。超小型犬〜大型犬まで各サイズ対応商品を検索できます。',
  },
  'dog-toy': {
    description: '犬のおもちゃの最安値を価格比較。ロープ・ボール・知育玩具・ぬいぐるみなど豊富な種類を比較。',
    seoText: 'ペットプライスでは犬用おもちゃを価格比較。ロープ・ボール・ノーズワーク・知育玩具・チュートイ・ぬいぐるみなどの最安値を毎日更新。小型犬・大型犬別の噛んでも壊れにくいおもちゃも比較できます。',
  },
  'dog-goods': {
    description: '犬用ケージ・サークル・ベッド・ハウスの最安値を価格比較。アイリスオーヤマなど人気ブランドを比較。',
    seoText: 'ペットプライスでは犬用ケージ・クレート・ベッド・マット・ハウスを価格比較。折りたたみサークル・木製犬小屋・ドーム型ベッドなど豊富な種類の最安値を毎日更新。',
  },
  'dog-carrier': {
    description: '犬用キャリーバッグ・スリング・ペットカートの最安値を価格比較。機内持ち込み対応サイズも比較。',
    seoText: 'ペットプライスでは犬用キャリーバッグ・リュック型キャリー・ペットカートを価格比較。航空機内持ち込み対応・お出かけ用・病院用など用途別に最安値を確認できます。',
  },
  'cat-food': {
    description: 'キャットフード・ドライ・ウェット・総合栄養食の最安値を価格比較。ロイヤルカナン・ピュリナなど人気ブランドの価格推移で買い時がわかる。',
    seoText: 'ペットプライスでは楽天市場の全キャットフードを価格比較。ロイヤルカナン・ヒルズ・ピュリナ・いなば・モグニャンなど人気ブランドの最安値を毎日自動更新。子猫・成猫・シニア猫向けのフードも網羅。',
  },
  'cat-snack': {
    description: '猫のおやつ・ちゅーる・ジャーキーの最安値を価格比較。いなばCIAO・銀のスプーンなど人気商品を比較。',
    seoText: 'ペットプライスでは猫のおやつを一括価格比較。ちゅーる・スティック・ジュレ・ドライおやつなどの最安値を毎日更新。まとめ買いでお得な商品の価格推移も確認できます。',
  },
  'cat-feeder': {
    description: '猫用フードボウル・自動給餌器・給水器の最安値を価格比較。循環式ウォーターファウンテンも比較。',
    seoText: 'ペットプライスでは猫用食器・給水器を価格比較。フードボウル・自動給水器・ウォーターファウンテン・食器台の最安値を確認。多頭飼い用や陶器製など素材別にも検索できます。',
  },
  'cat-toilet': {
    description: '猫トイレ・猫砂の最安値を価格比較。デオトイレ・ニャンとも清潔トイレなど人気システムトイレを比較。',
    seoText: 'ペットプライスでは猫トイレ本体・猫砂を価格比較。システムトイレ（デオトイレ・ニャンとも）・鉱物砂・木製砂・紙製砂など豊富な種類の最安値を毎日更新。消臭力・固まりやすさで選べます。',
  },
  'cat-tower': {
    description: 'キャットタワー・猫用ケージの最安値を価格比較。省スペース・大型・天井突っ張りタイプなど豊富な種類を比較。',
    seoText: 'ペットプライスではキャットタワー・キャットウォーク・猫用ケージを価格比較。据え置き型・天井突っ張り型・壁付け型など設置タイプ別に最安値を確認。多頭飼い用の大型タワーも比較できます。',
  },
  'cat-care': {
    description: '猫用シャンプー・ブラシ・爪切り・デンタルケアの最安値を価格比較。グルーミング用品をまとめて比較。',
    seoText: 'ペットプライスでは猫用グルーミング・ヘルスケア用品を価格比較。シャンプー・コンディショナー・スリッカーブラシ・爪切り・歯ブラシ・目ヤニ取りグッズの最安値を確認できます。',
  },
  'cat-toy': {
    description: '猫用おもちゃ・猫じゃらしの最安値を価格比較。電動・光るタイプ・ネコじゃらしなど豊富な種類を比較。',
    seoText: 'ペットプライスでは猫用おもちゃを価格比較。猫じゃらし・電動おもちゃ・ボール・トンネル・羽根おもちゃなどの最安値を毎日更新。一人遊びができる自動タイプも比較できます。',
  },
  'cat-goods': {
    description: '猫用ベッド・マット・ハンモックの最安値を価格比較。ドーム型・ペットソファなど豊富な種類を比較。',
    seoText: 'ペットプライスでは猫用ベッド・マット・クッション・ハンモックを価格比較。ドーム型・ペットソファ・窓付きハンモックなどの最安値を毎日更新。洗えるタイプや季節別商品も比較できます。',
  },
  'cat-carrier': {
    description: '猫用キャリーバッグ・リュックの最安値を価格比較。病院用・旅行用など用途別に豊富な種類を比較。',
    seoText: 'ペットプライスでは猫用キャリーバッグ・リュック型キャリーを価格比較。ハードタイプ・ソフトタイプ・バックパック型など豊富な種類の最安値を確認。病院通い・旅行用途別に検索できます。',
  },
  'pet-sheets': {
    description: 'ペットシーツの最安値を価格比較。レギュラー・ワイド・スーパーワイドサイズを薄型・厚型で比較。大容量まとめ買いがお得。',
    seoText: 'ペットプライスではペットシーツを一括価格比較。レギュラー・ワイド・スーパーワイド・ビッグサイズの薄型・厚型・抗菌タイプを比較。100枚・200枚・400枚のまとめ買いで最安値を確認できます。',
  },
  'bird-food': {
    description: '鳥のえさ・インコのえさ・文鳥フードの最安値を価格比較。種・ペレット・副食など豊富な種類を比較。',
    seoText: 'ペットプライスでは鳥のえさ・ペレット・副食・おやつを価格比較。セキセイインコ・文鳥・オカメインコ・大型インコ向けのフードの最安値を毎日更新。',
  },
  'bird-goods': {
    description: '鳥かご・バードケージ・止まり木・おもちゃの最安値を価格比較。インコ・文鳥向け用品を比較。',
    seoText: 'ペットプライスでは鳥かご・バードケージ・止まり木・おもちゃ・ヒーターなどの鳥用品を価格比較。セキセイインコ・文鳥・コザクラインコなど種類別に最安値を確認できます。',
  },
  'small-animal-food': {
    description: 'ハムスター・うさぎ・フェレットのえさの最安値を価格比較。小動物フード・ペレット・おやつを比較。',
    seoText: 'ペットプライスでは小動物フード・ペレット・副食・おやつを価格比較。ハムスター・うさぎ・チンチラ・フェレット・モルモット向けのフードの最安値を毎日更新。',
  },
  'fish-food': {
    description: '熱帯魚・金魚・メダカのえさの最安値を価格比較。フレーク・顆粒・冷凍餌など種類豊富に比較。',
    seoText: 'ペットプライスでは熱帯魚・金魚・メダカのえさを価格比較。フレーク・顆粒タイプ・冷凍赤虫・ブラインシュリンプなど豊富な種類の最安値を毎日更新。',
  },
  'fish-tank': {
    description: '水槽・アクアリウム用品の最安値を価格比較。水槽セット・フィルター・LED照明・ヒーターをまとめて比較。',
    seoText: 'ペットプライスでは水槽・フィルター・LED照明・ヒーター・底砂・流木などアクアリウム用品を価格比較。30cm〜90cm水槽セットの最安値を毎日更新。初心者向けオールインワンセットも比較できます。',
  },
  'reptile-food': {
    description: '爬虫類・両生類のエサの最安値を価格比較。コオロギ・デュビア・レオパードゲッコー用フードを比較。',
    seoText: 'ペットプライスでは爬虫類・両生類のエサを価格比較。コオロギ・デュビア・ミルワーム・冷凍マウス・人工フードの最安値を毎日更新。カナヘビ・ヤモリ・カエル向けの餌も比較できます。',
  },
  'reptile-goods': {
    description: '爬虫類・両生類用飼育ケージ・ライト・ヒーターの最安値を価格比較。レオパ・ヒョウモントカゲなど向け用品を比較。',
    seoText: 'ペットプライスでは爬虫類・両生類用の飼育ケージ・UVライト・パネルヒーター・シェルターを価格比較。レオパードゲッコー・ヒョウモントカゲモドキ・カメ・カナヘビ向けの飼育用品の最安値を確認できます。',
  },
  'insect-goods': {
    description: 'カブトムシ・クワガタの飼育用品の最安値を価格比較。昆虫マット・産卵木・ゼリーを比較。',
    seoText: 'ペットプライスではカブトムシ・クワガタの飼育用品を価格比較。昆虫マット・産卵木・昆虫ゼリー・飼育ケース・幼虫飼育グッズの最安値を毎日更新。',
  },
};

export const CATEGORY_GROUPS = [
  { label: '犬用品', items: ['dog-food','dog-snack','dog-feeder','dog-toilet','dog-walk','dog-care','dog-clothes','dog-toy','dog-goods','dog-carrier'] },
  { label: '猫用品', items: ['cat-food','cat-snack','cat-feeder','cat-toilet','cat-tower','cat-care','cat-toy','cat-goods','cat-carrier'] },
  { label: '共通', items: ['pet-sheets','pet-toilet'] },
  { label: '鳥・小動物用品', items: ['bird-food','small-animal-food','bird-goods','small-animal-goods'] },
  { label: '熱帯魚・アクアリウム用品', items: ['fish-food','fish-tank','fish-goods'] },
  { label: '爬虫類・両生類飼育用品', items: ['reptile-food','reptile-goods'] },
  { label: '昆虫飼育用品', items: ['insect-goods'] },
];

export const SIDEBAR_GROUPS = [
  {
    label: '犬用品',
    subgroups: [
      { label: 'フード・食事', keys: ['dog-food','dog-snack','dog-feeder'] },
      { label: 'トイレ・衛生用品', keys: ['dog-toilet','pet-sheets'] },
      { label: 'ヘルスケア', keys: ['dog-care'] },
      { label: 'おもちゃ・アウトドア', keys: ['dog-walk','dog-clothes','dog-toy'] },
      { label: 'ハウス・バッグ', keys: ['dog-goods','dog-carrier'] },
    ],
  },
  {
    label: '猫用品',
    subgroups: [
      { label: 'フード・食事', keys: ['cat-food','cat-snack','cat-feeder'] },
      { label: 'トイレ・衛生用品', keys: ['cat-toilet'] },
      { label: 'ヘルスケア', keys: ['cat-care'] },
      { label: 'おもちゃ・アウトドア', keys: ['cat-toy'] },
      { label: 'バッグ・キャットタワー', keys: ['cat-tower','cat-goods','cat-carrier'] },
    ],
  },
  {
    label: '犬・猫・小動物共通',
    subgroups: [
      { label: 'トイレ用品', keys: ['pet-toilet'] },
    ],
  },
  {
    label: '鳥・小動物用品',
    subgroups: [
      { label: 'フード・食事', keys: ['bird-food','small-animal-food'] },
      { label: 'ケージ・用品', keys: ['bird-goods','small-animal-goods'] },
    ],
  },
  {
    label: '熱帯魚・アクアリウム用品',
    subgroups: [
      { label: 'エサ・用品', keys: ['fish-food','fish-tank','fish-goods'] },
    ],
  },
  {
    label: '爬虫類・両生類・昆虫',
    subgroups: [
      { label: '飼育用品', keys: ['reptile-food','reptile-goods','insect-goods'] },
    ],
  },
];

export const POPULAR_SEARCHES: Record<string, string[]> = {
  'dog-food':          ['ヒルズ','ロイヤルカナン','ニュートロ','アカナ','グランデリ','療法食','無添加','穀物不使用','小型犬','シニア','パピー','国産'],
  'dog-snack':         ['ジャーキー','デンタルガム','無添加','国産','ガム','骨'],
  'dog-walk':          ['小型犬','ハーネス','伸縮リード','首輪','マナーウェア'],
  'dog-care':          ['シャンプー','サプリ','デンタル','グルーミング','爪切り'],
  'dog-goods':         ['ケージ','ベッド','キャリー','給水器','犬小屋'],
  'dog-toy':           ['ロープ','ボール','ぬいぐるみ','デンタル','コング'],
  'dog-clothes':       ['レインコート','防寒','パーカー','小型犬','大型犬'],
  'cat-food':          ['ロイヤルカナン','ヒルズ','ニュートロ','モグニャン','療法食','無添加','穀物不使用','子猫','シニア','尿路ケア','インドア','毛玉ケア'],
  'cat-snack':         ['ちゅーる','INABA','無添加','パウチ','国産'],
  'cat-toilet':        ['鉱物系','木系','紙系','おから','シリカゲル','システムトイレ','消臭'],
  'cat-tower':         ['大型','スリム','突っ張り','据え置き','麻縄'],
  'cat-care':          ['シャンプー','グルーミング','デンタル','サプリ','爪切り'],
  'cat-goods':         ['ベッド','ドーム型','ハンモック','マット','クッション'],
  'cat-toy':           ['電動','ねこじゃらし','トンネル','ボール','レーザー'],
  'pet-sheets':        ['ワイド','スーパーワイド','厚型','レギュラー','業務用','消臭'],
  'bird-food':         ['皮むき','ペレット','オウム','セキセイ','文鳥','栄養'],
  'small-animal-food': ['ハムスター','うさぎ','チンチラ','モルモット','フェレット'],
  'fish-food':         ['メダカ','金魚','グッピー','熱帯魚','海水魚'],
  'fish-tank':         ['60cm','45cm','30cm','LED照明','外部フィルター','スリム'],
  'reptile-food':      ['コオロギ','ミルワーム','デュビア','ピンクマウス'],
  'insect-goods':      ['カブトムシ','クワガタ','マット','昆虫ゼリー','ケース'],
};

export const FOOD_FEATURE_TAGS = [
  { label: 'グレインフリー', keyword: 'グレインフリー' },
  { label: '穀物不使用',     keyword: '穀物不使用' },
  { label: '無添加',         keyword: '無添加' },
  { label: '国産',           keyword: '国産' },
  { label: 'シニア用',       keyword: 'シニア' },
  { label: 'パピー・子猫用', keyword: 'パピー' },
  { label: 'ダイエット',     keyword: 'ダイエット' },
  { label: '皮膚・被毛ケア', keyword: '皮膚' },
  { label: '尿路ケア',       keyword: '尿路' },
  { label: '療法食',         keyword: '療法食' },
  { label: '毛玉ケア',       keyword: '毛玉' },
  { label: '関節ケア',       keyword: '関節' },
  { label: 'オーガニック',   keyword: 'オーガニック' },
];

export const FOOD_CATEGORIES = ['dog-food','cat-food','dog-snack','cat-snack','bird-food','small-animal-food','fish-food','reptile-food'];
