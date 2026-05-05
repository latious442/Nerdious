export const TAG_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'romance', label: 'Romance' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'biography', label: 'Biography' },
  { value: 'self-help', label: 'Self-help' },
  { value: 'history', label: 'History' },
  { value: 'tech', label: 'Tech' },
];

export const TAG_FORM_OPTIONS = TAG_FILTER_OPTIONS.filter((o) => o.value !== 'all');

export function tagLabel(value) {
  const opt = TAG_FILTER_OPTIONS.find((o) => o.value === value);
  return opt ? opt.label : value || '—';
}
