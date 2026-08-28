'use client';

import { useState } from 'react';
import styles from './ImageSlider.module.scss';

interface ImageItem {
  src: string;
  alt: string;
}

export default function ImageSlider({
  images,
  brand,
}: {
  images: ImageItem[];
  brand: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className={styles.stage}>
        <div className={styles.ph}>{brand}</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <img key={images[active].src} src={images[active].src} alt={images[active].alt} />
      </div>
      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              className={`${styles.thumb} ${i === active ? styles.active : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Imagen ${i + 1}`}
            >
              <img src={img.src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
