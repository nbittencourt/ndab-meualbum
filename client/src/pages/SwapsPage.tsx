import { AppHeader } from '@/components/AppHeader';

export default function SwapsPage() {
  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <AppHeader />
      <div className="p-4">
        <p className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-1">EM BREVE</p>
        <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide mb-4">Trocas</h1>

        <div className="border-2 border-dashed border-ink/20 p-6 flex flex-col gap-4">
          <p className="font-display text-base font-black text-ink">Como vai funcionar</p>

          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs text-ink/40 mt-0.5 shrink-0">01</span>
              <p className="text-sm font-body text-ink/70 leading-relaxed">
                Cadastre suas figurinhas repetidas abrindo pacotinhos ou marcando-as no estoque.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs text-ink/40 mt-0.5 shrink-0">02</span>
              <p className="text-sm font-body text-ink/70 leading-relaxed">
                Envie seu código de usuário a um amigo para que ele veja suas figurinhas disponíveis para troca.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs text-ink/40 mt-0.5 shrink-0">03</span>
              <p className="text-sm font-body text-ink/70 leading-relaxed">
                O app faz o match entre suas figurinhas repetidas e as repetidas do seu amigo que você precisa.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs text-ink/40 mt-0.5 shrink-0">04</span>
              <p className="text-sm font-body text-ink/70 leading-relaxed">
                Vocês trocam as figurinhas e confirmam no app, atualizando as listas automaticamente.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
