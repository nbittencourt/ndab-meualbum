import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { albumsApi, ApiError } from '@/lib/api';
import type { AlbumVariante } from '@meualbum/shared';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlbumVarianteCard } from '@/components/AlbumVarianteCard';
import { Modal } from '@/components/ui/Modal';

const VARIANTES: AlbumVariante[] = ['BROCHURA', 'CAPA_DURA', 'CAPA_DURA_PRATA', 'CAPA_DURA_OURO', 'BOX_PREMIUM'];

export default function CadastroAlbumPage() {
  const navigate = useNavigate();
  const [varianteSelecionada, setVarianteSelecionada] = useState<AlbumVariante | null>(null);
  const [nomePersonalizado, setNomePersonalizado] = useState('');
  const [error, setError] = useState('');
  const [showPropostaModal, setShowPropostaModal] = useState(false);
  const [albumCriadoId, setAlbumCriadoId] = useState<string | null>(null);

  const { data: tiposData, isLoading: tiposLoading } = useQuery({
    queryKey: ['tiposAlbum'],
    queryFn: albumsApi.getTipos,
  });

  const tipos = (tiposData?.tipos ?? []) as any[];
  const tipoUnico = tipos.length === 1 ? tipos[0] : null;
  const tipoSelecionado = tipoUnico ?? tipos[0];

  const criarMut = useMutation({
    mutationFn: () => {
      if (!tipoSelecionado || !varianteSelecionada) throw new Error('Dados inválidos');
      return albumsApi.create(tipoSelecionado._id, varianteSelecionada, nomePersonalizado.trim() || undefined);
    },
    onSuccess: (data) => {
      if (!data.temEstoque) {
        navigate('/home');
        return;
      }
      setAlbumCriadoId(data.album._id);
      setShowPropostaModal(true);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar álbum.');
    },
  });

  const canSubmit = !!varianteSelecionada && !!tipoSelecionado;

  return (
    <div className="min-h-dvh bg-paper p-4 flex flex-col gap-6">
      <header>
        <h1 className="font-display text-xl font-black text-ink uppercase tracking-wide">Novo Álbum</h1>
      </header>

      {tiposLoading && (
        <div className="flex justify-center py-8" aria-busy="true" aria-label="Carregando tipos de álbum">
          <div className="w-6 h-6 border-2 border-ink border-t-red rounded-full animate-spin" aria-hidden="true" />
        </div>
      )}

      {!tiposLoading && (
        <form
          onSubmit={(e) => { e.preventDefault(); criarMut.mutate(); }}
          noValidate
          className="flex flex-col gap-6"
        >
          {!tipoUnico && tipos.length > 0 && (
            <fieldset className="border-0 p-0 m-0">
              <legend className="font-display text-sm font-black uppercase tracking-wide text-ink mb-2">
                Tipo de Álbum <span className="text-red">*</span>
              </legend>
              <div className="flex flex-col gap-2">
                {tipos.map((t: any) => (
                  <label key={t._id} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="tipo" value={t._id} className="accent-red" defaultChecked={tipos.indexOf(t) === 0} />
                    <span className="text-sm font-body text-ink">{t.nome}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {tipoSelecionado && (
            <div className="border border-ink/20 p-3 bg-white text-sm font-body text-ink/70">
              <span className="font-semibold text-ink">{tipoSelecionado.nome}</span>
              {' — '}
              <span>Total de figurinhas: {tipoSelecionado.totalFigurinhas}</span>
            </div>
          )}

          <fieldset
            className="border-0 p-0 m-0"
            role="radiogroup"
            aria-label="Variante do álbum"
            aria-required="true"
          >
            <legend className="font-display text-sm font-black uppercase tracking-wide text-ink mb-3">
              Variante <span className="text-red" aria-hidden="true">*</span>
              <span className="sr-only">(obrigatório)</span>
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {VARIANTES.map((v) => (
                <AlbumVarianteCard
                  key={v}
                  variante={v}
                  selected={varianteSelecionada === v}
                  onClick={() => setVarianteSelecionada(v)}
                />
              ))}
            </div>
          </fieldset>

          <Input
            label="Nome personalizado (opcional)"
            type="text"
            placeholder="Ex.: Álbum da Copa"
            value={nomePersonalizado}
            onChange={(e) => setNomePersonalizado(e.target.value.slice(0, 60))}
            maxLength={60}
            hint="Máximo de 60 caracteres. Deixe em branco para usar o nome padrão."
          />

          {error && <p role="alert" className="text-xs text-red font-body">⚠ {error}</p>}

          <div className="flex gap-3">
            <Button
              type="submit"
              loading={criarMut.isPending}
              disabled={!canSubmit}
              aria-disabled={!canSubmit ? 'true' : undefined}
            >
              Criar álbum
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <Modal
        open={showPropostaModal}
        onClose={() => { navigate('/home'); }}
        title="Álbum criado"
      >
        <p className="text-sm font-body text-ink/70 mb-6">
          Você tem figurinhas no estoque. Deseja colá-las neste álbum agora?
        </p>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/colar?albumId=${albumCriadoId}`)}>
            Colar figurinhas
          </Button>
          <Button variant="secondary" onClick={() => navigate('/home')}>
            Agora não
          </Button>
        </div>
      </Modal>
    </div>
  );
}
