import { occasionLabels, seasonLabels } from '../data/catalogLabels';

export const usageLabels = {
  seasons: seasonLabels,
  occasions: { daily: occasionLabels.daily, work: occasionLabels.work, date: occasionLabels.date, formal: occasionLabels.formal },
  dayTimes: { morning: 'صبح', evening: 'عصر', night: 'شب' },
};
export type UsageKey = keyof typeof usageLabels;
export type UsageAttributes = Record<UsageKey, string[]>;

export const usageFields = [
  { key: 'seasons', label: 'فصل مناسب' },
  { key: 'occasions', label: 'موقعیت استفاده' },
  { key: 'dayTimes', label: 'زمان استفاده' },
].map(({ key, label }) => ({ key: key as UsageKey, label, type: 'choices' as const, options: Object.values(usageLabels[key as UsageKey]) }));

export function usageLabel(key: UsageKey, code: string) {
  return (usageLabels[key] as Record<string, string>)[code];
}

export function usageCodes(key: UsageKey, value: string) {
  const selected = splitUsage(value);
  return Object.entries(usageLabels[key]).filter(([, label]) => selected.includes(label)).map(([code]) => code);
}

export const splitUsage=(v:string)=>[...new Set(v.split('،').map(s=>s.trim()).filter(Boolean))];
