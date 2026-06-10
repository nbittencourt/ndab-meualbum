import { FullConfig } from '@playwright/test';

const BASE = 'http://localhost:3000/api/v1/test';

export default async function globalSetup(_config: FullConfig) {
  const resetRes = await fetch(`${BASE}/reset-db`, { method: 'POST' });
  if (!resetRes.ok) throw new Error(`Falha ao limpar banco de teste: ${resetRes.status}`);
  console.log('Banco de teste limpo com sucesso.');

  const tipoRes = await fetch(`${BASE}/tipo-album-id`);
  if (tipoRes.status === 404) {
    console.log('Nenhum TipoAlbum encontrado — carregando seed...');
    const seedRes = await fetch(`${BASE}/seed`, { method: 'POST' });
    if (!seedRes.ok) throw new Error(`Falha ao fazer seed: ${seedRes.status}`);
    const seedData = (await seedRes.json()) as { tipos: number; secoes: number; stickers: number };
    console.log(`Seed concluído: ${seedData.tipos} tipo(s), ${seedData.secoes} seção(ões), ${seedData.stickers} figurinhas.`);
  } else {
    console.log('Dados de seed já presentes — pulando seed.');
  }
}
