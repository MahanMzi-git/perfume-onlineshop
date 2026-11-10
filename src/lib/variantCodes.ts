export const variantCodeKey = (code: string) => code.normalize('NFKC').toLowerCase();

export function manualVariantCodeError(value: string | undefined, used: Iterable<string>) {
  const code = value?.trim();
  if (!code) return;
  if (Array.from(code).length < 6 || !/\p{L}/u.test(code) || !/\p{Nd}/u.test(code)) {
    return 'کد نسخه باید حداقل ۶ نویسه و شامل حرف و عدد باشد.';
  }
  for (const other of used) {
    if (variantCodeKey(other) === variantCodeKey(code)) return 'این کد نسخه قبلاً استفاده شده است.';
  }
}

export function automaticVariantCode(name: string, volume: number, concentration?: string) {
  const words = name.normalize('NFKD').toLowerCase().replace(/(?<=\p{Script=Latin})\p{M}+/gu, '').normalize('NFC').match(/\p{L}+/gu) ?? [];
  const first = (word: string, count: number) => Array.from(word).slice(0, count).join('');
  const prefix = words.length < 2 ? first(words[0] ?? 'sku', 3)
    : words.length === 2 ? first(words[0], 2) + first(words[1], 1)
    : words.slice(0, 3).map(word => first(word, 1)).join('');
  const type = concentration?.trim().toUpperCase();
  return prefix + String(volume).padStart(3, '0').slice(0, 2) + (type === 'EDP' ? 'P' : type === 'EDT' ? 'T' : 'X');
}

export function assignVariantCodes<T>(entries: T[], describe: (entry: T) => {
  name: string; volume: number; concentration?: string; manualCode?: string;
}) {
  const descriptions = entries.map(describe);
  const used = new Set(descriptions.flatMap(({ manualCode }) => manualCode ? [variantCodeKey(manualCode)] : []));
  return entries.map((entry, index) => {
    const { name, volume, concentration, manualCode } = descriptions[index];
    if (manualCode) return { entry, code: manualCode };
    const base = automaticVariantCode(name, volume, concentration);
    let code = base;
    for (let suffix = 2; used.has(variantCodeKey(code)); suffix++) code = base + '-' + suffix;
    used.add(variantCodeKey(code));
    return { entry, code };
  });
}
