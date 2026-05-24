import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSend = vi.fn().mockResolvedValue({ id: 'test-id' });

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

// Import after mock setup
const { sendEmailConfirmacaoCadastro, sendEmailAlteracaoEmail, sendEmailRecuperacaoSenha } =
  await import('../../lib/email.js');

describe('email: DEV fallback (sem RESEND_API_KEY)', () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    mockSend.mockClear();
  });

  it('sendEmailConfirmacaoCadastro não chama Resend e não lança', async () => {
    await expect(sendEmailConfirmacaoCadastro('user@example.com', 'http://localhost/confirm')).resolves.toBeUndefined();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('sendEmailAlteracaoEmail não chama Resend e não lança', async () => {
    await expect(sendEmailAlteracaoEmail('user@example.com', 'http://localhost/confirm')).resolves.toBeUndefined();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('sendEmailRecuperacaoSenha não chama Resend e não lança', async () => {
    await expect(sendEmailRecuperacaoSenha('user@example.com', 'http://localhost/reset')).resolves.toBeUndefined();
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe('email: produção (com RESEND_API_KEY)', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 're_test_key';
    mockSend.mockClear();
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  it('sendEmailConfirmacaoCadastro chama Resend com subject correto', async () => {
    await sendEmailConfirmacaoCadastro('user@example.com', 'http://app/confirm');
    expect(mockSend).toHaveBeenCalledOnce();
    const call = mockSend.mock.calls[0][0] as any;
    expect(call.to).toBe('user@example.com');
    expect(call.subject).toContain('Confirme seu cadastro');
    expect(call.from).toMatch(/naoresponda@/);
  });

  it('sendEmailAlteracaoEmail chama Resend com subject correto', async () => {
    await sendEmailAlteracaoEmail('new@example.com', 'http://app/confirm-email');
    expect(mockSend).toHaveBeenCalledOnce();
    const call = mockSend.mock.calls[0][0] as any;
    expect(call.to).toBe('new@example.com');
    expect(call.subject).toContain('novo email');
  });

  it('sendEmailRecuperacaoSenha chama Resend com subject correto', async () => {
    await sendEmailRecuperacaoSenha('user@example.com', 'http://app/reset');
    expect(mockSend).toHaveBeenCalledOnce();
    const call = mockSend.mock.calls[0][0] as any;
    expect(call.to).toBe('user@example.com');
    expect(call.subject).toContain('senha');
  });
});
