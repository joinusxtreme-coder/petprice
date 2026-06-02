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

  // メールが未設定のアラートのuser_idを一括収集してauth.usersからメールを取得（N+1回避）
  const missingEmailUserIds = [
    ...new Set(
      alerts
        .filter((a) => !a.email && a.user_id)
        .map((a) => a.user_id as string)
    ),
  ];
  const userEmailMap: Record<string, string> = {};
  for (const uid of missingEmailUserIds) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(uid);
    if (userData?.user?.email) {
      userEmailMap[uid] = userData.user.email;
    }
  }

  let sent = 0;

  for (const alert of alerts) {
    const product = alert.products as unknown as {
      id: string; name: string; current_price: number; image_url: string | null;
    };
    if (!product) continue;

    // 目標価格以下になったら送信
    if (product.current_price <= alert.target_price) {
      // メールアドレスを取得（未ログイン=alertのemail、ログイン済み=事前取得済みマップから）
      const toEmail = alert.email || (alert.user_id ? userEmailMap[alert.user_id] ?? null : null);
      if (!toEmail) continue;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'ペットプライス <noreply@petprices.jp>',
          to: [toEmail],
          subject: `【ペットプライス】価格が下がりました！¥${product.current_price.toLocaleString()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
              <div style="background: #FF6600; color: white; padding: 16px 24px;">
                <h1 style="margin: 0; font-size: 20px;">🐾 ペットプライス</h1>
                <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.8;">ペット用品 価格比較・通販</p>
              </div>
              <div style="padding: 24px;">
                <h2 style="color: #CC0000; font-size: 18px; margin: 0 0 16px;">🎉 価格が下がりました！</h2>
                <div style="background: #fff8f0; border: 1px solid #FF6600; border-left: 4px solid #CC0000; padding: 16px; margin: 0 0 20px; border-radius: 2px;">
                  <p style="margin: 0 0 10px; font-size: 14px; color: #333; font-weight: bold; line-height: 1.5;">${product.name}</p>
                  <table style="width: 100%; font-size: 13px;">
                    <tr>
                      <td style="color: #666; padding: 3px 0;">目標価格</td>
                      <td style="color: #666; text-align: right;">¥${alert.target_price.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="color: #CC0000; font-weight: bold; padding: 3px 0; font-size: 16px;">現在価格</td>
                      <td style="color: #CC0000; font-weight: bold; text-align: right; font-size: 18px;">¥${product.current_price.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="color: #009900; font-size: 12px; padding: 3px 0;">目標より</td>
                      <td style="color: #009900; font-size: 12px; text-align: right;">▼ ¥${(alert.target_price - product.current_price).toLocaleString()} お得！</td>
                    </tr>
                  </table>
                </div>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://petprices.jp'}/product/${product.id}"
                   style="display: inline-block; background: #FF6600; color: white; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 15px; border-radius: 2px;">
                  今すぐ確認する →
                </a>
                <p style="color: #999; font-size: 11px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
                  このアラートは自動的に解除されました。再設定は<a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://petprices.jp'}/product/${product.id}" style="color: #0058B3;">商品ページ</a>から行えます。<br>
                  マイページでアラート管理: <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://petprices.jp'}/mypage" style="color: #0058B3;">マイページへ</a>
                </p>
              </div>
            </div>
          `,
        }),
      });

      if (res.ok) {
        // 通知済み → アラートを非アクティブ化（再設定で再利用可能）
        await supabaseAdmin
          .from('price_alerts')
          .update({ is_active: false, notified_at: new Date().toISOString() })
          .eq('id', alert.id);
        sent++;
      }
    }
  }

  return NextResponse.json({ sent, total: alerts.length });
}
