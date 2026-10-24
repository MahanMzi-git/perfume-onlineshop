import type { Audience } from '../types/product';
import { audienceLabels } from '../data/catalogLabels';

export function AudienceIcon({ audience, decorative = false }: { audience: Audience; decorative?: boolean }) {
  return <span className={`card-audience-icon card-audience-shoe card-audience-${audience}`} role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : audienceLabels[audience]} title={decorative ? undefined : audienceLabels[audience]} />;
}
