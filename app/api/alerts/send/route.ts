import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// このAPIはVercel Cron（毎日3時）から呼ばれる
// vercel.json に cron 設定を追加すること
export async function GET(req: NextRequest) {
  // 認証チェック（Vercel Cronからのみ許可）
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 });
  }

  // アクティブなアラートと現在価格を取得
  const { data: alerts } = await supabaseAdmin
    .from('price_alerts')
    .select(`
      id, email, target_price, user_id,
      products(id, name, current_price, image_url)
    `)
    .eq('is_active', true)
    .is('notified_at', null);

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;

  for (const alert of alerts) {
    const product = alert.products as unknown as {
      id: string; name: string; current_price: number; image_url: string | null;
    };
    if (!product) continue;

    // 目標価格以下になったら送信
    if (product.current_price <= alert.target_price) {
      // メールアドレスを取得（未ログイン=alertのemail、ログイン済み=auth.usersから）
      let toEmail = alert.email;
      if (!toEmail && alert.user_id) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(alert.user_id);
        toEmail = userData?.user?.email ?? null;
      }
      if (!toEmail) continue;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ペットプライス <noreply@petprice.jp>',
          to: [toEmail],
          subject: `【ペットプライス】価格が下がりました！¥${product.current_price.toLocaleString()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #FF6600; color: white; padding: 16px 24px;">
                <h1 style="margin: 0; font-size: 20px;">🐾 ペットプライス</h1>
              </div>
              <div style="padding: 24px;">
                <h2 style="color: #CC0000; font-size: 18px;">🎉 価格が下がりました！</h2>
                <div style="background: #f5f5f5; border-left: 4px solid #CC0000; padding: 16px; margin: 16px 0;">
                  <p style="margin: 0 0 8px; font-size: 14px; color: #333; font-weight: bold;">${product.name}</p>
                  <p style="margin: 0 0 4px; font-size: 13px; color: #666;">目標価格: ¥${alert.target_price.toLocaleString()}</p>
                  <p style="margin: 0; font-size: 20px; color: #CC0000; font-weight: bold;">現在価格: ¥${product.current_price.toLocaleString()}</p>
                </div>
                <a href="https://petprice.jp/product/${product.id}"
                   style="display: inline-block; background: #FF6600; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px;">
                  今すぐ確認する →
                </a>
                <p style="color: #999; font-size: 12px; margin-top: 24px;">
                  価格アラートの解除は<a href="https://petprice.jp/mypage">マイページ</a>から行えます。
                </p>
              </div>
            </div>
          `,
        }),
      });

      if (res.ok) {
        // 通知済みフラグを立てる
        await supabaseAdmin
          .from('price_alerts')
          .update({ notified_at: new Date().toISOString() })
          .eq('id', alert.id);
        sent++;
      }
    }
  }

  return NextResponse.json({ sent, total: alerts.length });
}
