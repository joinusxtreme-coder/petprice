'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  weight_kg: number | null;
  gender: string | null;
  notes: string | null;
}

const SPECIES = ['犬', '猫', '小動物', '鳥', '魚・水生', '爬虫類', 'その他'];

export default function PetsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    species: '犬',
    breed: '',
    birth_date: '',
    weight_kg: '',
    gender: '',
    notes: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchPets();
  }, [user]);

  async function fetchPets() {
    const { data } = await supabaseBrowser
      .from('pets')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true });
    setPets(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabaseBrowser.from('pets').insert({
      user_id: user!.id,
      name: form.name,
      species: form.species,
      breed: form.breed || null,
      birth_date: form.birth_date || null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      gender: form.gender || null,
      notes: form.notes || null,
    });
    setForm({ name: '', species: '犬', breed: '', birth_date: '', weight_kg: '', gender: '', notes: '' });
    setShowForm(false);
    await fetchPets();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('このペットを削除しますか？')) return;
    await supabaseBrowser.from('pets').delete().eq('id', id);
    setPets((prev) => prev.filter((p) => p.id !== id));
  }

  // 年齢計算
  function calcAge(birthDate: string | null): string {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months}ヶ月`;
    return `${Math.floor(months / 12)}歳${months % 12 > 0 ? `${months % 12}ヶ月` : ''}`;
  }

  const speciesEmoji: Record<string, string> = {
    '犬': '🐕', '猫': '🐈', '小動物': '🐹', '鳥': '🐦', '魚・水生': '🐠', '爬虫類': '🦎', 'その他': '🐾'
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <div className="bg-[#FF6600] h-1" />
      <header className="bg-white border-b border-[#ddd]">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-4">
          <Link href="/" className="shrink-0 flex items-center gap-1">
            <span className="text-[#FF6600] font-bold text-xl leading-none">ペットプライス</span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-3 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link href="/mypage" className="text-xs text-[#0058B3] hover:underline">← マイページ</Link>
            <h1 className="text-lg font-bold text-[#333] mt-1">🐾 うちの子一覧</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#FF6600] text-white px-4 py-2 text-sm font-bold hover:bg-[#e55a00]"
          >
            + ペットを登録
          </button>
        </div>

        {/* 登録フォーム */}
        {showForm && (
          <div className="bg-white border border-[#ddd] p-4 mb-4">
            <h2 className="text-sm font-bold text-[#333] mb-3">新しいペットを登録</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#666] mb-1">名前 <span className="text-red-500">*</span></label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-[#ccc] px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
                    placeholder="ポチ"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">種類 <span className="text-red-500">*</span></label>
                  <select
                    value={form.species}
                    onChange={(e) => setForm({ ...form, species: e.target.value })}
                    className="w-full border border-[#ccc] px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
                  >
                    {SPECIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#666] mb-1">品種・種別</label>
                  <input
                    value={form.breed}
                    onChange={(e) => setForm({ ...form, breed: e.target.value })}
                    className="w-full border border-[#ccc] px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
                    placeholder="トイプードル"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">性別</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full border border-[#ccc] px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
                  >
                    <option value="">未設定</option>
                    <option value="オス">オス</option>
                    <option value="メス">メス</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#666] mb-1">誕生日</label>
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                    className="w-full border border-[#ccc] px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#666] mb-1">体重 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                    className="w-full border border-[#ccc] px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
                    placeholder="3.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#666] mb-1">メモ（アレルギー・好み等）</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-[#ccc] px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF6600]"
                  placeholder="チキンアレルギーあり、グレインフリー希望"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-[#ddd] px-4 py-2 text-sm text-[#666] hover:bg-[#f5f5f5]"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#FF6600] text-white px-4 py-2 text-sm font-bold hover:bg-[#e55a00] disabled:opacity-50"
                >
                  {saving ? '保存中...' : '登録する'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ペット一覧 */}
        {pets.length === 0 ? (
          <div className="bg-white border border-[#ddd] p-8 text-center">
            <div className="text-4xl mb-3">🐾</div>
            <p className="text-sm text-[#666]">まだペットが登録されていません</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-[#0058B3] text-sm hover:underline"
            >
              + 最初のペットを登録する
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-white border border-[#ddd] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{speciesEmoji[pet.species] || '🐾'}</span>
                      <span className="font-bold text-[#333] text-base">{pet.name}</span>
                      {pet.gender && <span className="text-xs text-[#999] border border-[#eee] px-1.5 py-0.5">{pet.gender}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#666]">
                      <span>{pet.species}{pet.breed && ` / ${pet.breed}`}</span>
                      {pet.birth_date && <span>🎂 {calcAge(pet.birth_date)}</span>}
                      {pet.weight_kg && <span>⚖️ {pet.weight_kg}kg</span>}
                    </div>
                    {pet.notes && (
                      <p className="text-xs text-[#888] mt-2 bg-[#f8f8f8] px-2 py-1">{pet.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="text-xs text-red-400 hover:text-red-600 hover:underline shrink-0"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
