import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface CookieBannerProps {
  onAccept: (prefs: { analytics: boolean; publicidade: boolean }) => void;
}

export function CookieBanner({ onAccept }: CookieBannerProps) {
  const [showManage, setShowManage] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [publicidade, setPublicidade] = useState(false);

  function acceptAll() {
    onAccept({ analytics: true, publicidade: false });
  }

  function rejectNonEssential() {
    onAccept({ analytics: false, publicidade: false });
  }

  function savePreferences() {
    onAccept({ analytics, publicidade });
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Preferências de cookies"
      className="fixed bottom-0 left-0 right-0 z-[200] bg-paper border-t-2 border-ink p-4 sm:p-6"
    >
      <div className="max-w-2xl mx-auto">
        {!showManage ? (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-display text-sm font-black uppercase tracking-wide text-ink mb-1">
                Cookies e Privacidade
              </h2>
              <p className="text-xs font-body text-ink/70">
                Usamos cookies essenciais para o funcionamento do serviço. Você pode escolher quais cookies
                adicionais aceita. Saiba mais na nossa{' '}
                <a
                  href="/politica-de-privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-ink hover:text-red"
                >
                  Política de Privacidade <span className="sr-only">(abre em nova aba)</span>
                </a>
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={acceptAll}>
                Aceitar essenciais
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowManage(true)}>
                Gerenciar preferências
              </Button>
              <Button size="sm" variant="ghost" onClick={rejectNonEssential}>
                Rejeitar não essenciais
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-sm font-black uppercase tracking-wide text-ink">
              Gerenciar preferências de cookies
            </h2>
            <fieldset className="flex flex-col gap-3 border-0 p-0 m-0">
              <legend className="sr-only">Categorias de cookies</legend>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-essenciais"
                  checked
                  disabled
                  aria-describedby="cookie-essenciais-desc"
                  className="mt-0.5 w-4 h-4 accent-red"
                />
                <div>
                  <label htmlFor="cookie-essenciais" className="text-xs font-mono font-semibold uppercase text-ink">
                    Essenciais
                  </label>
                  <p id="cookie-essenciais-desc" className="text-xs font-body text-ink/60">
                    Necessários para o funcionamento. Não podem ser desativados.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-analytics"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  aria-describedby="cookie-analytics-desc"
                  className="mt-0.5 w-4 h-4 accent-red cursor-pointer"
                />
                <div>
                  <label htmlFor="cookie-analytics" className="text-xs font-mono font-semibold uppercase text-ink cursor-pointer">
                    Analytics e Desempenho
                  </label>
                  <p id="cookie-analytics-desc" className="text-xs font-body text-ink/60">
                    Ajudam a entender como o aplicativo é usado. Baseado em interesse legítimo; você pode recusar.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="cookie-publicidade"
                  checked={publicidade}
                  onChange={(e) => setPublicidade(e.target.checked)}
                  aria-describedby="cookie-publicidade-desc"
                  className="mt-0.5 w-4 h-4 accent-red cursor-pointer"
                />
                <div>
                  <label htmlFor="cookie-publicidade" className="text-xs font-mono font-semibold uppercase text-ink cursor-pointer">
                    Publicidade
                  </label>
                  <p id="cookie-publicidade-desc" className="text-xs font-body text-ink/60">
                    Usados para exibir anúncios relevantes. Requer seu consentimento explícito.
                  </p>
                </div>
              </div>
            </fieldset>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={savePreferences}>
                Salvar preferências
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowManage(false)}>
                Voltar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
