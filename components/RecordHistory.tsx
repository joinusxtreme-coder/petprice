'use client';

import { useEffect } from 'react';
import { recordHistory } from '@/lib/browsingHistory';

interface Props {
  id: string;
  name: string;
  image_url: string | null;
  current_price: number;
  category: string;
}

export default function RecordHistory({ id, name, image_url, current_price, category }: Props) {
  useEffect(() => {
    recordHistory({ id, name, image_url, current_price, category });
  }, [id, name, image_url, current_price, category]);

  return null;
}
