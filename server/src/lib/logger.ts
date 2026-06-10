type Level = 'error' | 'warn' | 'info' | 'debug';

// R-DEF-001 / R-CLA-005: logs auditáveis sem expor dado pessoal direto
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at < 1) return '***';
  return email[0] + '***' + email.slice(at);
}

export function maskName(name: string): string {
  return name
    .split(' ')
    .map((w) => (w[0] ?? '') + '***')
    .join(' ');
}

export function maskIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) return parts.slice(0, 3).join('.') + '.xxx';
  const i = ip.lastIndexOf(':');
  return i >= 0 ? ip.slice(0, i + 1) + 'xxxx' : '***';
}

function log(level: Level, msg: string, meta?: Record<string, unknown>): void {
  const entry = { ts: new Date().toISOString(), level, msg, ...meta };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log('warn',  msg, meta),
  info:  (msg: string, meta?: Record<string, unknown>) => log('info',  msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
};
