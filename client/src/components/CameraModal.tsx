/**
 * Modal Câmera (MC) — spec_abrir_pacotinhos.md §6 / spec_colar_figurinhas.md §8
 *
 * Fluxo:
 *   loading → viewfinder → (captura) → processing → result | not_recognized
 *   result → (confirmar) → viewfinder [próxima] | (fechar) → [pai fecha]
 *   not_recognized → (tentar novamente) → viewfinder | (pular) → [pai fecha]
 *   camera_error → fechar
 *
 * RN-AP13: modal sobrepõe AP1 (pilha visível abaixo)
 * RN-AP21: OCR local — nenhuma imagem enviada ao backend
 * RN-AP22: não reconhecido → pular sem adicionar
 * RN-AP23: número reconhecido é editável antes de confirmar
 * RN-AP34: focus trap + role=dialog + aria-modal=true + aria-labelledby
 *          foco retorna ao botão "Abrir câmera" ao fechar (gerenciado pelo Modal base)
 * RN-CF27: comportamento idêntico no MFN
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type CameraState = 'loading' | 'viewfinder' | 'processing' | 'result' | 'not_recognized' | 'camera_error';

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Chamado quando o usuário confirma um número (resultado do OCR ou digitação manual).
   * Deve retornar uma Promise; rejeição será exibida como erro inline no modal.
   */
  onConfirm: (numero: string) => Promise<void>;
  /** Enquanto verdadeiro, o botão "Confirmar" exibe estado de carregamento. */
  confirmLoading?: boolean;
  /** Texto do botão de reset após colagem bem-sucedida (default: "Fotografar próxima") */
  nextLabel?: string;
}

export function CameraModal({
  open,
  onClose,
  onConfirm,
  confirmLoading = false,
  nextLabel = 'Fotografar próxima',
}: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>('loading');
  const [recognized, setRecognized] = useState('');
  const [addError, setAddError] = useState('');

  // Inicia câmera quando modal abre
  useEffect(() => {
    if (!open) return;
    setCameraState('loading');
    setRecognized('');
    setAddError('');

    let active = true;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraState('viewfinder');
      })
      .catch(() => {
        if (active) setCameraState('camera_error');
      });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [open]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCameraState('processing');

    try {
      // Lazy-load Tesseract para não impactar o bundle inicial (RN-AP21)
      const tesseract = await import('tesseract.js');
      const { createWorker, PSM } = tesseract;
      const worker = await createWorker('por', 1, {
        logger: () => {}, // Suprime logs de progresso
      });
      await worker.setParameters({
        // Permite somente caracteres alfanuméricos esperados em números de figurinhas
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        // PSM.SINGLE_LINE: trata imagem como uma única linha de texto
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
      });

      const { data } = await worker.recognize(canvas);
      await worker.terminate();

      const clean = data.text.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');

      if (clean) {
        setRecognized(clean);
        setCameraState('result');
      } else {
        setCameraState('not_recognized');
      }
    } catch {
      setCameraState('not_recognized');
    }
  }, []);

  const handleRetry = () => {
    setRecognized('');
    setAddError('');
    setCameraState('viewfinder');
  };

  const handleConfirm = async () => {
    if (!recognized.trim()) return;
    setAddError('');
    try {
      await onConfirm(recognized.trim());
      // Sucesso: reset para viewfinder (usuário pode fotografar próxima)
      setRecognized('');
      setAddError('');
      setCameraState('viewfinder');
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Erro ao adicionar figurinha.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Câmera"
      variant="dialog"
    >
      {/* Estado: carregando câmera */}
      {cameraState === 'loading' && (
        <div
          className="flex items-center justify-center py-10"
          aria-busy="true"
          aria-label="Iniciando câmera"
        >
          <div
            className="w-8 h-8 border-2 border-ink border-t-red rounded-full animate-spin"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Estado: viewfinder ativo */}
      {(cameraState === 'viewfinder' || cameraState === 'processing') && (
        <div className="flex flex-col gap-3">
          <div className="relative bg-black overflow-hidden rounded" style={{ aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              aria-label="Viewfinder da câmera"
            />
            {/* Retângulo-guia de alinhamento (RN §6.2) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <div
                className="border-2 border-white/80"
                style={{ width: '70%', height: '35%' }}
              />
            </div>
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          </div>
          <p className="text-xs font-body text-ink/60 text-center">
            Posicione o número da figurinha dentro do quadro
          </p>
          <Button
            onClick={handleCapture}
            loading={cameraState === 'processing'}
            disabled={cameraState === 'processing'}
            aria-label="Fotografar figurinha para reconhecimento"
          >
            {cameraState === 'processing' ? 'Processando...' : 'Fotografar'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Fechar câmera
          </Button>
        </div>
      )}

      {/* Estado: número reconhecido — campo editável (RN-AP23) */}
      {cameraState === 'result' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-body text-ink/70">
            Número reconhecido — confirme ou corrija:
          </p>
          <Input
            label="Número da figurinha"
            value={recognized}
            onChange={(e) => {
              setRecognized(e.target.value.toUpperCase());
              setAddError('');
            }}
            autoFocus
            autoComplete="off"
            aria-label="Número da figurinha reconhecido pelo OCR"
            error={addError || undefined}
          />
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleConfirm}
              loading={confirmLoading}
              disabled={!recognized.trim() || confirmLoading}
            >
              Confirmar
            </Button>
            <Button variant="secondary" onClick={handleRetry}>
              {nextLabel}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Fechar câmera
            </Button>
          </div>
        </div>
      )}

      {/* Estado: OCR não reconheceu o número (RN-AP22) */}
      {cameraState === 'not_recognized' && (
        <div className="flex flex-col gap-3">
          <p role="alert" className="text-sm font-body text-red font-semibold">
            Não foi possível reconhecer o número.
          </p>
          <p className="text-xs font-body text-ink/60">
            Tente novamente aproximando a câmera ou melhorando a iluminação, ou pule esta figurinha.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleRetry}>Tentar novamente</Button>
            <Button variant="secondary" onClick={onClose}>
              Pular
            </Button>
          </div>
        </div>
      )}

      {/* Estado: câmera sem permissão ou indisponível */}
      {cameraState === 'camera_error' && (
        <div className="flex flex-col gap-3">
          <p role="alert" className="text-sm font-body text-red font-semibold">
            Câmera indisponível
          </p>
          <p className="text-xs font-body text-ink/60">
            Não foi possível acessar a câmera. Verifique as permissões do navegador e tente novamente.
          </p>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      )}
    </Modal>
  );
}
