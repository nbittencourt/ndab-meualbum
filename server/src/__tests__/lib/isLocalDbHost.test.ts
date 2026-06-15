import { describe, it, expect } from 'vitest';
import { isLocalDbHost } from '../../lib/isLocalDbHost.js';

describe('isLocalDbHost', () => {
  it.each(['localhost', '127.0.0.1', '::1'])(
    'retorna true para host local "%s"',
    (host) => expect(isLocalDbHost(host)).toBe(true),
  );

  it('retorna false para host Firestore', () => {
    expect(isLocalDbHost('firestore.googleapis.com')).toBe(false);
  });

  it('retorna false para host MongoDB Atlas', () => {
    expect(isLocalDbHost('cluster0.abcde.mongodb.net')).toBe(false);
  });

  it('retorna false para qualquer outro host remoto', () => {
    expect(isLocalDbHost('db.example.com')).toBe(false);
  });

  it('retorna false para string vazia', () => {
    expect(isLocalDbHost('')).toBe(false);
  });
});
