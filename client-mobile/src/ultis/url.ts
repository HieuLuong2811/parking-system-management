export function joinUrl(base?: string, path?: string) {
  if (!base) return path ?? '';
  if (!path) return base;
  return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}
