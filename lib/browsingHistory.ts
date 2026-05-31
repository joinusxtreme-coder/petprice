export interface HistoryItem {
  id: string;
  name: string;
  image_url: string | null;
  current_price: number;
  category: string;
  visited_at: string; // ISO string
}

const KEY = 'petprice_history';
const MAX = 30;

export function recordHistory(item: Omit<HistoryItem, 'visited_at'>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getHistory();
    // 重複を除去して先頭に追加
    const filtered = existing.filter((h) => h.id !== item.id);
    const next: HistoryItem[] = [
      { ...item, visited_at: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (_) {}
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch (_) {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
