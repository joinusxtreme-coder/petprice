import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { productId, email, targetPrice } = await req.json();

  if (!productId || !email || !targetPrice) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('price_alerts').insert({
    product_id: productId,
    email,
    target_price: Number(targetPrice),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 登録確認メール送信（Resend）
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (RESEND_API_KEY) {
    // 商品情報を取得
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('name, current_price')
      .eq('id', productId)
      .single();

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'ペットプライス <noreply@petprices.jp>',
        to: [email],
        subject: '【ペットプライス】価格アラートを設定しました',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #FF6600; color: white; padding: 16px 24px;">
              <h1 style="margin: 0; font-size: 20px;">🐾 ペットプライス</h1>
            </div>
            <div style="padding: 24px;">
              <h2 style="color: #333; font-size: 16px;">価格アラートを設定しました</h2>
              <p style="color: #555; font-size: 14px;">以下の商品が目標価格を下回ったらメールでお知らせします。</p>
              <div style="background: #f5f5f5; border-left: 4px solid #FF6600; padding: 16px; margin: 16px 0;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #333;">${product?.name || '商品'}</p>
                <p style="margin: 0 0 4px; font-size: 13px; color: #666;">現在価格: ¥${(product?.current_price || 0).toLocaleString()}</p>
                <p style="margin: 0; font-size: 13px; color: #CC0000; font-weight: bold;">目標価格: ¥${Number(targetPrice).toLocaleString()}</p>
              </div>
              <p style="color: #999; font-size: 12px;">このメールはペットプライスの価格アラート登録時に送信されます。</p>
            </div>
          </div>
        `,
      }),
    });
  }

  return NextResponse.json({ success: true });
}
