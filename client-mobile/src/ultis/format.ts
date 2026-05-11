export const normalizeText = (value?: string | null) => {
  return String(value || '').trim().toUpperCase();
};

export const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};
