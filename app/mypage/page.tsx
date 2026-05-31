'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';
import SiteHeader from '@/components/SiteHeader';
import RecentlyViewed from '@/components/RecentlyViewed';

type Tab = 'profile' | 'pets' | 'favorites' | 'alerts' | 'reviews' | 'history';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age_years: number | null;
  weight_kg: number | null;
}

interface WeightLog {
  id: string;
  pet_id: string;
  weight_kg: number;
  recorded_at: string;
  notes: string | null;
}

interface FavoriteItem {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    image_url: string | null;
    current_price: number;
  } | null;
}

interface AlertItem {
  id: string;
  target_price: number;
  is_active: boolean;
  products: { name: string } | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
  products: { name: string; id: string } | null;
}

const SPECIES_OPTIONS = ['犬', '猫', '鳥', '小動物', '魚', '爬虫類', '昆虫'];

export default function MyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('profile');

  // Profile
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Pets
  const [pets, setPets] = useState<Pet[]>([]);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('犬');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petAdding, setPetAdding] = useState(false);

  // Weight logs
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [newWeight, setNewWeight] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightNotes, setWeightNotes] = useState('');
  const [weightSaving, setWeightSaving] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favPage, setFavPage] = useState(0);
  const FAV_PER_PAGE = 10;

  // Alerts
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Reviews
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPets();
      loadFavorites();
      loadAlerts();
      loadReviews();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadProfile() {
    if (!user) return;
    const { data } = await supabaseBrowser
      .from('user_profiles')
      .select('username, bio')
      .eq('id', user.id)
      .single();
    if (data) {
      setUsername(data.username || '');
      setBio(data.bio || '');
    }
  }

  async function saveProfile() {
    if (!user) return;
    setProfileSaving(true);
    const { error } = await supabaseBrowser
      .from('user_profiles')
      .upsert({ id: user.id, username, bio });
    setProfileMsg(error ? 'エラーが発生しました' : '保存しました');
    setProfileSaving(false);
    setTimeout(() => setProfileMsg(''), 3000);
  }

  async function loadPets() {
    if (!user) return;
    const { data } = await supabaseBrowser
      .from('pets')
      .select('id, name, species, breed, age_years, weight_kg')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setPets(data || []);
  }

  async function addPet(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPetAdding(true);
    await supabaseBrowser.from('pets').insert({
      user_id: user.id,
      name: petName,
      species: petSpecies,
      breed: petBreed || null,
      age_years: petAge ? parseInt(petAge) : null,
      weight_kg: petWeight ? parseFloat(petWeight) : null,
    });
    setPetName('');
    setPetBreed('');
    setPetAge('');
    setPetWeight('');
    await loadPets();
    setPetAdding(false);
  }

  async function deletePet(id: string) {
    await supabaseBrowser.from('pets').delete().eq('id', id);
    setPets((prev) => prev.filter((p) => p.id !== id));
  }

  async function loadWeightLogs(petId: string) {
    const { data } = await supabaseBrowser
      .from('pet_weight_logs')
      .select('id, pet_id, weight_kg, recorded_at, notes')
      .eq('pet_id', petId)
      .order('recorded_at', { ascending: false })
      .limit(10);
    setWeightLogs(data || []);
  }

  async function addWeightLog(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPetId || !newWeight) return;
    setWeightSaving(true);
    await supabaseBrowser.from('pet_weight_logs').insert({
      pet_id: selectedPetId,
      weight_kg: parseFloat(newWeight),
      recorded_at: weightDate,
      notes: weightNotes || null,
    });
    setNewWeight('');
    setWeightNotes('');
    await loadWeightLogs(selectedPetId);
    setWeightSaving(false);
  }

  async function loadFavorites() {
    if (!user) return;
    const { data } = await supabaseBrowser
      .from('favorites')
      .select('id, product_id, products(id, name, image_url, current_price)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setFavorites((data || []) as unknown as FavoriteItem[]);
  }

  async function removeFavorite(id: string) {
    await supabaseBrowser.from('favorites').delete().eq('id', id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  async function loadAlerts() {
    if (!user) return;
    const { data } = await supabaseBrowser
      .from('price_alerts')
      .select('id, target_price, is_active, products(name)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    setAlerts((data || []) as unknown as AlertItem[]);
  }

  async function deleteAlert(id: string) {
    await supabaseBrowser.from('price_alerts').delete().eq('id', id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  async function loadReviews() {
    if (!user) return;
    const { data } = await supabaseBrowser
      .from('user_reviews')
      .select('id, rating, title, body, created_at, products(id, name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setReviews((data || []) as unknown as ReviewItem[]);
  }

  async function deleteReview(id: string) {
    await supabaseBrowser.from('user_reviews').delete().eq('id', id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return null;
  if (!user) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'プロフィール' },
    { key: 'pets', label: '愛ペット登録' },
    { key: 'favorites', label: 'お気に入り' },
    { key: 'alerts', label: '価格アラート' },
    { key: 'reviews', label: 'マイレビュー' },
    { key: 'history', label: '閲覧履歴' },
  ];

  const pagedFavs = favorites.slice(favPage * FAV_PER_PAGE, (favPage + 1) * FAV_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-3 py-4">
        <div className="bg-white border border-[#ddd] mb-3">
          <div className="bg-[#FF6600] text-white px-4 py-2 font-bold text-sm">マイページ</div>
          <div className="flex border-b border-[#ddd] overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-xs font-bold border-r border-[#ddd] whitespace-nowrap ${
                  tab === t.key ? 'bg-[#FFF5EE] text-[#FF6600] border-b-2 border-b-[#FF6600]' : 'text-[#333] hover:bg-[#f8f8f8]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'profile' && (
          <div className="bg-white border border-[#ddd] p-4">
            <h2 className="text-sm font-bold text-[#333] mb-4">プロフィール編集</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1">ユーザー名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#333] mb-1">自己紹介</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveProfile}
                  disabled={profileSaving}
                  className="bg-[#FF6600] text-white px-4 py-2 text-xs font-bold hover:bg-[#e55a00] disabled:opacity-50"
                >
                  {profileSaving ? '保存中...' : '保存する'}
                </button>
                {profileMsg && <span className="text-xs text-green-600">{profileMsg}</span>}
              </div>
            </div>
          </div>
        )}

        {tab === 'pets' && (
          <div className="bg-white border border-[#ddd] p-4">
            <h2 className="text-sm font-bold text-[#333] mb-4">愛ペット登録</h2>
            {pets.length > 0 && (
              <div className="mb-4 space-y-2">
                {pets.map((pet) => (
                  <div key={pet.id} className="flex items-center justify-between border border-[#eee] px-3 py-2">
                    <div className="text-xs">
                      <span className="font-bold text-[#333]">{pet.name}</span>
                      <span className="text-[#666] ml-2">{pet.species}</span>
                      {pet.breed && <span className="text-[#999] ml-1">({pet.breed})</span>}
                      {pet.age_years != null && <span className="text-[#999] ml-2">{pet.age_years}歳</span>}
                      {pet.weight_kg != null && <span className="text-[#999] ml-2">{pet.weight_kg}kg</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/pet/${pet.id}`} className="text-xs text-[#0058B3] hover:underline">公開ページ</Link>
                      <button onClick={() => deletePet(pet.id)} className="text-xs text-red-500 hover:underline">削除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={addPet} className="space-y-3 max-w-md">
              <h3 className="text-xs font-bold text-[#666]">ペットを追加</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#666] mb-1">名前 <span className="text-red-500">*</span></label>
                  <input required value={petName} onChange={(e) => setPetName(e.target.value)} className="w-full border border-[#ccc] px-2 py-1.5 text-xs focus:outline-none focus:border-[#FF6600]" />
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">種類 <span className="text-red-500">*</span></label>
                  <select value={petSpecies} onChange={(e) => setPetSpecies(e.target.value)} className="w-full border border-[#ccc] px-2 py-1.5 text-xs focus:outline-none">
                    {SPECIES_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">品種</label>
                  <input value={petBreed} onChange={(e) => setPetBreed(e.target.value)} className="w-full border border-[#ccc] px-2 py-1.5 text-xs focus:outline-none focus:border-[#FF6600]" />
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">年齢</label>
                  <input type="number" min={0} value={petAge} onChange={(e) => setPetAge(e.target.value)} className="w-full border border-[#ccc] px-2 py-1.5 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">体重(kg)</label>
                  <input type="number" step="0.1" min={0} value={petWeight} onChange={(e) => setPetWeight(e.target.value)} className="w-full border border-[#ccc] px-2 py-1.5 text-xs focus:outline-none" />
                </div>
              </div>
              <button type="submit" disabled={petAdding} className="bg-[#FF6600] text-white px-4 py-2 text-xs font-bold hover:bg-[#e55a00] disabled:opacity-50">
                {petAdding ? '追加中...' : 'ペットを追加する'}
              </button>
            </form>

            {/* 体重記録 */}
            {pets.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#eee]">
                <h3 className="text-xs font-bold text-[#333] mb-3">⚖️ 体重記録</h3>
                <div className="mb-3">
                  <label className="text-xs text-[#666] block mb-1">ペットを選択</label>
                  <select
                    value={selectedPetId}
                    onChange={(e) => { setSelectedPetId(e.target.value); if (e.target.value) loadWeightLogs(e.target.value); }}
                    className="border border-[#ccc] px-2 py-1.5 text-xs focus:outline-none w-full max-w-xs"
                  >
                    <option value="">選択してください</option>
                    {pets.map((p) => <option key={p.id} value={p.id}>{p.name}（{p.species}）</option>)}
                  </select>
                </div>
                {selectedPetId && (
                  <>
                    <form onSubmit={addWeightLog} className="flex gap-2 items-end flex-wrap mb-3">
                      <div>
                        <label className="text-xs text-[#666] block mb-1">体重(kg)</label>
                        <input type="number" step="0.1" min="0" required value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="border border-[#ccc] px-2 py-1.5 text-xs w-24 focus:outline-none focus:border-[#FF6600]" placeholder="3.5" />
                      </div>
                      <div>
                        <label className="text-xs text-[#666] block mb-1">日付</label>
                        <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} className="border border-[#ccc] px-2 py-1.5 text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-[#666] block mb-1">メモ</label>
                        <input value={weightNotes} onChange={(e) => setWeightNotes(e.target.value)} className="border border-[#ccc] px-2 py-1.5 text-xs w-32 focus:outline-none" placeholder="健康診断後など" />
                      </div>
                      <button type="submit" disabled={weightSaving} className="bg-[#0058B3] text-white px-3 py-1.5 text-xs font-bold hover:bg-[#004494] disabled:opacity-50">
                        {weightSaving ? '記録中...' : '記録する'}
                      </button>
                    </form>
                    {weightLogs.length > 0 && (
                      <div className="border border-[#eee] text-xs">
                        <div className="bg-[#f5f5f5] px-3 py-1.5 font-bold text-[#555] flex gap-4">
                          <span className="w-24">日付</span>
                          <span className="w-16">体重</span>
                          <span>メモ</span>
                        </div>
                        {weightLogs.map((log, i) => {
                          const prevLog = weightLogs[i + 1];
                          const diff = prevLog ? log.weight_kg - prevLog.weight_kg : null;
                          return (
                            <div key={log.id} className="flex gap-4 px-3 py-2 border-t border-[#eee] items-center">
                              <span className="w-24 text-[#666]">{log.recorded_at}</span>
                              <span className="w-16 font-bold text-[#333]">{log.weight_kg}kg
                                {diff !== null && (
                                  <span className={`ml-1 text-xs ${diff > 0 ? 'text-[#CC0000]' : diff < 0 ? 'text-green-600' : 'text-[#999]'}`}>
                                    {diff > 0 ? `▲${diff.toFixed(1)}` : diff < 0 ? `▼${Math.abs(diff).toFixed(1)}` : '→'}
                                  </span>
                                )}
                              </span>
                              <span className="text-[#999] flex-1">{log.notes || ''}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {weightLogs.length === 0 && <p className="text-xs text-[#999]">まだ体重記録がありません</p>}
                  </>
                )}
                <p className="text-xs text-[#999] mt-2">※ 体重記録機能はSupabaseに <code>pet_weight_logs</code> テーブルが必要です。</p>
              </div>
            )}
          </div>
        )}

        {tab === 'favorites' && (
          <div className="bg-white border border-[#ddd] p-4">
            <h2 className="text-sm font-bold text-[#333] mb-4">お気に入り商品 ({favorites.length}件)</h2>
            {favorites.length === 0 ? (
              <p className="text-xs text-[#999]">お気に入り商品がありません</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {pagedFavs.map((fav) => (
                    <div key={fav.id} className="flex items-center gap-3 border border-[#eee] p-2">
                      {fav.products?.image_url && (
                        <div className="w-12 h-12 relative shrink-0">
                          <Image src={fav.products.image_url} alt={fav.products.name || ''} fill className="object-contain" sizes="48px" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${fav.product_id}`} className="text-xs text-[#0058B3] hover:underline line-clamp-2">
                          {fav.products?.name}
                        </Link>
                        {fav.products?.current_price && (
                          <p className="text-xs text-[#FF6600] font-bold">¥{fav.products.current_price.toLocaleString()}</p>
                        )}
                      </div>
                      <button onClick={() => removeFavorite(fav.id)} className="text-xs text-red-500 hover:underline shrink-0">削除</button>
                    </div>
                  ))}
                </div>
                {favorites.length > FAV_PER_PAGE && (
                  <div className="flex gap-2">
                    <button disabled={favPage === 0} onClick={() => setFavPage(p => p - 1)} className="text-xs border border-[#ccc] px-3 py-1 disabled:opacity-50">前へ</button>
                    <span className="text-xs py-1">{favPage + 1} / {Math.ceil(favorites.length / FAV_PER_PAGE)}</span>
                    <button disabled={(favPage + 1) * FAV_PER_PAGE >= favorites.length} onClick={() => setFavPage(p => p + 1)} className="text-xs border border-[#ccc] px-3 py-1 disabled:opacity-50">次へ</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'alerts' && (
          <div className="bg-white border border-[#ddd] p-4">
            <h2 className="text-sm font-bold text-[#333] mb-4">価格アラート一覧</h2>
            {alerts.length === 0 ? (
              <p className="text-xs text-[#999]">設定中のアラートはありません</p>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between border border-[#eee] px-3 py-2">
                    <div className="text-xs">
                      <p className="text-[#333] line-clamp-1">{a.products?.name || '商品名不明'}</p>
                      <p className="text-[#FF6600] font-bold">目標価格: ¥{a.target_price.toLocaleString()}</p>
                    </div>
                    <button onClick={() => deleteAlert(a.id)} className="text-xs text-red-500 hover:underline">削除</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="bg-white border border-[#ddd] p-4">
            <h2 className="text-sm font-bold text-[#333] mb-4">マイレビュー ({reviews.length}件)</h2>
            {reviews.length === 0 ? (
              <p className="text-xs text-[#999]">まだレビューを投稿していません</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="border border-[#eee] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Link href={`/product/${r.products?.id}`} className="text-xs text-[#0058B3] hover:underline line-clamp-1">
                          {r.products?.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                          {r.title && <span className="text-xs font-bold text-[#333]">{r.title}</span>}
                        </div>
                        <p className="text-xs text-[#555] mt-1 line-clamp-2">{r.body}</p>
                        <p className="text-xs text-[#999] mt-1">{new Date(r.created_at).toLocaleDateString('ja-JP')}</p>
                      </div>
                      <button onClick={() => deleteReview(r.id)} className="text-xs text-red-500 hover:underline shrink-0">削除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-white border border-[#ddd] p-4">
            <h2 className="text-sm font-bold text-[#333] mb-4">閲覧履歴</h2>
            <RecentlyViewed />
          </div>
        )}
      </div>
    </div>
  );
}
