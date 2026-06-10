export function SkipLink() {
  return (
    <a
      href="#main"
      className={[
        'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999]',
        'bg-ink text-white px-4 py-2 text-sm font-body font-semibold',
        'focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2',
      ].join(' ')}
    >
      Pular para o conteúdo
    </a>
  );
}
