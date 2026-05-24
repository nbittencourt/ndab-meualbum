import { describe, it, expect } from 'vitest';
import { maskEmail, maskName, maskIp } from '../../lib/logger.js';

describe('maskEmail', () => {
  it('mascara email válido preservando primeiro char e domínio', () => {
    expect(maskEmail('nicholas@gmail.com')).toBe('n***@gmail.com');
  });

  it('mascara email com local de 1 char', () => {
    expect(maskEmail('a@example.com')).toBe('a***@example.com');
  });

  it('retorna *** se não houver @', () => {
    expect(maskEmail('invalido')).toBe('***');
  });

  it('retorna *** se @ for o primeiro char', () => {
    expect(maskEmail('@domain.com')).toBe('***');
  });

  it('mascara subdomínios mantendo domínio completo', () => {
    expect(maskEmail('user@sub.example.com')).toBe('u***@sub.example.com');
  });
});

describe('maskName', () => {
  it('mascara nome simples', () => {
    expect(maskName('Nicholas')).toBe('N***');
  });

  it('mascara nome composto', () => {
    expect(maskName('Nicholas Bittencourt')).toBe('N*** B***');
  });

  it('mascara nome com três partes', () => {
    expect(maskName('Ana Maria Silva')).toBe('A*** M*** S***');
  });

  it('retorna *** para string vazia ou sem letras', () => {
    expect(maskName('')).toBe('***');
  });
});

describe('maskIp', () => {
  it('mascara último octeto de IPv4', () => {
    expect(maskIp('192.168.1.42')).toBe('192.168.1.xxx');
  });

  it('mascara IPv4 com todos os octetos', () => {
    expect(maskIp('10.0.0.1')).toBe('10.0.0.xxx');
  });

  it('mascara segmento final de IPv6', () => {
    expect(maskIp('2001:db8:85a3::8a2e:370:7334')).toBe('2001:db8:85a3::8a2e:370:xxxx');
  });

  it('retorna *** para string sem formato reconhecível', () => {
    expect(maskIp('unknown')).toBe('***');
  });
});
