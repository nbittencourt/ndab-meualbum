import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordChecklist, allRulesMet } from '@/components/ui/PasswordChecklist';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { Identifier } from '@/components/Identifier';

type ToastVariant = 'success' | 'error' | 'info';
type ToastState = { message: string; variant: ToastVariant } | null;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border-2 border-ink [box-shadow:3px_3px_0_#0A0907] p-4">
      <h2 className="font-display text-sm font-black uppercase tracking-wide text-ink mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [toast, setToast] = useState<ToastState>(null);
  const showToast = (message: string, variant: ToastVariant = 'info') => setToast({ message, variant });

  // Nome
  const [nomeEdit, setNomeEdit] = useState(false);
  const [nomeVal, setNomeVal] = useState(user?.name ?? '');
  const [nomeError, setNomeError] = useState('');
  const nomeMut = useMutation({
    mutationFn: (nome: string) => profileApi.alterarNome(nome),
    onSuccess: (data) => {
      useAuthStore.getState().setUser(data.user);
      setNomeEdit(false);
      showToast('Nome salvo com sucesso.', 'success');
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Erro ao alterar nome.';
      setNomeError(msg);
    },
  });

  // Email
  const [emailVal, setEmailVal] = useState('');
  const [emailError, setEmailError] = useState('');
  const emailMut = useMutation({
    mutationFn: (email: string) => profileApi.solicitarAlteracaoEmail(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEmailVal('');
      showToast('Email de confirmação enviado.', 'success');
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : '';
      setEmailError(
        msg === 'COOLDOWN'
          ? 'Aguarde 5 minutos entre solicitações de alteração de email.'
          : msg || 'Erro ao solicitar alteração.'
      );
    },
  });
  const cancelarEmailMut = useMutation({
    mutationFn: () => profileApi.cancelarAlteracaoEmail(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast('Alteração de email cancelada.', 'info');
    },
  });
  const reenviarEmailMut = useMutation({
    mutationFn: () => profileApi.reenviarEmailConfirmacao(),
    onSuccess: () => showToast('Email de confirmação reenviado.', 'success'),
    onError: (err) => showToast(err instanceof ApiError ? err.message : 'Erro ao reenviar.', 'error'),
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    enabled: !!user,
  });
  const emailPendente = profileData?.user?.emailPendente ?? user?.emailPendente;

  // Senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const senhaMut = useMutation({
    mutationFn: () => profileApi.alterarSenha(senhaAtual, senhaNova),
    onSuccess: () => {
      setSenhaAtual(''); setSenhaNova(''); setSenhaConfirm('');
      showToast('Senha alterada com sucesso. Você foi desconectado dos outros dispositivos.', 'success');
    },
    onError: (err) => setSenhaError(err instanceof ApiError ? err.message : 'Erro ao alterar senha.'),
  });
  const canChangeSenha = senhaAtual.length > 0 && allRulesMet(senhaNova, senhaConfirm);

  // Exportar dados
  const [exportLoading, setExportLoading] = useState(false);
  async function handleExportar() {
    setExportLoading(true);
    try {
      const blob = await profileApi.exportarDados();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'meualbum-dados.zip'; a.click();
      URL.revokeObjectURL(url);
      showToast('Dados exportados com sucesso.', 'success');
    } catch {
      showToast('Erro ao exportar dados.', 'error');
    } finally {
      setExportLoading(false);
    }
  }

  // Excluir conta
  const [showExcluirModal, setShowExcluirModal] = useState(false);
  const [excluirIdentificador, setExcluirIdentificador] = useState('');
  const [excluirError, setExcluirError] = useState('');
  const excluirTriggerRef = useRef<HTMLButtonElement>(null);
  const excluirMut = useMutation({
    mutationFn: () => profileApi.excluirConta(excluirIdentificador),
    onSuccess: () => {
      setShowExcluirModal(false);
      sessionStorage.setItem('contaExcluida', '1');
      window.location.href = '/';
    },
    onError: (err) => setExcluirError(err instanceof ApiError ? err.message : 'Erro ao excluir conta.'),
  });

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <AppHeader />
      <div className="p-4 xl:px-8 flex flex-col gap-6">
      <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Perfil</h1>

      {user && (
        <Section title="Identificador">
          <p className="text-xs font-body text-ink/60 mb-3">
            Seu código único para trocas e suporte. Não compartilhe com desconhecidos.
          </p>
          <Identifier value={user.publicId} />
        </Section>
      )}

      <Section title="Nome">
        {nomeEdit ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            const trimmed = nomeVal.trim();
            if (trimmed.length > 100) { setNomeError('Máximo de 100 caracteres.'); return; }
            setNomeError('');
            nomeMut.mutate(trimmed);
          }} className="flex flex-col gap-3">
            <Input
              label="Nome completo"
              value={nomeVal}
              onChange={(e) => { setNomeVal(e.target.value); setNomeError(''); }}
              autoFocus
              error={nomeError || undefined}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={nomeMut.isPending} disabled={!nomeVal.trim() || nomeVal.trim() === (user?.name ?? '')} data-testid="salvar-nome">Salvar</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { setNomeEdit(false); setNomeVal(user?.name ?? ''); setNomeError(''); }}>Cancelar</Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="font-body text-sm text-ink">{user?.name}</p>
            <Button size="sm" variant="secondary" onClick={() => setNomeEdit(true)}>Editar</Button>
          </div>
        )}
      </Section>

      <Section title="Email">
        <p className="font-body text-sm text-ink mb-1">{user?.email}</p>
        {emailPendente && (
          <div className="mb-3 p-3 bg-ink/5 border border-ink/20 text-xs font-body text-ink/70">
            <p className="mb-2">Aguardando confirmação: <strong>{emailPendente}</strong></p>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="secondary" loading={reenviarEmailMut.isPending} onClick={() => reenviarEmailMut.mutate()}>
                Reenviar email
              </Button>
              <Button size="sm" variant="secondary" loading={cancelarEmailMut.isPending} onClick={() => cancelarEmailMut.mutate()}>
                Cancelar alteração
              </Button>
            </div>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); setEmailError(''); emailMut.mutate(emailVal); }} className="flex flex-col gap-3 mt-3">
          <Input
            label="Novo email"
            type="email"
            value={emailVal}
            onChange={(e) => { setEmailVal(e.target.value); setEmailError(''); }}
            autoComplete="email"
            error={emailError || undefined}
          />
          <Button type="submit" size="sm" loading={emailMut.isPending} disabled={!emailVal.trim()} data-testid="salvar-email">
            Alterar email
          </Button>
        </form>
      </Section>

      <Section title="Senha">
        <form onSubmit={(e) => { e.preventDefault(); setSenhaError(''); senhaMut.mutate(); }} className="flex flex-col gap-3" noValidate>
          <PasswordInput
            label="Senha atual"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            autoComplete="current-password"
            required
          />
          <div className="flex flex-col gap-1">
            <PasswordInput
              label="Nova senha"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              autoComplete="new-password"
              required
            />
            {senhaNova.length > 0 && (
              <PasswordChecklist password={senhaNova} confirm={senhaConfirm} showConfirm={senhaConfirm.length > 0} />
            )}
          </div>
          <PasswordInput
            label="Confirmar nova senha"
            value={senhaConfirm}
            onChange={(e) => setSenhaConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
          {senhaError && <p role="alert" className="text-xs text-red font-body">⚠ {senhaError}</p>}
          <Button type="submit" size="sm" loading={senhaMut.isPending} disabled={!canChangeSenha}>
            Alterar senha
          </Button>
        </form>
      </Section>

      <Section title="Privacidade e Dados">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-body text-ink/60 mb-2">
              Exporte todos os seus dados em formato ZIP (LGPD, Art. 18).
            </p>
            <Button
              size="sm"
              variant="secondary"
              loading={exportLoading}
              disabled={exportLoading}
              aria-busy={exportLoading ? 'true' : undefined}
              onClick={handleExportar}
            >
              Exportar meus dados
            </Button>
          </div>
          <div className="border-t border-ink/10 pt-3 flex flex-col gap-2 text-xs font-body">
            <a href="/privacidade" className="text-ink underline hover:brightness-75">
              Política de Privacidade
            </a>
            <a href="/privacidade#direitos" className="text-ink underline hover:brightness-75">
              Exercer direitos de privacidade
            </a>
            <button
              type="button"
              className="text-ink underline hover:brightness-75 text-left"
              onClick={() => {
                document.dispatchEvent(new CustomEvent('abrir-cookie-banner'));
              }}
            >
              Gerenciar cookies
            </button>
          </div>
        </div>
      </Section>

      <Section title="Excluir conta">
        <p className="text-xs font-body text-ink/60 mb-3">
          A exclusão é permanente. Todos os seus dados serão removidos imediatamente e não poderão ser recuperados.
        </p>
        <Button
          ref={excluirTriggerRef}
          size="sm"
          variant="danger"
          onClick={() => { setShowExcluirModal(true); setExcluirIdentificador(''); setExcluirError(''); }}
        >
          Excluir minha conta
        </Button>
      </Section>

      <Modal
        open={showExcluirModal}
        onClose={() => setShowExcluirModal(false)}
        title="Excluir conta permanentemente"
        variant="alertdialog"
      >
        <p className="text-sm font-body text-ink/70 mb-4">
          Esta ação é irreversível. Para confirmar, digite seu identificador (<strong>{user?.publicId}</strong>).
        </p>
        <Input
          label="Identificador"
          value={excluirIdentificador}
          onChange={(e) => { setExcluirIdentificador(e.target.value.toUpperCase()); setExcluirError(''); }}
          placeholder="Identificador"
          autoComplete="off"
        />
        {excluirError && <p role="alert" className="text-xs text-red font-body mt-2">⚠ {excluirError}</p>}
        <div className="flex gap-2 mt-4">
          <Button
            variant="danger"
            loading={excluirMut.isPending}
            disabled={excluirIdentificador !== user?.publicId}
            onClick={() => excluirMut.mutate()}
          >
            Confirmar exclusão
          </Button>
          <Button variant="secondary" onClick={() => setShowExcluirModal(false)}>Cancelar</Button>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
      </div>
    </div>
  );
}
