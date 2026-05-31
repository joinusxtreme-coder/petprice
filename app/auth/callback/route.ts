import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // プロフィールが無ければ作成
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        const username = data.user.user_metadata?.full_name ||
          data.user.email?.split('@')[0] || 'ユーザー';
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          username,
        });
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
