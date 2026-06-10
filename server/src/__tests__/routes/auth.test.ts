import { describe, it, expect } from 'vitest';
import { passwordPolicy, registerSchema, loginSchema, resetPasswordSchema } from '../../routes/auth.js';

describe('passwordPolicy', () => {
  it('aceita senha que atende todos os critérios', () => {
    expect(passwordPolicy('Abc@1234')).toBe(true);
    expect(passwordPolicy('Secure#9Password!')).toBe(true);
  });

  it('rejeita senha menor que 8 chars', () => {
    expect(passwordPolicy('Ab@1')).toBe(false);
  });

  it('rejeita senha sem letra maiúscula', () => {
    expect(passwordPolicy('abc@1234')).toBe(false);
  });

  it('rejeita senha sem letra minúscula', () => {
    expect(passwordPolicy('ABC@1234')).toBe(false);
  });

  it('rejeita senha sem dígito', () => {
    expect(passwordPolicy('Abcdef@!')).toBe(false);
  });

  it('rejeita senha sem caractere especial', () => {
    expect(passwordPolicy('Abcdef12')).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    name: 'Nicholas Bittencourt',
    email: 'nicholas@example.com',
    password: 'Abc@1234',
    declaracaoMaioridade: true as const,
  };

  it('aceita payload válido', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejeita nome muito curto', () => {
    const r = registerSchema.safeParse({ ...valid, name: 'A' });
    expect(r.success).toBe(false);
  });

  it('rejeita email inválido', () => {
    const r = registerSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(r.success).toBe(false);
  });

  it('rejeita declaracaoMaioridade = false', () => {
    const r = registerSchema.safeParse({ ...valid, declaracaoMaioridade: false });
    expect(r.success).toBe(false);
  });

  it('rejeita declaracaoMaioridade ausente', () => {
    const { declaracaoMaioridade: _, ...rest } = valid;
    const r = registerSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it('normaliza email para minúsculas', () => {
    const r = registerSchema.safeParse({ ...valid, email: 'USER@EXAMPLE.COM' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe('user@example.com');
  });
});

describe('loginSchema', () => {
  it('aceita email e password válidos', () => {
    expect(loginSchema.safeParse({ email: 'u@example.com', password: 'any' }).success).toBe(true);
  });

  it('rejeita email inválido', () => {
    expect(loginSchema.safeParse({ email: 'bad', password: 'pw' }).success).toBe(false);
  });

  it('rejeita payload sem password', () => {
    expect(loginSchema.safeParse({ email: 'u@example.com' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  const validToken = '550e8400-e29b-41d4-a716-446655440000';

  it('aceita token UUID e senha >= 8', () => {
    expect(resetPasswordSchema.safeParse({ token: validToken, password: 'Abc@1234' }).success).toBe(true);
  });

  it('rejeita token que não é UUID', () => {
    expect(resetPasswordSchema.safeParse({ token: 'not-uuid', password: 'Abc@1234' }).success).toBe(false);
  });

  it('rejeita senha com menos de 8 chars', () => {
    expect(resetPasswordSchema.safeParse({ token: validToken, password: 'Ab@1' }).success).toBe(false);
  });
});
