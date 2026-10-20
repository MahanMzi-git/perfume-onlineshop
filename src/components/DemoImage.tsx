import type { ImgHTMLAttributes } from 'react';

const fallback = '/images/placeholder.svg';

/** Use a neutral demo placeholder, never another product's artwork. */
export function DemoImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} onError={event => {
    if (event.currentTarget.getAttribute('src') !== fallback) {
      event.currentTarget.src = fallback;
    }
  }} />;
}
