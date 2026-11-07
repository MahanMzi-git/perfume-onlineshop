const noteImageNames: Record<string, string> = {
  seasalt: 'sea-salt',
  pepper: 'black-pepper',
};

export function noteImageUrl(slug: string) {
  return `${import.meta.env.BASE_URL}images/notes/${noteImageNames[slug] ?? slug}.webp`;
}

export function familyImageUrl(slug: string) {
  return `${import.meta.env.BASE_URL}images/families/${slug}.webp`;
}
