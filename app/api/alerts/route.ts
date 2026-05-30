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

  return NextResponse.json({ success: true });
}
