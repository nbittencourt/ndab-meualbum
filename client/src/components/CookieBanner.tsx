/**
 * Banner de Consentimento de Cookies — spec_privacidade_lgpd.md §5
 *
 * RN-PR05: exibido quando não há consentimento válido
 * RN-PR06: publicidade = opt-in (ativado apenas via "Aceitar")
 * RN-PR07: analytics = opt-out (desativado via "Remover não essenciais")
 * RN-PR10: operável por teclado e compatível com leitores de tela
 * RN-PR12: dois botões com destaque visual equivalente (sem dark pattern)
 * RN-PR14: link para Política de Privacidade obrigatório
 */
import { Button } from '@/components/ui/Button';

interface CookieBannerProps {
  /** Usuário clicou "Aceitar" — analytics=true, publicidade=true */
  onAccept: () => void;
  /** Usuário clicou "Remover não essenciais" — analytics=false, publicidade=false */
  onDecline: () => void;
}

export function CookieBanner({ onAccept, onDecline }: CookieBannerProps) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookies e Privacidade"
      className="fixed bottom-0 left-0 right-0 z-[200] bg-paper border-t-2 border-ink p-4 sm:p-6"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-sm font-black uppercase tracking-wide text-ink mb-1">
              Cookies e Privacidade
            </h2>
            <p className="text-xs font-body text-ink/70">
              Usamos cookies essenciais para o funcionamento do serviço e, com sua autorização,
              cookies de analytics e publicidade. Saiba mais na nossa{' '}
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
          {/* RN-PR12: destaque visual equivalente — sem hierarquia que configure dark pattern */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={onAccept}>
              Aceitar
            </Button>
            <Button size="sm" variant="secondary" onClick={onDecline}>
              Remover não essenciais
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
