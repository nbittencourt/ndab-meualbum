import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { useQuery, useMutation } from '@tanstack/react-query';
import { albumsApi, ApiError } from '@/lib/api';
import type { AlbumVariante } from '@meualbum/shared';
import { Button } from '@/components/ui/Button';
import { AlbumVarianteCard } from '@/components/AlbumVarianteCard';
import { Modal } from '@/components/ui/Modal';

const VARIANTES: AlbumVariante[] = ['BROCHURA', 'CAPA_DURA', 'CAPA_DURA_PRATA', 'CAPA_DURA_OURO', 'BOX_PREMIUM'];

const VARIANTE_PAGE_BG: Record<AlbumVariante, string> = {
  BROCHURA: '#ffffff',
  CAPA_DURA: '#F5F0E4',
  CAPA_DURA_PRATA: 'repeating-linear-gradient(135deg, #F0EDE4 0px, #F0EDE4 6px, #E0DDD5 6px, #E0DDD5 14px)',
  CAPA_DURA_OURO: '#FEF3CC',
  BOX_PREMIUM: '#0A0907',
};

export default function CadastroAlbumPage() {
  const navigate = useNavigate();
  const [varianteSelecionada, setVarianteSelecionada] = useState<AlbumVariante | null>(null);
  const [nomePersonalizado, setNomePersonalizado] = useState('');
  const [error, setError] = useState('');
  const [showPropostaModal, setShowPropostaModal] = useState(false);
  const [albumCriadoId, setAlbumCriadoId] = useState<string | null>(null);

  const isPremium = varianteSelecionada === 'BOX_PREMIUM';
  const textColor = isPremium ? '#ffffff' : '#0A0907';
  const textMuted = isPremium ? 'rgba(255,255,255,0.6)' : 'rgba(10,9,7,0.6)';
  const pageBg = varianteSelecionada ? VARIANTE_PAGE_BG[varianteSelecionada] : '#FBF8EE';

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
    <div
      style={{
        background: pageBg,
        transition: 'background 0.2s ease',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        color: textColor,
      }}
    >
      <AppHeader back />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
      <h1
        className="font-display text-xl font-black uppercase tracking-wide"
        style={{ color: textColor }}
      >
        Novo Álbum
      </h1>

      {tiposLoading && (
        <div className="flex justify-center py-8" aria-busy="true" aria-label="Carregando tipos de álbum">
          <div
            className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: textColor, borderTopColor: isPremium ? '#E5142A' : '#E5142A' }}
            aria-hidden="true"
          />
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
              <legend
                className="font-display text-sm font-black uppercase tracking-wide mb-2"
                style={{ color: textColor }}
              >
                Tipo de Álbum <span style={{ color: '#E5142A' }}>*</span>
              </legend>
              <div className="flex flex-col gap-2">
                {tipos.map((t: any) => (
                  <label key={t._id} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="tipo" value={t._id} className="accent-red" defaultChecked={tipos.indexOf(t) === 0} />
                    <span className="text-sm font-body" style={{ color: textColor }}>{t.nome}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {tipoSelecionado && (
            <div
              className="p-3 text-sm font-body"
              style={{
                border: isPremium ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(10,9,7,0.2)',
                background: isPremium ? 'rgba(255,255,255,0.06)' : '#ffffff',
                color: textColor,
              }}
            >
              <span className="font-semibold">{tipoSelecionado.nome}</span>
              {' — '}
              <span style={{ color: textMuted }}>Total de figurinhas: {tipoSelecionado.totalFigurinhas}</span>
            </div>
          )}

          <fieldset
            className="border-0 p-0 m-0"
            role="radiogroup"
            aria-label="Variante do álbum"
            aria-required="true"
          >
            <legend className="font-display text-sm font-black uppercase tracking-wide mb-3" style={{ color: textColor }}>
              Variante <span style={{ color: '#E5142A' }} aria-hidden="true">*</span>
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

          <div>
            <label
              htmlFor="nome-personalizado"
              className="block font-display text-xs font-black uppercase tracking-wide mb-1"
              style={{ color: textColor }}
            >
              Nome personalizado <span style={{ color: textMuted }}>(opcional)</span>
            </label>
            <input
              id="nome-personalizado"
              type="text"
              placeholder="Ex.: Álbum da Copa"
              value={nomePersonalizado}
              onChange={(e) => setNomePersonalizado(e.target.value.slice(0, 60))}
              maxLength={60}
              className="w-full px-3 py-2 text-sm font-body focus:outline-none"
              style={{
                background: isPremium ? 'rgba(255,255,255,0.1)' : '#ffffff',
                border: isPremium ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #0A0907',
                color: textColor,
                borderRadius: 4,
              }}
            />
            <p className="text-xs mt-1 font-body" style={{ color: textMuted }}>
              Máximo de 60 caracteres. Deixe em branco para usar o nome padrão.
            </p>
          </div>

          {error && <p role="alert" className="text-xs font-body" style={{ color: '#E5142A' }}>⚠ {error}</p>}

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
    </div>
  );
}
