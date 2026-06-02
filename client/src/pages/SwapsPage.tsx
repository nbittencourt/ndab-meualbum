import { AppHeader } from '@/components/AppHeader';

export default function SwapsPage() {
  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <AppHeader />
      <div className="p-4">
        <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide mb-2">Trocas</h1>
        <p className="text-ink/60 text-sm font-body">Em breve: gerencie suas trocas aqui.</p>
      </div>
    </div>
  );
}
