export function joinUrl(base: string, path: string) {
    if (!base) return path;
    if (!path) return base;
    const url = base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
    return url;
}
