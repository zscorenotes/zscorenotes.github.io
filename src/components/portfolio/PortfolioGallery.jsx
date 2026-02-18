'use client';

import React, { useMemo } from 'react';
import Lightbox from '@/components/shared/Lightbox';

export default function PortfolioGallery({ item, onClose }) {
  const images = useMemo(() => {
    if (!item || !item.image_urls || item.image_urls.length === 0) return [];
    return item.image_urls.map((url, index) => ({
      src: url,
      caption: `${item.title || ''} - Image ${index + 1}`,
    }));
  }, [item]);

  if (images.length === 0) return null;

  return <Lightbox images={images} startIndex={0} onClose={onClose} />;
}
