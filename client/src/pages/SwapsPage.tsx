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
                Suas figurinhas repetidas ficam listadas automaticamente — sem precisar cadastrar nada.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs text-ink/40 mt-0.5 shrink-0">02</span>
              <p className="text-sm font-body text-ink/70 leading-relaxed">
                Publique uma oferta indicando o que você tem e o que precisa.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-xs text-ink/40 mt-0.5 shrink-0">03</span>
              <p className="text-sm font-body text-ink/70 leading-relaxed">
                O sistema encontra outros colecionadores com combinações de troca compatíveis.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
