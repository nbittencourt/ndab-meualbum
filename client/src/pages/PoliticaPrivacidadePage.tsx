const EMAIL_PRIVACIDADE = 'privacidade@nicholas.tec.br';

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-base font-black uppercase tracking-wide text-ink mt-8 mb-3">
      {children}
    </h2>
  );
}

function Tabela({ header, rows }: { header: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-body border-collapse">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            {header.map((h) => (
              <th key={h} className="py-2 pr-3 font-semibold uppercase tracking-wide text-ink/60">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-ink/10 align-top">
              {r.map((c, j) => (
                <td key={j} className="py-2 pr-3 text-ink">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Política de Privacidade — conteúdo mínimo conforme docs/spec_privacidade_lgpd.md §7.2.
 * Página pública, linkada pelo rodapé, cadastro, banner de cookies e Perfil.
 */
export default function PoliticaPrivacidadePage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-8 font-body text-sm text-ink leading-relaxed">
      <h1 className="font-display text-2xl font-black uppercase tracking-wide text-ink">
        Política de Privacidade
      </h1>
      <p className="text-xs text-ink/60 mt-2">
        Versão 1.1 — vigente desde 06 de junho de 2026.
      </p>

      <H2>Quem somos (controlador)</H2>
      <p>
        O <strong>MeuAlbum</strong> é a plataforma de gestão de coleção de figurinhas da Copa do
        Mundo 2026. O canal designado para o exercício de direitos de privacidade é{' '}
        <a className="underline" href={`mailto:${EMAIL_PRIVACIDADE}`}>{EMAIL_PRIVACIDADE}</a>.
      </p>

      <H2>Dados que tratamos</H2>
      <Tabela
        header={['Dado', 'Finalidade', 'Base legal (LGPD)']}
        rows={[
          ['Nome e email', 'Identificação, autenticação e comunicações transacionais', 'Execução de contrato (Art. 7º, V)'],
          ['Hash de senha', 'Autenticação — nunca armazenada em claro', 'Execução de contrato'],
          ['Identificador público (6 caracteres)', 'Identificação na plataforma', 'Execução de contrato'],
          ['Álbuns e figurinhas (estoque, colagens, pilha)', 'Prestação do serviço principal', 'Execução de contrato'],
          ['Declaração de maioridade (data/hora)', 'Conformidade com a restrição de idade (18+)', 'Execução de contrato'],
          ['Logs de autenticação e operações (IP mascarado)', 'Segurança, detecção de fraude e auditoria', 'Legítimo interesse (Art. 7º, IX)'],
          ['Dados de uso e navegação (analytics)', 'Melhoria da experiência e tratamento de erros', 'Legítimo interesse — com opção de desativação'],
          ['Cookies de publicidade', 'Publicidade direcionada', 'Consentimento (Art. 7º, I) — opt-in'],
          ['Registro de consentimento de cookies', 'Comprovação do consentimento (Art. 8º)', 'Obrigação legal'],
        ]}
      />
      <p className="mt-3">
        Não coletamos dados sensíveis nem dados de menores de 18 anos — o serviço é{' '}
        <strong>exclusivo para maiores de 18 anos</strong>, mediante declaração no cadastro.
      </p>

      <H2>Compartilhamento com operadores</H2>
      <Tabela
        header={['Operador', 'Finalidade']}
        rows={[
          ['Google Cloud / Firebase (EUA)', 'Hospedagem da aplicação e do banco de dados'],
          ['MongoDB Atlas (EUA)', 'Armazenamento dos dados da conta e da coleção'],
          ['Resend (EUA)', 'Envio de emails transacionais (confirmação, recuperação de senha)'],
        ]}
      />
      <p className="mt-3">
        A transferência internacional para os Estados Unidos ocorre com salvaguardas contratuais
        (cláusulas-padrão) dos respectivos operadores, conforme Art. 33 da LGPD.
      </p>

      <H2>Retenção de dados</H2>
      <Tabela
        header={['Categoria', 'Prazo']}
        rows={[
          ['Dados de conta ativa', 'Enquanto a conta existir'],
          ['Conta excluída', 'Eliminação imediata e definitiva'],
          ['Logs de autenticação e segurança', '6 meses'],
          ['Registros de consentimento de cookies', '5 anos'],
          ['Tokens expirados não utilizados', '90 dias após a expiração'],
        ]}
      />

      <H2>Cookies</H2>
      <p>
        Usamos três categorias: <strong>essenciais</strong> (sessão autenticada — não podem ser
        desativados), <strong>analytics</strong> (ativados por padrão, desativáveis pelo botão
        "Remover não essenciais" do banner) e <strong>publicidade</strong> (ativados somente com o
        seu aceite). O banner é reapresentado a cada 12 meses ou quando esta política muda de forma
        material; para revogar antes disso, contate o canal de privacidade.
      </p>

      <H2 id="direitos">Seus direitos (Art. 18 LGPD)</H2>
      <p>
        Você pode, a qualquer momento: confirmar a existência de tratamento, acessar, corrigir e
        eliminar seus dados, solicitar portabilidade e revogar consentimentos. Dentro da plataforma:
        a <strong>exportação dos dados</strong> e a <strong>exclusão definitiva da conta</strong>{' '}
        estão disponíveis na tela de Perfil. Para os demais direitos, escreva para{' '}
        <a className="underline" href={`mailto:${EMAIL_PRIVACIDADE}`}>{EMAIL_PRIVACIDADE}</a> —
        respondemos em até <strong>15 dias</strong> (Art. 19, §3º).
      </p>

      <H2>Alterações desta política</H2>
      <p>
        Mudanças materiais invalidam os consentimentos anteriores e reapresentam o banner de
        cookies. O histórico de versões é mantido pelo controlador.
      </p>
    </div>
  );
}
