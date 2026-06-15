const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function isLocalDbHost(host: string): boolean {
  return LOCAL_HOSTS.has(host);
}
