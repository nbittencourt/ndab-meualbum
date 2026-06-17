# LIA — Avaliação de Legítimo Interesse (Legitimate Interest Assessment)

> **Tratamentos avaliados:** logs de autenticação/operações de segurança e dados de uso e navegação (analytics).
> **Base legal:** Art. 7º, IX da LGPD (BL-09 — legítimo interesse).
> **Referências normativas:** `docs/spec_privacidade_lgpd.md` §2.2; `docs/legal/lgpd_guia_sistemas.md` (R-BAS-004, R-PR-01).
> **Controlador:** MeuAlbum (plataforma de gestão de coleção de figurinhas Copa 2026).

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | 2026-06-13 | Versão inicial |

---

## 1. Interesse legítimo concreto

### 1.1 Logs de autenticação e operações de segurança

- **Interesse:** garantir a segurança da plataforma e das contas dos titulares — detecção de tentativas de acesso indevido, abuso de endpoints sensíveis (recuperação de senha, alteração de email), auditoria de operações que afetam dados pessoais (exportação, exclusão de conta) e diagnóstico de incidentes.
- **Legitimidade:** trata-se de interesse expressamente reconhecido pelo Art. 10, II da LGPD (proteção do exercício regular de direitos do titular e prestação de serviços que o beneficiem) e alinhado ao dever de segurança do Art. 46.

### 1.2 Dados de uso e navegação (analytics)

- **Interesse:** melhoria contínua da experiência de uso (identificação de fluxos com fricção, erros de interface) e tratamento de erros em produção.
- **Legitimidade:** apoio ao serviço contratado pelo titular; sem analytics o controlador não consegue priorizar correções que beneficiam diretamente os usuários.

## 2. Necessidade e proporcionalidade

- **Minimização nos logs:** os logs estruturados aplicam mascaramento na origem, antes da escrita — email reduzido a `n***@domínio`, nome a inicial, IP com último octeto suprimido (implementação: funções `maskEmail`, `maskName` e `maskIp` em `server/src/lib/logger.ts`). Nenhum payload de requisição contendo dados pessoais em claro é registrado; senhas e tokens nunca são logados.
- **Minimização no analytics:** apenas eventos de navegação e erro, sem conteúdo da coleção do usuário e sem identificadores diretos; a categoria é tratada como não essencial no banner de cookies.
- **Alternativas consideradas:** a finalidade de segurança não pode ser atingida sem registro de eventos (a ausência de logs inviabiliza detecção de fraude e resposta a incidentes); o volume e o detalhe registrados são os mínimos necessários.

## 3. Balanceamento com as expectativas razoáveis do titular

- Usuários de serviços autenticados esperam, razoavelmente, que tentativas de login e operações sensíveis em sua conta sejam registradas para a própria proteção.
- O impacto sobre o titular é baixo: dados comuns (C1), mascarados, sem perfilamento, sem compartilhamento com terceiros e sem decisões automatizadas.
- A transparência é garantida pela Política de Privacidade (acessível no rodapé, no cadastro e no banner de cookies), que informa as finalidades e a base legal.
- Conclusão do balanceamento: o interesse legítimo prevalece, pois o tratamento beneficia o próprio titular (segurança) ou o serviço que ele utiliza (melhoria), com risco residual mínimo.

## 4. Salvaguardas

| Salvaguarda | Implementação |
|---|---|
| Minimização de coleta | Mascaramento na origem (`server/src/lib/logger.ts`); analytics sem identificadores diretos |
| Opt-out de analytics | Banner de cookies — botão "Remover não essenciais" desativa analytics (RN-PR07) |
| Retenção limitada | Logs de autenticação: 6 meses (§3 da spec; em produção a retenção é gerenciada pelo Cloud Logging do GCP); registro de eliminação conforme RN-PR01 |
| Segurança do armazenamento | Logs em stdout estruturado, capturados pela infraestrutura gerenciada (Cloud Run → Cloud Logging), com controle de acesso do GCP |
| Revisão periódica | Este LIA deve ser revisado a cada mudança material nos tratamentos BL-09 ou na Política de Privacidade |

## 5. Direitos do titular

O titular pode, a qualquer momento: desativar analytics pelo banner de cookies; solicitar acesso/portabilidade dos seus dados (exportação no Perfil); solicitar a exclusão da conta (purga imediata, RN-P26); e contatar o canal de privacidade indicado na Política de Privacidade para exercer os demais direitos do Art. 18.
