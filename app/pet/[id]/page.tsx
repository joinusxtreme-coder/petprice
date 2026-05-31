import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  gender: string | null;
  weight: number | null;
  profile_message: string | null;
  is_public: boolean;
  user_profiles: { username: string | null } | null;
}

interface HealthRecord {
  id: string;
  recorded_at: string;
  weight: number | null;
  notes: string | null;
}

function calcAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months}ヶ月`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}歳${rem}ヶ月` : `${years}歳`;
}

const SPECIES_ICONS: Record<string, string> = {
  '犬': '🐕', '猫': '🐈', '鳥': '🦜', '小動物': '🐹', '魚・水生': '🐠', '爬虫類': '🦎',
};

export default async function PetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: petRaw } = await supabase
    .from('pets')
    .select('id, name, species, breed, birth_date, gender, weight, profile_message, is_public, user_profiles(username)')
    .eq('id', id)
    .single();

  if (!petRaw || !(petRaw as unknown as Pet).is_public) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = petRaw as any;
  const p: Pet = {
    ...raw,
    user_profiles: Array.isArray(raw.user_profiles) ? (raw.user_profiles[0] ?? null) : raw.user_profiles,
  };

  // 健康記録（直近6件）
  const { data: records } = await supabase
    .from('pet_health_records')
    .select('id, recorded_at, weight, notes')
    .eq('pet_id', id)
    .order('recorded_at', { ascending: false })
    .limit(6);

  const healthRecords = (records || []) as HealthRecord[];

  const icon = SPECIES_ICONS[p.species] || '🐾';
  const age = p.birth_date ? calcAge(p.birth_date) : null;

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Meiryo, "Hiragino Kaku Gothic Pro", sans-serif' }}>
      <SiteHeader />

      <div className="bg-white border-b border-[#eee]">
        <div className="max-w-3xl mx-auto px-3 py-1 text-xs text-[#666]">
          <Link href="/" className="text-[#0058B3] hover:underline">ホーム</Link>
          <span className="mx-1">{'>'}</span>
          <span>ペットプロフィール</span>
          <span className="mx-1">{'>'}</span>
          <span>{p.name}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 py-4 space-y-3">
        {/* プロフィールカード */}
        <div className="bg-white border border-[#ddd]">
          <div className="bg-gradient-to-r from-[#FF6600] to-[#FF9933] px-4 py-3">
            <h1 className="text-white font-bold text-base flex items-center gap-2">
              <span className="text-3xl">{icon}</span>
              <span>{p.name}</span>
            </h1>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-[#f8f8f8] rounded px-3 py-2">
                <p className="text-xs text-[#999] mb-0.5">種類</p>
                <p className="text-sm font-bold text-[#333]">{p.species}{p.breed ? ` / ${p.breed}` : ''}</p>
              </div>
              {age && (
                <div className="bg-[#f8f8f8] rounded px-3 py-2">
                  <p className="text-xs text-[#999] mb-0.5">年齢</p>
                  <p className="text-sm font-bold text-[#333]">{age}</p>
                </div>
              )}
              {p.gender && (
                <div className="bg-[#f8f8f8] rounded px-3 py-2">
                  <p className="text-xs text-[#999] mb-0.5">性別</p>
                  <p className="text-sm font-bold text-[#333]">{p.gender}</p>
                </div>
              )}
              {p.weight && (
                <div className="bg-[#f8f8f8] rounded px-3 py-2">
                  <p className="text-xs text-[#999] mb-0.5">体重</p>
                  <p className="text-sm font-bold text-[#333]">{p.weight}kg</p>
                </div>
              )}
            </div>
            {p.profile_message && (
              <div className="bg-[#FFF5EE] border-l-4 border-[#FF6600] px-3 py-2 text-sm text-[#555] leading-relaxed">
                {p.profile_message}
              </div>
            )}
            {p.user_profiles?.username && (
              <p className="text-xs text-[#999] mt-3">飼い主: {p.user_profiles.username}</p>
            )}
          </div>
        </div>

        {/* 健康記録 */}
        {healthRecords.length > 0 && (
          <div className="bg-white border border-[#ddd]">
            <div className="px-3 py-2 border-b border-[#ddd] bg-[#f8f8f8]">
              <h2 className="text-sm font-bold text-[#333]">📊 健康記録</h2>
            </div>
            <div className="divide-y divide-[#f0f0f0]">
              {healthRecords.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-4 py-2">
                  <span className="text-xs text-[#999] w-24 shrink-0">
                    {new Date(r.recorded_at).toLocaleDateString('ja-JP')}
                  </span>
                  {r.weight && (
                    <span className="text-sm font-bold text-[#FF6600]">{r.weight}kg</span>
                  )}
                  {r.notes && (
                    <span className="text-xs text-[#555] truncate">{r.notes}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="text-xs text-[#0058B3] hover:underline">ペットプライスでペットフードを探す →</Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
