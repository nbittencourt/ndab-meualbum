import { Button } from '@/components/ui/Button';

interface CookieBannerProps {
  onAccept: () => void;
}

export function CookieBanner({ onAccept }: CookieBannerProps) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Preferências de cookies"
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
          <div className="flex flex-wrap gap-2">
            {/* Aceitar: analytics=true, publicidade=true */}
            <Button size="sm" variant="primary" onClick={onAccept}>
              Aceitar
            </Button>
            {/* Remover: recusa não-essenciais (analytics=false, publicidade=false) */}
            <Button size="sm" variant="secondary" onClick={onAccept}>
              Remover não essenciais
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
