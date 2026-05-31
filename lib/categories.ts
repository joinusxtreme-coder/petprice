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
