const localBrandLogos: Record<string, string> = {
  'study-dior': 'dior.jpg',
  'study-creed': 'creed.jpg',
  'study-gucci': 'gucci.png',
  'study-chanel': 'chanel.jpg',
  'study-ysl': 'ysl-monogram.jpeg',
  'study-chloe': 'chloe.svg',
};

const officialBrands: Record<string, { domain: string; logo?: string }> = {
  'study-chanel': { domain: 'www.chanel.com' },
  'study-dior': { domain: 'www.dior.com' },
  'study-creed': { domain: 'creedboutique.com', logo: 'https://creedboutique.com/cdn/shop/files/creed-favicon.png?height=32&width=32' },
  'study-ysl': { domain: 'www.ysl.com' },
  'study-gucci': { domain: 'www.gucci.com' },
  'study-chloe': { domain: 'www.chloe.com' },
};

export function officialBrandLogo(id: string) {
  const brand = officialBrands[id];
  const localLogo = localBrandLogos[id];
  return brand && {
    domain: brand.domain,
    logo: localLogo ? import.meta.env.BASE_URL + "images/brands/" + localLogo : brand.logo ?? siteIcon(brand.domain),
  };
}

export function siteIcon(domain: string) {
  return new URL('/favicon.ico', 'https://' + domain).href;
}

export function officialDomain(value: string) {
  const site = new URL(value.includes('://') ? value : 'https://' + value);
  if (site.protocol !== 'https:' || site.username || site.password || site.port ||
      !/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(site.hostname)) throw new Error('Invalid domain');
  return site.hostname;
}

export const brandLookupEndpoint = import.meta.env.VITE_BRAND_LOGO_ENDPOINT as string | undefined;

// GET endpoint?name=<brand> → { domain: string, logo: string }. Results require seller approval.
export async function lookupBrandLogo(name: string, signal: AbortSignal) {
  const endpoint = new URL(brandLookupEndpoint!, location.origin);
  endpoint.searchParams.set('name', name);
  const response = await fetch(endpoint, { signal });
  if (!response.ok) throw new Error('Brand lookup failed');
  const result = await response.json();
  const domain = officialDomain(result.domain);
  const logo = new URL(result.logo);
  if (logo.protocol !== 'https:' || logo.username || logo.password) throw new Error('Invalid logo URL');
  return { domain, logo: logo.href };
}
