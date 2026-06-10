---
título: LGPD — Guia de Implementação e Verificação de Sistemas
versão: 1.0
data_emissão: 2026-05-16
público_alvo: IA generativa assistindo desenvolvimento e auditoria de sistemas
escopo: sistemas internos (colaboradores) e externos (clientes), contexto Brasil
base_normativa:
  - Lei 13.709/2018 (LGPD) — texto consolidado pós-Lei 13.853/2019
  - Decreto 11.137/2022 (Regulamento de aplicação da LGPD)
  - Resolução CD/ANPD nº 2/2022 (Agentes de pequeno porte)
  - Resolução CD/ANPD nº 4/2023 (Dosimetria de sanções)
  - Resolução CD/ANPD nº 15/2024 (Comunicação de incidentes — RCIS)
  - Resolução CD/ANPD nº 18/2024 (Encarregado)
  - Resolução CD/ANPD nº 19/2024 (Transferência internacional — RTID)
  - ABNT NBR ISO/IEC 27001, 27002, 27701, 29134, 29151, 31000
convenções:
  - "DEVE" = obrigação dura (não cumprir = não conformidade)
  - "DEVERIA" = forte recomendação (desvio exige justificativa registrada)
  - "PODE" = alternativa válida
  - Regras têm ID estável no formato R-<DOMÍNIO>-<NNN> e podem ser citadas
---

# 0. Como usar este documento

Este documento é referência normativa para duas tarefas:

**Tarefa A — Implementação:** ao especificar/codificar funcionalidade nova que trata dados pessoais, percorrer Seções 2 → 17 aplicando as regras `R-*` e cruzando com Seção 18 (checklist de implementação). Cada decisão de design que envolva dado pessoal DEVE citar a base legal (Seção 4) e a(s) regra(s) `R-*` que sustentam.

**Tarefa B — Verificação:** ao auditar sistema existente, percorrer Seção 19 (checklist de verificação) marcando cada item como `OK`, `GAP` ou `N/A com justificativa`. Itens `GAP` viram ações no plano de adequação, com prioridade definida pela criticidade da regra violada (alta para "DEVE", média para "DEVERIA").

**Princípios de leitura:**

1. Quando este documento e a Lei 13.709/2018 divergirem, a Lei prevalece. Reportar a divergência.
2. Resoluções da ANPD prevalecem sobre interpretações deste documento em sua matéria específica.
3. Em ambiguidade, optar pela interpretação mais protetiva ao titular (princípio interpretativo do art. 6º, IX).
4. Toda regra "DEVE" não atendida é não conformidade, mesmo que não enseje multa imediata.
5. Para sistemas internos (colaboradores), aplicar também regras específicas da Seção 14, que se sobrepõem ao caso geral.

---

# 1. Conceitos e definições normativas

## 1.1 Definições-chave (Art. 5º LGPD)

| Termo | Definição operacional | Implicação para sistemas |
|---|---|---|
| **Dado pessoal** | Informação relacionada a pessoa natural identificada ou identificável | Qualquer campo que isole ou permita isolar 1 indivíduo é dado pessoal |
| **Dado pessoal sensível** | Origem racial/étnica, convicção religiosa, opinião política, filiação a sindicato/organização religiosa/filosófica/política, saúde, vida sexual, dado genético ou biométrico (quando vinculado a pessoa natural) | Exige base legal específica (Art. 11) e proteções reforçadas |
| **Titular** | Pessoa natural a quem se referem os dados | Sujeito dos direitos do Art. 18 |
| **Tratamento** | Toda operação com dado pessoal (coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação ou controle, modificação, comunicação, transferência, difusão, extração) | Todo SELECT, INSERT, UPDATE, DELETE, export, log em dado pessoal é tratamento |
| **Controlador** | Quem decide finalidades e meios do tratamento | A empresa é controladora dos dados de clientes e colaboradores |
| **Operador** | Quem trata dados em nome do controlador | Fornecedores SaaS, processadores de pagamento, hospedagem |
| **Encarregado (DPO)** | Canal de comunicação entre controlador, titulares e ANPD (Res. 18/2024) | Sistema DEVE expor contato do encarregado |
| **Agentes de tratamento** | Controlador + Operador | Ambos respondem solidariamente quando geram dano (Art. 42, §1º) |
| **Banco de dados** | Conjunto estruturado de dados pessoais em um ou vários locais | Inclui bases relacionais, NoSQL, planilhas, lakes, logs |
| **Anonimização** | Processo que torna o dado não vinculável a indivíduo, considerados meios técnicos razoáveis | Reversibilidade prática → ainda é dado pessoal (ver Seção 15) |
| **Consentimento** | Manifestação livre, informada e inequívoca pela qual o titular concorda com tratamento para finalidade determinada | Base legal frágil; usar apenas quando nenhuma outra cabe (Seção 4) |
| **Incidente de segurança** | Evento adverso confirmado, relacionado à violação das propriedades de confidencialidade, integridade, disponibilidade e autenticidade da segurança de dados pessoais (Res. 15/2024) | Inclui vazamento, ransomware, acesso indevido, perda física |

## 1.2 Operações de tratamento — mapeamento técnico

```
COLETA          → form submission, API ingestion, web scraping, importação batch
RETENÇÃO        → INSERT/UPDATE em base, gravação em S3/Blob, backup, cache persistente
PROCESSAMENTO   → SELECT/JOIN, ETL, modelos ML, classificação, scoring, decisão automatizada
COMPARTILHAMENTO → API egress, export, integração B2B, transferência a operador
ELIMINAÇÃO      → DELETE, drop table, expiração de blob, descarte físico
ACESSO          → presente em todas as operações; controle de acesso é transversal
```

**R-DEF-001 (DEVE):** Toda operação acima, quando incidir sobre dado pessoal, DEVE ter base legal identificada (Seção 4) e DEVE ser registrável em log de auditoria (Seção 8).

---

# 2. Aplicabilidade da LGPD

## 2.1 Decision tree de aplicabilidade (Art. 3º e 4º)

```
1. O sistema trata dado pessoal de pessoa natural?
   ├─ NÃO → LGPD não se aplica. Documentar avaliação. FIM.
   └─ SIM → 2.

2. Pelo menos uma das condições abaixo é verdadeira?
   (a) tratamento ocorre no território nacional
   (b) tratamento tem por objetivo oferta de bens/serviços a indivíduos no Brasil
   (c) dados foram coletados no território nacional (titulares estavam no Brasil ao coletar)
   ├─ NÃO → LGPD não se aplica. Avaliar GDPR/CCPA conforme jurisdição. FIM.
   └─ SIM → 3.

3. O tratamento está em uma das exceções do Art. 4º?
   (a) particular não econômico
   (b) jornalístico/artístico/acadêmico (limitado)
   (c) segurança pública/defesa/atividades de investigação penal exclusivas
   (d) dados provenientes do exterior em trânsito sem comunicação no Brasil
   ├─ SIM → LGPD não se aplica ao caso. Documentar. FIM.
   └─ NÃO → LGPD APLICA-SE INTEGRALMENTE.
```

**R-APL-001 (DEVE):** Para todo sistema novo, antes do início do desenvolvimento, DEVE existir avaliação documentada de aplicabilidade da LGPD seguindo o decision tree acima.

**R-APL-002 (DEVE):** Se a resposta no item 2 inclui (b) ou (c) e a empresa não possui sede no Brasil, DEVE indicar representante no país (Art. 23, III, da LGPD aplicado por analogia ao setor privado conforme orientação ANPD).

## 2.2 Aplicabilidade ao escopo deste documento

| Cenário | LGPD aplica? | Particularidades |
|---|---|---|
| Sistema externo B2C com clientes brasileiros | Sim | Atenção a direitos do titular, transparência, consentimento quando aplicável |
| Sistema externo B2B (dados de funcionários do cliente) | Sim | A empresa é geralmente operadora ou controladora conjunta — definir contratualmente |
| Sistema interno (intranet, ERP, RH) com dados de colaboradores | Sim | Base legal típica não é consentimento (Seção 14) |
| Sistema interno com dados pseudonimizados de clientes | Sim | Pseudonimização não elide a LGPD; ainda é dado pessoal (Seção 15) |
| Sistema com dados 100% anonimizados (irreversível) | Não, para os dados anonimizados | Avaliação técnica de irreversibilidade DEVE estar documentada |
| Sistema com dados apenas de pessoas jurídicas | Não diretamente | Mas dados de pessoa de contato dentro da PJ são dados pessoais |

---

# 3. Classificação de dados pessoais

## 3.1 Categorias normativas

**C1 — Dado pessoal comum (Art. 5º, I):**
Exemplos: nome, CPF, e-mail, telefone, endereço, IP, cookie identificador, foto de rosto não usada para autenticação biométrica, dados de geolocalização aproximada, dados de relacionamento contratual.

**C2 — Dado pessoal sensível (Art. 5º, II):**
- Origem racial ou étnica
- Convicção religiosa
- Opinião política
- Filiação a sindicato ou a organização de caráter religioso/filosófico/político
- Dado referente à saúde (inclui plano de saúde, atestados, exames, prontuário)
- Dado referente à vida sexual
- Dado genético
- Dado biométrico (quando vinculado a pessoa natural, ex.: digital, face para autenticação, voz)

**C3 — Dado de criança e adolescente (Art. 14):**
Qualquer dado pessoal de menor de 18 anos, com tratamento de menor de 12 anos sujeito a regras adicionais (consentimento de pelo menos um dos pais ou responsável, exceto exceções do §3º).

**C4 — Dado anonimizado:**
Não é dado pessoal **se** a anonimização for tecnicamente irreversível considerando meios e custos razoáveis. Se vinculado a outras bases permitir reidentificação, volta a ser dado pessoal (Art. 12).

**C5 — Dado pseudonimizado:**
Dado em que a identificação foi substituída por identificador artificial, mas a chave de correspondência ainda existe. **É dado pessoal** para fins da LGPD.

## 3.2 Regras de classificação no projeto

**R-CLA-001 (DEVE):** Todo campo persistido em base de dados DEVE estar classificado em uma das categorias C1–C5 no dicionário de dados do sistema.

**R-CLA-002 (DEVE):** Campos C2, C3 DEVEM ser marcados com flag explícita no schema (comentário, tag, classificação em ferramenta de catálogo) e gerar alerta em revisão de código quando referenciados.

**R-CLA-003 (DEVE):** Tratamento de C2 e C3 DEVE ter base legal específica registrada (Art. 11 para sensíveis; Art. 14 para menores) — não basta a base legal genérica do Art. 7º.

**R-CLA-004 (DEVERIA):** Combinações de C1 que possibilitem inferir C2 (ex.: localização frequente em endereço de templo religioso → convicção religiosa; histórico de compras de medicamento → saúde) DEVERIAM ser tratadas como C2.

**R-CLA-005 (DEVE):** Dados financeiros, de autenticação e protegidos por sigilo, embora classificados como C1, DEVEM receber controles equivalentes a C2 quando combinados em larga escala (Res. 15/2024 — categorias de risco/dano relevante).

---

# 4. Bases legais de tratamento

## 4.1 Bases para dados comuns (C1) — Art. 7º

| ID | Base legal | Quando usar | Cuidado |
|---|---|---|---|
| BL-01 | Consentimento (I) | Quando não há outra base e o tratamento é prescindível | Revogável a qualquer tempo; ônus da prova com controlador (Art. 8º) |
| BL-02 | Cumprimento de obrigação legal/regulatória (II) | Há lei/regulamento que exige o tratamento | Citar dispositivo legal específico |
| BL-03 | Tratamento por administração pública para política pública (III) | Exclusivo de setor público | N/A para empresa privada na maioria dos casos |
| BL-04 | Estudos por órgão de pesquisa (IV) | Pesquisa, dados anonimizados sempre que possível | Restrito a órgãos definidos pela LGPD |
| BL-05 | Execução de contrato ou procedimentos preliminares (V) | O titular é parte do contrato (ou pré-contrato) e o dado é necessário para executá-lo | Não cobre marketing pós-contrato sem outra base |
| BL-06 | Exercício regular de direitos em processo (VI) | Defesa em processo judicial, administrativo ou arbitral | Limitar ao estritamente necessário |
| BL-07 | Proteção da vida ou incolumidade física (VII) | Situação de risco à vida do titular ou terceiro | Excepcional |
| BL-08 | Tutela da saúde por profissional/serviço de saúde (VIII) | Procedimento por profissional de saúde, serviços de saúde, autoridade sanitária | Restrito ao contexto de saúde |
| BL-09 | Legítimo interesse do controlador ou terceiro (IX) | Interesse legítimo, balanceando direitos do titular | Exige teste LIA (Legitimate Interest Assessment) documentado; não vale para C2 |
| BL-10 | Proteção do crédito (X) | Bureaus de crédito, scoring, prevenção a fraude | Observar leis específicas (Cadastro Positivo etc.) |

## 4.2 Bases para dados sensíveis (C2) — Art. 11

C2 só pode ser tratado com **uma das seguintes**:

| ID | Base legal | Característica |
|---|---|---|
| BLS-01 | Consentimento específico e destacado para finalidades específicas (Art. 11, I) | Mais rigoroso que consentimento de C1 |
| BLS-02 | Cumprimento de obrigação legal/regulatória (Art. 11, II, a) | — |
| BLS-03 | Tratamento por administração pública (Art. 11, II, b) | Setor público |
| BLS-04 | Estudos por órgão de pesquisa, garantida anonimização sempre que possível (Art. 11, II, c) | — |
| BLS-05 | Exercício regular de direitos em processo (Art. 11, II, d) | — |
| BLS-06 | Proteção da vida ou incolumidade física (Art. 11, II, e) | — |
| BLS-07 | Tutela da saúde por profissional/serviço/autoridade sanitária (Art. 11, II, f) | — |
| BLS-08 | Garantia da prevenção à fraude e à segurança do titular (Art. 11, II, g) | Usado para autenticação biométrica, AML, KYC |

**Não existe "legítimo interesse" como base para C2.**

## 4.3 Decision tree de escolha da base legal

```
1. O tratamento envolve dado sensível (C2)?
   ├─ SIM → usar Art. 11 (BLS-01 a BLS-08). Pular para passo 4.
   └─ NÃO → 2.

2. Há lei/regulamento que obriga o tratamento?
   ├─ SIM → BL-02 (obrigação legal). Citar dispositivo. FIM.
   └─ NÃO → 3.

3. O dado é estritamente necessário para executar contrato com o titular
   (incluindo etapas pré-contratuais a pedido do titular)?
   ├─ SIM → BL-05 (execução de contrato). FIM.
   └─ NÃO → 4.

4. O tratamento é para proteção da vida, tutela de saúde, exercício de direitos
   em processo, ou proteção do crédito?
   ├─ SIM → BL-07, BL-08, BL-06 ou BL-10 conforme caso. FIM.
   └─ NÃO → 5.

5. O tratamento atende interesse legítimo do controlador ou terceiro,
   respeitadas expectativas legítimas do titular?
   ├─ Realizar teste LIA (necessidade × balanceamento × salvaguardas).
   │   Resultado favorável? → BL-09. Documentar LIA. FIM.
   └─ NÃO → 6.

6. O titular fornece consentimento livre, informado, inequívoco,
   destacado de outras cláusulas, revogável?
   ├─ SIM → BL-01. Implementar registro de consentimento (Seção 4.4). FIM.
   └─ NÃO → Tratamento não pode ocorrer. Redesenhar.
```

## 4.4 Requisitos sistêmicos por base legal

**R-BAS-001 (DEVE):** Toda operação de tratamento DEVE ter ao menos uma base legal registrada no ROPA (Seção 11), associada à finalidade específica.

**R-BAS-002 (DEVE):** Quando a base for **BL-01 (consentimento)**, o sistema DEVE:
- registrar o ato de consentimento com timestamp, identificador do titular, versão do texto consentido, finalidade, canal de coleta e evidência (hash do conteúdo apresentado);
- oferecer mecanismo de revogação com fricção equivalente à coleta (não pode ser mais difícil revogar que consentir);
- propagar a revogação para todos os sistemas downstream em até 15 dias úteis;
- bloquear o tratamento dependente do consentimento imediatamente após a revogação;
- conservar o log do consentimento revogado por prazo compatível com a prescrição de eventual ação (mínimo 5 anos após revogação).

**R-BAS-003 (DEVE):** Quando a base for **BL-05 (contrato)**, o sistema DEVE limitar o tratamento aos campos estritamente necessários à execução contratual. Campos coletados "para o caso de precisarmos" violam o princípio da necessidade (Art. 6º, III).

**R-BAS-004 (DEVE):** Quando a base for **BL-09 (legítimo interesse)**, DEVE existir LIA documentada antes do go-live, contendo:
1. Identificação do interesse legítimo (concreto, não genérico);
2. Necessidade — o tratamento é meio adequado e menos invasivo possível;
3. Balanceamento — expectativas razoáveis do titular vs. interesse;
4. Salvaguardas adotadas (minimização, transparência, opt-out, etc.);
5. Resultado e revisão programada.

**R-BAS-005 (DEVE):** Quando a base for **BL-02 (obrigação legal)**, o sistema DEVE citar o dispositivo legal específico (lei, número de artigo) no ROPA, não apenas "exigência legal".

**R-BAS-006 (DEVE):** Mudança de finalidade após coleta exige nova avaliação de base legal. Reuso de dados para finalidade incompatível com a original é vedado (princípio da finalidade, Art. 6º, I).

**R-BAS-007 (DEVE):** Dado coletado sob BL-01 não pode ser tratado sob outra base se o consentimento for revogado, exceto se houver base legal independente preexistente e documentada.

---

# 5. Princípios da LGPD operacionalizados (Art. 6º)

Cada princípio do Art. 6º traduzido em requisitos verificáveis.

## 5.1 Finalidade (Art. 6º, I)

> Realização do tratamento para propósitos legítimos, específicos, explícitos e informados ao titular, sem possibilidade de tratamento posterior de forma incompatível com essas finalidades.

**R-PRI-001 (DEVE):** Toda finalidade DEVE estar declarada em texto específico (não "para melhorar nossos serviços"), em granularidade que permita ao titular distinguir tratamentos diferentes.

**R-PRI-002 (DEVE):** Não pode haver coleta cujo único propósito é "talvez precisaremos". Campos sem finalidade ativa DEVEM ser removidos do schema.

**Verificação:** existem campos coletados que não estão referenciados em finalidade declarada? → GAP.

## 5.2 Adequação (Art. 6º, II)

> Compatibilidade do tratamento com as finalidades informadas ao titular.

**R-PRI-003 (DEVE):** Para cada operação de tratamento (consulta, exportação, modelo ML, integração), DEVE ser possível mapear para uma das finalidades declaradas.

**Verificação:** existe operação que não se enquadra em nenhuma finalidade declarada? → GAP grave.

## 5.3 Necessidade (Art. 6º, III) — minimização

> Limitação do tratamento ao mínimo necessário para a realização de suas finalidades, com abrangência dos dados pertinentes, proporcionais e não excessivos.

**R-PRI-004 (DEVE):** Coleta DEVE ser justificada campo a campo. Formulários DEVEM diferenciar campos obrigatórios (necessários à finalidade) de opcionais.

**R-PRI-005 (DEVE):** Acesso a dados pessoais por sistemas/usuários internos DEVE seguir princípio do menor privilégio. Acesso amplo "porque é mais prático" viola a necessidade.

**R-PRI-006 (DEVERIA):** Quando agregação ou pseudonimização atender à finalidade, DEVERIA ser preferida ao dado bruto.

## 5.4 Livre acesso (Art. 6º, IV)

> Garantia, aos titulares, de consulta facilitada e gratuita sobre a forma e a duração do tratamento, bem como sobre a integralidade de seus dados pessoais.

**R-PRI-007 (DEVE):** O sistema DEVE oferecer ao titular meio para consultar quais dados seus estão armazenados, em prazo de até 15 dias da requisição (Art. 19, §3º). Ver Seção 7.

## 5.5 Qualidade dos dados (Art. 6º, V)

> Exatidão, clareza, relevância e atualização dos dados, de acordo com a necessidade e para o cumprimento da finalidade de seu tratamento.

**R-PRI-008 (DEVE):** O sistema DEVE permitir ao titular corrigir dados incorretos, incompletos ou desatualizados.

**R-PRI-009 (DEVERIA):** Dados com prazo de validade conhecido (endereço, profissão, telefone) DEVERIAM ter mecanismo de revalidação periódica.

## 5.6 Transparência (Art. 6º, VI)

> Garantia, aos titulares, de informações claras, precisas e facilmente acessíveis sobre a realização do tratamento e os respectivos agentes de tratamento, observados os segredos comercial e industrial.

**R-PRI-010 (DEVE):** Sistema voltado a titular DEVE expor, em local acessível (ex.: política de privacidade, página de configurações):
- identificação do controlador e contato;
- identificação do encarregado e contato (Res. 18/2024);
- finalidades específicas do tratamento;
- forma e duração do tratamento;
- compartilhamentos e operadores;
- direitos do titular (Art. 18) e como exercê-los;
- base legal de cada tratamento.

**R-PRI-011 (DEVE):** Política de privacidade DEVE ser versionada. Mudanças relevantes em finalidades, compartilhamentos ou bases legais DEVEM ser comunicadas ativamente aos titulares.

## 5.7 Segurança (Art. 6º, VII)

> Utilização de medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão.

Detalhado na Seção 8.

## 5.8 Prevenção (Art. 6º, VIII)

> Adoção de medidas para prevenir a ocorrência de danos em virtude do tratamento.

**R-PRI-012 (DEVE):** Projetos novos DEVEM passar por avaliação de risco (Seção 12) antes do go-live. Quando alto risco, DEVE-se elaborar RIPD.

## 5.9 Não discriminação (Art. 6º, IX)

> Impossibilidade de realização do tratamento para fins discriminatórios ilícitos ou abusivos.

**R-PRI-013 (DEVE):** Sistemas que tomam decisões automatizadas com efeito jurídico ou impacto relevante sobre o titular (Art. 20) DEVEM:
- documentar critérios e variáveis utilizadas;
- permitir revisão por pessoa natural sob solicitação;
- testar viés para variáveis sensíveis (raça, gênero, idade, território) mesmo quando estas não são input explícito (atenção a proxies).

## 5.10 Responsabilização e prestação de contas (Art. 6º, X) — accountability

> Demonstração, pelo agente, da adoção de medidas eficazes e capazes de comprovar a observância e o cumprimento das normas de proteção de dados pessoais e, inclusive, da eficácia dessas medidas.

**R-PRI-014 (DEVE):** Toda regra `R-*` deste documento que se aplica a um sistema DEVE ter evidência de implementação registrada (código, configuração, log, documento, screenshot — algo verificável por auditoria).

---

# 6. Privacy by Design e by Default

A LGPD positiva privacy by design no Art. 46 (segurança desde a fase de concepção). Operacionalização:

## 6.1 Os 7 princípios (Cavoukian) traduzidos em requisitos

**6.1.1 Proativo, não reativo; preventivo, não corretivo**

**R-PBD-001 (DEVE):** Decisões sobre tratamento de dados pessoais DEVEM ser tomadas na fase de design, não retrofitadas pós-lançamento. Stories que envolvam dado pessoal DEVEM ter critério de aceitação relacionado à LGPD.

**6.1.2 Privacidade como configuração padrão**

**R-PBD-002 (DEVE):** Quando houver opção de coleta/compartilhamento/uso adicional de dados, o padrão (default) DEVE ser o mais restritivo. Opt-in para tratamentos não essenciais; nunca opt-out pré-marcado.

**R-PBD-003 (DEVE):** Cookies não essenciais DEVEM exigir consentimento ativo antes de serem ativados (banner com escolha real, não "ao continuar navegando você aceita").

**6.1.3 Privacidade incorporada ao design**

**R-PBD-004 (DEVE):** Arquitetura DEVE separar dados pessoais de identificadores quando tecnicamente viável (ex.: tokenização para sistemas analíticos).

**R-PBD-005 (DEVERIA):** Bases de produção e desenvolvimento/teste DEVERIAM usar dados sintéticos ou anonimizados. Uso de produção em ambientes não produtivos é exceção que exige base legal e controle de acesso equivalente.

**6.1.4 Funcionalidade total — soma positiva**

**R-PBD-006 (DEVERIA):** Quando houver aparente trade-off privacidade × funcionalidade, DEVERIA buscar redesenho que atenda ambos antes de optar por um sacrifício.

**6.1.5 Segurança ponta a ponta**

Ver Seção 8.

**6.1.6 Visibilidade e transparência**

Ver R-PRI-010 e Seção 7.

**6.1.7 Respeito à privacidade do usuário**

**R-PBD-007 (DEVE):** Interfaces DEVEM evitar dark patterns que induzam consentimento, compartilhamento ou retenção que o titular não escolheria informadamente. Vedados: pré-seleção de opções intrusivas, fricção assimétrica (consentir é fácil, revogar é difícil), linguagem ambígua sobre o impacto da escolha.

## 6.2 Privacy by Default — regras concretas

**R-PBD-008 (DEVE):** Configurações de perfil voltadas ao titular DEVEM iniciar no estado de menor exposição. Tornar perfil público, ativar localização, permitir indexação por buscador, compartilhar com parceiros — tudo opt-in.

**R-PBD-009 (DEVE):** Retenção padrão DEVE ser a mínima necessária à finalidade. Estender retenção exige justificativa documentada (Seção 16).

**R-PBD-010 (DEVE):** Logs e telemetria DEVEM coletar o mínimo possível com vinculação a indivíduo. Quando agregado serve, agregado é o padrão.

## 6.3 Regras para UX e interfaces de coleta

**R-PBD-011 (DEVE):** Formulários DEVEM:
- distinguir visualmente campos obrigatórios de opcionais;
- exibir junto a cada campo (ou a uma só vez antes do envio) a finalidade do dado;
- não usar campos ocultos para coleta de informação não declarada;
- evitar coleta de dado que não seja necessário no momento (just-in-time data minimization).

**R-PBD-012 (DEVE):** Aviso de privacidade em ponto de coleta DEVE ser:
- claro (linguagem comum, não jurídica);
- conciso (resumo executivo + link para política completa);
- acessível (cumprir WCAG 2.1 AA quando possível);
- camada-primeira (camada 1 contém informações essenciais; aprofundamento sob demanda).

---

# 7. Direitos do titular — implementação técnica

O Art. 18 garante direitos que o sistema DEVE viabilizar operacionalmente. Prazo geral de atendimento: 15 dias (Art. 19, §3º).

## 7.1 Quadro de direitos × requisitos

| ID | Direito (Art. 18) | Requisito sistêmico mínimo | Prazo |
|---|---|---|---|
| D-01 | Confirmação da existência de tratamento (I) | Endpoint/fluxo que responde sim/não para "vocês tratam meus dados?" | 15 dias |
| D-02 | Acesso aos dados (II) | Funcionalidade que retorna ao titular cópia de seus dados em formato legível | 15 dias |
| D-03 | Correção de dados incompletos, inexatos ou desatualizados (III) | Funcionalidade de edição direta ou fluxo de solicitação com correção propagada | 15 dias |
| D-04 | Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade (IV) | Fluxo de solicitação com avaliação técnico-jurídica e execução | 15 dias |
| D-05 | Portabilidade a outro fornecedor (V) | Exportação em formato estruturado e interoperável (JSON/CSV padrão setorial), excluindo dados anonimizados ou de uso exclusivo do controlador | 15 dias |
| D-06 | Eliminação dos dados tratados com consentimento (VI) | Funcionalidade de "excluir minha conta/dados" que de fato apaga, respeitadas as exceções legais (Art. 16) | 15 dias |
| D-07 | Informação sobre entidades públicas e privadas com as quais houve compartilhamento (VII) | Listagem clara de operadores e parceiros, atualizada | 15 dias |
| D-08 | Informação sobre possibilidade de não consentir e suas consequências (VIII) | Disclosure no ponto de coleta | Em tempo real |
| D-09 | Revogação do consentimento (IX) | Funcionalidade equivalente ao opt-in original em fricção | 15 dias para propagação |
| D-10 | Revisão de decisões automatizadas (Art. 20) | Canal de solicitação de revisão por pessoa natural quando há decisão automatizada com efeitos significativos | 15 dias |

## 7.2 Fluxo obrigatório de atendimento a requisições

**R-DIR-001 (DEVE):** O sistema (ou ecossistema) DEVE oferecer canal único, identificável, acessível para que o titular exerça os direitos do Art. 18.

**R-DIR-002 (DEVE):** O canal DEVE:
- permitir identificação razoável do solicitante (sem exigir dados além do necessário para confirmar identidade);
- aceitar pedido de qualquer um dos direitos D-01 a D-10;
- emitir comprovante de protocolo com data, código de rastreio e prazo estimado;
- registrar log com timestamp, tipo de pedido, decisão e prazo de execução.

**R-DIR-003 (DEVE):** Resposta ao titular DEVE:
- ocorrer em até 15 dias (Art. 19, §3º);
- ser em linguagem clara;
- explicar a decisão (deferida, indeferida, parcialmente atendida) e os fundamentos;
- quando indeferida, indicar caminhos (revisão interna, encarregado, ANPD, judiciário).

**R-DIR-004 (DEVE):** Identificação do titular para fins de exercício de direito DEVE usar mecanismo proporcional ao risco. Pedir RG digitalizado por e-mail para responder "confirmação de cadastro" é desproporcional. Para conta autenticada, usar a própria autenticação.

## 7.3 Implementação técnica do direito de eliminação (D-06)

**R-DIR-005 (DEVE):** "Eliminação" DEVE significar:
- remoção dos dados pessoais das bases produtivas, caches e índices de busca;
- propagação para sistemas downstream (CRM, BI, data lake, backups operacionais quando viável);
- documentação do que não foi eliminado e por quê (exceções do Art. 16: cumprimento de obrigação legal, estudo por órgão de pesquisa anonimizado, transferência a terceiro autorizada, uso exclusivo do controlador anonimizado).

**R-DIR-006 (DEVE):** Backups históricos que ainda contenham os dados DEVEM ter procedimento documentado para que, em caso de restauração, a eliminação seja reaplicada imediatamente.

**R-DIR-007 (DEVERIA):** O sistema DEVERIA implementar "soft delete + purge" com prazo definido (ex.: 30 dias para reversão por erro de pedido, depois purga definitiva), salvo quando legislação setorial exigir guarda.

## 7.4 Implementação técnica do direito de portabilidade (D-05)

**R-DIR-008 (DEVE):** Portabilidade DEVE incluir dados fornecidos pelo titular e dados observados pelo controlador, em formato:
- estruturado;
- comum (padrão de mercado/setor);
- legível por máquina;
- com dicionário/metadados explicando os campos.

**R-DIR-009 (DEVE):** Não DEVEM ser portados:
- dados anonimizados;
- dados de uso exclusivo do controlador (ex.: scoring proprietário);
- dados de terceiros que estão na conta do titular sem consentimento daqueles.

## 7.5 Implementação técnica da revisão de decisão automatizada (D-10)

**R-DIR-010 (DEVE):** Decisão automatizada com efeito sobre titular (negativa de crédito, recusa de cadastro, ranqueamento que impacta acesso a oportunidade, precificação dinâmica, moderação automática) DEVE:
- estar declarada na política de privacidade;
- ser revisável por solicitação do titular;
- ter pessoa natural com competência para reavaliar;
- ter prazo de até 15 dias para resposta sobre a revisão.

**R-DIR-011 (DEVE):** O controlador DEVE fornecer, quando solicitado, informações claras e adequadas a respeito dos critérios e procedimentos utilizados para a decisão automatizada, observados os segredos comercial e industrial (Art. 20, §1º).

---

# 8. Segurança da informação — controles mínimos

LGPD não prescreve controles específicos; remete a "padrões técnicos mínimos a serem estabelecidos pela ANPD" (Art. 46, §1º). Na ausência, adotam-se referenciais ISO 27001/27002/27701 e CIS Controls.

## 8.1 Controles técnicos

### 8.1.1 Controle de acesso (autenticação e autorização)

**R-SEG-001 (DEVE):** Todo acesso a dado pessoal DEVE exigir autenticação. Acesso anônimo a dado pessoal é vedado, exceto quando o próprio dado seja deliberadamente público por base legal.

**R-SEG-002 (DEVE):** Acesso DEVE seguir princípio do menor privilégio, com autorização baseada em papel (RBAC) ou atributo (ABAC).

**R-SEG-003 (DEVE):** Acesso a C2 (sensíveis) e a grandes volumes de C1 DEVE exigir autenticação forte (MFA) para usuários internos.

**R-SEG-004 (DEVE):** Acessos privilegiados (DBA, admin de produção, acesso direto a backups) DEVEM:
- ser nominais (não compartilhados);
- ser registrados com gravação de comandos/queries quando viável;
- ser concedidos por tempo limitado quando possível (just-in-time access);
- ser revisados periodicamente (mínimo trimestral).

**R-SEG-005 (DEVE):** Credenciais (senhas, tokens, chaves de API) DEVEM ser armazenadas com hashing forte (senhas: bcrypt/argon2/scrypt; tokens: cifrados em vault) e nunca em código-fonte ou logs.

### 8.1.2 Criptografia

**R-SEG-006 (DEVE):** Dados pessoais em trânsito DEVEM trafegar sob TLS 1.2+ (preferencialmente 1.3). HTTP simples para tráfego com dado pessoal é não conformidade.

**R-SEG-007 (DEVE):** Dados sensíveis (C2) em repouso DEVEM ser criptografados (encryption-at-rest no nível do storage no mínimo; criptografia no nível da aplicação para campos críticos como senha, token de autenticação, dado biométrico).

**R-SEG-008 (DEVERIA):** Dados C1 em repouso DEVERIAM ter encryption-at-rest no nível do storage.

**R-SEG-009 (DEVE):** Chaves criptográficas DEVEM ser gerenciadas em KMS/HSM. Rotação de chaves DEVE seguir cronograma (mínimo anual, ou imediato em caso de suspeita de comprometimento).

### 8.1.3 Registro e auditoria (logging)

**R-SEG-010 (DEVE):** Operações de tratamento sobre dado pessoal DEVEM gerar log com no mínimo:
- timestamp (com timezone);
- identidade do agente (usuário, sistema, serviço);
- operação realizada (leitura, escrita, exclusão, exportação);
- identificador do registro acessado (ou critério de filtro, no caso de queries);
- resultado (sucesso/falha);
- IP/origem.

**R-SEG-011 (DEVE):** Logs DEVEM ser imutáveis (write-once ou com integridade verificável), com retenção mínima de 6 meses para logs operacionais e mínima compatível com obrigações específicas para logs de auditoria (geralmente 5 anos).

**R-SEG-012 (DEVE):** Logs NÃO DEVEM conter, em texto claro:
- senhas, tokens de autenticação, chaves;
- dados sensíveis (C2) — quando registro for necessário, usar referência (ID) ao registro, não o conteúdo;
- número completo de cartão de crédito (PCI-DSS).

**R-SEG-013 (DEVE):** Sistema DEVE expor relatório de acessos ao titular, mediante solicitação (suporte ao D-02).

### 8.1.4 Segurança de aplicação

**R-SEG-014 (DEVE):** Aplicações DEVEM ser desenvolvidas com práticas mínimas anti-OWASP Top 10. Validação de input, prevenção a SQLi, XSS, CSRF, IDOR, SSRF, deserialização insegura são obrigatórios.

**R-SEG-015 (DEVE):** Dependências (bibliotecas, frameworks) DEVEM ser monitoradas por CVEs e atualizadas com SLA proporcional à severidade. Vulnerabilidades críticas em componentes que tratam dado pessoal: patch ou mitigação em ≤7 dias.

**R-SEG-016 (DEVE):** Sistemas DEVEM passar por análise de segurança antes do go-live: SAST + DAST + revisão manual. Para sistemas que tratam C2 ou grande volume de C1, DEVE haver teste de intrusão (pentest) periódico (mínimo anual).

**R-SEG-017 (DEVE):** Comunicação entre microserviços DEVE ser autenticada (mTLS, JWT verificável). Confiança implícita por estar "na rede interna" é vedada (zero-trust).

### 8.1.5 Backup e continuidade

**R-SEG-018 (DEVE):** Dados pessoais DEVEM ter backup com:
- ciclo definido (RPO documentado);
- teste de restauração periódico (mínimo semestral);
- criptografia equivalente à dos dados em produção;
- isolamento físico/lógico (proteção contra ransomware: cópia offline ou imutável).

**R-SEG-019 (DEVE):** Plano de continuidade e recuperação de desastres DEVE incluir cenários de comprometimento de dados pessoais (vazamento, ransomware, destruição) com playbook conectado ao processo de comunicação de incidente (Seção 9).

### 8.1.6 Segregação de ambientes

**R-SEG-020 (DEVE):** Ambientes de desenvolvimento, homologação e produção DEVEM ser logicamente segregados. Credenciais não DEVEM ser compartilhadas entre ambientes.

**R-SEG-021 (DEVE):** Dados de produção em ambientes não produtivos é exceção, exige justificativa, aprovação do encarregado e mesmos controles de produção, com mascaramento sempre que possível.

## 8.2 Controles organizacionais

**R-SEG-022 (DEVE):** Política de segurança da informação DEVE existir, ser aprovada pela alta direção, comunicada e treinada periodicamente.

**R-SEG-023 (DEVE):** Contratos com operadores DEVEM conter cláusulas mínimas de proteção de dados (Seção 17), incluindo direito de auditoria, comunicação de incidentes, devolução/eliminação ao término.

**R-SEG-024 (DEVE):** Onboarding de colaborador com acesso a dado pessoal DEVE incluir treinamento em LGPD; offboarding DEVE incluir revogação imediata de acessos.

**R-SEG-025 (DEVERIA):** Programa de governança em privacidade (Art. 50, §2º) DEVERIA estar implementado e demonstrável.

## 8.3 Mapeamento sucinto com ISO/IEC 27701 / 27002

| Controle deste guia | ISO 27001 Anexo A / 27002:2022 | ISO 27701 |
|---|---|---|
| R-SEG-001 a 005 | 5.15–5.18, 8.2, 8.5 | 6.6, 7.2.1 |
| R-SEG-006 a 009 | 8.24, 8.26 | 7.4.5, 8.4.5 |
| R-SEG-010 a 013 | 8.15, 8.17 | 7.5.4 |
| R-SEG-014 a 017 | 8.25–8.29 | 7.4 |
| R-SEG-018 a 019 | 8.13, 5.29, 5.30 | 7.4 |
| R-SEG-022 a 025 | 5.1–5.4, 5.31, 5.34, 6.3 | 6.2, 6.5 |

---

# 9. Tratamento de incidentes de segurança

Base normativa: Art. 48 LGPD + Resolução CD/ANPD nº 15/2024 (Regulamento de Comunicação de Incidente de Segurança — RCIS).

## 9.1 Definição de incidente notificável

**Incidente de segurança** (Res. 15/2024, Art. 4º, I): evento adverso confirmado, relacionado à violação das propriedades de confidencialidade, integridade, disponibilidade e autenticidade da segurança de dados pessoais.

**Nem todo incidente é notificável.** É notificável aquele que **possa acarretar risco ou dano relevante aos titulares**.

### 9.1.1 Critérios cumulativos de risco/dano relevante (Res. 15/2024)

Risco/dano é relevante quando o incidente afeta significativamente interesses e direitos fundamentais dos titulares E envolve pelo menos um dos critérios abaixo:

1. dados pessoais sensíveis (C2);
2. dados de crianças, adolescentes ou idosos;
3. dados financeiros;
4. dados de autenticação em sistemas;
5. dados protegidos por sigilo legal, judicial ou profissional;
6. dados em larga escala.

**R-INC-001 (DEVE):** Sistema/organização DEVE ter procedimento documentado para avaliar incidentes contra os critérios acima e decidir sobre notificação à ANPD e aos titulares.

## 9.2 Prazos de comunicação

| Destinatário | Prazo | Base |
|---|---|---|
| ANPD | 3 dias úteis a partir do conhecimento de que o incidente afetou dados pessoais | Res. 15/2024, Art. 6º |
| Titulares afetados | 3 dias úteis (sem demora injustificada; mais urgência se risco iminente) | Res. 15/2024, Art. 9º |
| Operadores → Controlador | Sem demora injustificada | Res. 15/2024 |
| Agente de pequeno porte | Prazos em dobro (6 dias úteis) | Res. 15/2024 + Res. 2/2022 |

**Complemento à comunicação inicial:** até 20 dias úteis contados da primeira comunicação, de forma fundamentada.

## 9.3 Conteúdo mínimo da comunicação

**À ANPD:**
- natureza dos dados envolvidos;
- gravidade do incidente;
- possíveis consequências para titulares;
- medidas técnicas e organizacionais de segurança existentes;
- avaliação dos riscos para direitos e liberdades;
- conformidade com normas de proteção de dados.

**Ao titular:**
- natureza e categoria dos dados afetados;
- número de titulares afetados;
- extensão do dano potencial;
- possibilidade de impacto negativo;
- medidas de segurança adotadas antes e após o incidente;
- probabilidade de ocorrência de dano;
- duração e extensão geográfica;
- capacidade de reverter ou mitigar efeitos;
- recomendações práticas ao titular (trocar senha, monitorar conta, etc.).

**R-INC-002 (DEVE):** Comunicação ao titular DEVE ser substantiva e acionável, não genérica. "Houve um incidente envolvendo seus dados" sem detalhes não cumpre o Art. 48.

## 9.4 Requisitos sistêmicos para detecção e resposta

**R-INC-003 (DEVE):** Sistema/ambiente DEVE ter monitoração capaz de detectar:
- acesso anômalo a dados pessoais (volume, horário, padrão);
- exfiltração (egress incomum);
- falhas de integridade (alteração não autorizada);
- indisponibilidade prolongada de bases.

**R-INC-004 (DEVE):** Plano de resposta a incidentes DEVE existir, ser testado periodicamente (mínimo anual), e conter:
- papéis e responsáveis (incluindo encarregado);
- fluxo de escalação;
- critérios para acionar avaliação de notificação;
- modelos de comunicação à ANPD e ao titular;
- canal de comunicação à ANPD (peticionamento SEI!ANPD via gov.br).

**R-INC-005 (DEVE):** Operadores (fornecedores) DEVEM ser contratualmente obrigados a comunicar incidentes ao controlador sem demora injustificada, com conteúdo suficiente para o controlador cumprir o prazo de 3 dias úteis perante a ANPD.

## 9.5 Registro obrigatório

**R-INC-006 (DEVE):** Controlador DEVE manter registro de TODO incidente de segurança, inclusive os não comunicados à ANPD/titulares, por **prazo mínimo de 5 anos** (Res. 15/2024, Art. 10).

Conteúdo mínimo do registro:
1. data e horário da ocorrência e do conhecimento pelo controlador;
2. circunstâncias;
3. categoria e número de titulares afetados;
4. categorias e quantidade de dados afetados;
5. medidas técnicas e organizacionais aplicadas;
6. consequências e efeitos para titulares;
7. forma e conteúdo da comunicação, se houve;
8. motivos da ausência de comunicação, quando for o caso (essencial — é a defesa do controlador em fiscalização).

**R-INC-007 (DEVE):** Decisão de **não notificar** DEVE ser justificada por escrito no registro, com base nos critérios da Res. 15/2024. Esta é a única defesa em caso de fiscalização da ANPD desencadeada por outro canal (denúncia, imprensa).

## 9.6 Timeline operacional sugerida

```
T0 — incidente descoberto
0–4h  → contenção: isolar sistemas, interromper exfiltração, preservar evidência
4–24h → avaliação inicial: há dados pessoais? quais? quantos? gravidade?
24–48h → acionar encarregado, decidir sobre notificação (critérios Res. 15/2024)
até 3 dias úteis → comunicar ANPD e titulares se aplicável; documentar caso não aplicável
até 20 dias úteis → comunicação complementar à ANPD com informações adicionais
pós-incidente → registro definitivo, lições aprendidas, ajustes no sistema
```

---

# 10. Transferência internacional de dados

Base normativa: Arts. 33 a 36 LGPD + Resolução CD/ANPD nº 19/2024 (Regulamento de Transferência Internacional de Dados — RTID).

## 10.1 Quando se configura transferência internacional (TID)

**Configura TID:** envio, compartilhamento ou disponibilização de acesso a dados pessoais por agente de tratamento (exportador) a outro agente de tratamento (importador) localizado em país estrangeiro ou organismo internacional.

**Não configura TID (mas é coleta internacional):** coleta direta do titular por agente localizado no exterior (ex.: usuário brasileiro preenche formulário em site hospedado no exterior).

**Cuidados práticos para sistemas:**
- Hospedagem em cloud com região fora do Brasil → TID.
- SaaS estrangeiro acessando dados → TID.
- Suporte técnico offshore com acesso a base → TID.
- CDN com cache em outros países → TID quando armazena/processa dado pessoal.
- Backup em região internacional → TID.

## 10.2 Mecanismos válidos (Res. 19/2024)

| Mecanismo | Quando aplica | Status |
|---|---|---|
| Decisão de adequação da ANPD | País reconhecido como tendo proteção equivalente | Nenhum país reconhecido até o momento (verificar atual) |
| Cláusulas-padrão contratuais (SCC) da ANPD | Caso geral; usar Anexo II da Res. 19/2024 sem alteração | Disponível; prazo de adequação dos contratos: 12 meses da publicação |
| Cláusulas contratuais específicas | Quando SCC não couber; exige aprovação da ANPD | Sob demanda |
| Normas Corporativas Globais (BCRs) | Transferência intragrupo de empresas | Exige aprovação da ANPD |
| Certificações, códigos de conduta, selos | Reconhecidos pela ANPD | Quando emitidos |
| Cooperação jurídica internacional / proteção da vida / política pública / autorização específica | Hipóteses do Art. 33, II–IX | Caso a caso |

## 10.3 Requisitos sistêmicos

**R-TID-001 (DEVE):** Mapeamento de dados pessoais DEVE identificar todas as transferências internacionais, com:
- exportador e importador;
- país do importador;
- categorias de dados;
- finalidade;
- mecanismo de transferência aplicado;
- volume estimado.

**R-TID-002 (DEVE):** Contratos com operadores e parceiros que envolvam TID DEVEM:
- conter SCC do Anexo II da Res. 19/2024 (sem alteração de texto além dos campos editáveis), OU
- usar mecanismo alternativo validado;
- prazo: 12 meses contados da publicação da Res. 19/2024 para adequação dos contratos preexistentes (verificar se o prazo já se esgotou na data de uso deste guia).

**R-TID-003 (DEVE):** Comunicação de incidentes nas SCC: a parte designada DEVE comunicar à ANPD e aos titulares em 3 dias úteis (cláusula 16 das SCC).

**R-TID-004 (DEVE):** Antes de contratar SaaS/cloud com região fora do Brasil, DEVE-se:
1. avaliar se há base legal para a TID (Art. 33);
2. selecionar mecanismo (SCC é o padrão);
3. registrar no ROPA;
4. avaliar risco no RIPD quando aplicável.

**R-TID-005 (DEVERIA):** Quando o tratamento envolver dados sensíveis ou larga escala, DEVERIA-se preferir hospedagem em região Brasil ou país futuramente reconhecido como adequado, mesmo havendo mecanismo contratual.

## 10.4 Hipóteses dispensadas (Art. 33)

Mesmo sem decisão de adequação ou SCC, TID é admitida quando:
- necessária para cooperação jurídica internacional entre órgãos públicos;
- proteção da vida ou incolumidade física;
- execução de política pública prevista em lei;
- titular fornece consentimento específico e em destaque para a transferência (com informação prévia clara sobre o caráter internacional);
- cumprimento de obrigação legal/regulatória pelo controlador;
- execução de contrato com o titular ou procedimentos preliminares relacionados (a pedido do titular);
- exercício regular de direitos em processo;
- autorização específica da ANPD.


---

# 11. Registro de operações de tratamento (ROPA)

Base: Art. 37 LGPD.

> O controlador e o operador devem manter registro das operações de tratamento de dados pessoais que realizarem, especialmente quando baseado no legítimo interesse.

## 11.1 Obrigatoriedade

**R-ROP-001 (DEVE):** Controlador e operador DEVEM manter ROPA por escrito (físico ou eletrônico), atualizado e disponível à ANPD em fiscalização.

## 11.2 Conteúdo mínimo por operação

| Campo | Descrição |
|---|---|
| Identificação | Nome interno da operação/processo |
| Controlador | Razão social, CNPJ, contato |
| Encarregado (DPO) | Nome (ou função), contato |
| Operadores envolvidos | Razão social, contato, papel, localidade |
| Finalidade | Específica, não genérica |
| Base legal | Uma das BL-01 a BL-10 ou BLS-01 a BLS-08, com fundamentação |
| Categorias de titulares | Clientes, colaboradores, visitantes, fornecedores, etc. |
| Categorias de dados | Mapeamento C1/C2/C3 com lista de campos |
| Compartilhamento com terceiros | Quem, finalidade, base legal |
| Transferência internacional | Países, mecanismo (Seção 10) |
| Tempo de retenção | Prazo e critério (Seção 16) |
| Medidas de segurança | Resumo dos controles (Seção 8) |
| Atualização | Data da última revisão |

## 11.3 Como o sistema deve apoiar

**R-ROP-002 (DEVE):** Cada sistema/produto DEVE manter ficha técnica de tratamento atualizada que alimente o ROPA centralizado da empresa.

**R-ROP-003 (DEVE):** Mudanças em finalidade, base legal, compartilhamento, transferência internacional ou retenção DEVEM disparar revisão e atualização do ROPA antes do go-live.

**R-ROP-004 (DEVERIA):** Catálogo de dados (data catalog) DEVERIA estar integrado ao ROPA, permitindo rastrear cada campo a uma operação e a uma finalidade.

---

# 12. RIPD — Relatório de Impacto à Proteção de Dados Pessoais

Base: Arts. 5º, XVII; 10, §3º; 32; 38 LGPD.

## 12.1 Quando elaborar

A LGPD não enumera taxativamente as hipóteses. A ANPD pode solicitar a qualquer tempo (Art. 38). Boa prática: elaborar **antes do go-live** sempre que o tratamento for de **alto risco**.

### 12.1.1 Indicadores de alto risco (combinação de critérios — ANPD, orientações)

**Critérios gerais (presença de qualquer):**
- avaliação sistemática ou pontuação de aspectos pessoais (scoring, profiling);
- decisões automatizadas com efeitos jurídicos ou impacto relevante;
- monitoramento sistemático;
- uso de novas tecnologias com risco à privacidade (biometria, IA generativa, IoT pessoal);
- impedimento de exercício de direito ou uso de contrato pelo titular;
- tratamento em larga escala.

**Critérios específicos (presença de qualquer):**
- dados sensíveis (C2);
- dados de crianças e adolescentes ou idosos;
- dados financeiros, de autenticação ou protegidos por sigilo;
- combinação ou cruzamento de bases.

**R-RIP-001 (DEVE):** Tratamento que combine **pelo menos 1 critério geral + 1 critério específico** (ou apresente 2 critérios gerais isoladamente significativos) DEVE ter RIPD elaborado e mantido atualizado.

**R-RIP-002 (DEVE):** Tratamento baseado em legítimo interesse (BL-09) que envolva dado sensível por inferência, larga escala, ou monitoramento sistemático DEVE ter RIPD.

## 12.2 Estrutura mínima (Art. 38, parágrafo único)

1. Descrição dos tipos de dados coletados;
2. Metodologia utilizada para coleta e segurança;
3. Análise do controlador sobre medidas, salvaguardas e mecanismos de mitigação de risco.

Estrutura recomendada (baseada no guia ANPD/ISO 29134):

1. **Identificação dos agentes** — controlador, operadores, encarregado;
2. **Necessidade do RIPD** — justificativa pelos critérios de alto risco;
3. **Descrição do tratamento:**
   - 3.1 Natureza (operações, fluxos, sistemas envolvidos);
   - 3.2 Escopo (categorias de dados, titulares, volume, prazo, abrangência geográfica);
   - 3.3 Contexto (relação com titular, expectativas, regulação setorial);
   - 3.4 Finalidade (resultados pretendidos, benefícios);
4. **Partes interessadas consultadas** — operador, encarregado, gestores, jurídico, segurança;
5. **Necessidade e proporcionalidade** — base legal, minimização, qualidade, direitos do titular, salvaguardas para TID;
6. **Identificação e avaliação de riscos** — eventos, probabilidade, impacto, nível de risco (matriz P × I);
7. **Medidas para tratar riscos** — controles existentes e planejados, com responsáveis e prazos;
8. **Aprovação** — encarregado, alta direção;
9. **Revisão programada** — periodicidade (sugerido: anual ou em mudança significativa).

## 12.3 Critérios de avaliação de risco

Matriz Probabilidade × Impacto:

| Impacto \ Prob. | Baixa | Moderada | Alta |
|---|---|---|---|
| Alto | Moderado | Alto | Alto |
| Moderado | Baixo | Moderado | Alto |
| Baixo | Baixo | Baixo | Moderado |

**R-RIP-003 (DEVE):** Riscos de nível **alto** DEVEM ser mitigados a moderado/baixo antes do go-live, ou exigir aprovação documentada da alta direção com plano de mitigação programado.

**R-RIP-004 (DEVE):** Lista mínima de riscos a considerar:
- acesso indevido por usuário interno (insider);
- acesso indevido por terceiro (ataque externo);
- vazamento por erro humano;
- perda de disponibilidade;
- uso para finalidade incompatível;
- coleta excessiva;
- retenção além do necessário;
- decisão automatizada discriminatória;
- compartilhamento indevido com operador/parceiro;
- falha de TID;
- ataque a backup;
- reidentificação de dados pseudonimizados/anonimizados;
- ataques a credenciais (phishing, brute-force, credential stuffing);
- comprometimento de chave criptográfica.

## 12.4 Sinalização: o RIPD é obrigação por solicitação

A ANPD pode solicitar o RIPD a qualquer momento. Sem RIPD elaborado, o controlador tem prazo curto para produzi-lo sob fiscalização. **Boa prática: elaborar proativamente.**

---

# 13. Dados sensíveis e dados de menores

## 13.1 Dados sensíveis (C2) — regras específicas

**R-SEN-001 (DEVE):** Coleta de C2 DEVE ter base legal do Art. 11 (BLS-01 a BLS-08). Legítimo interesse não vale.

**R-SEN-002 (DEVE):** Quando a base for consentimento (BLS-01), este DEVE ser:
- específico (uma finalidade por consentimento);
- destacado de outros termos (não embutido em "aceito os termos de uso");
- com informação prévia clara sobre o caráter sensível do dado.

**R-SEN-003 (DEVE):** Sistemas que tratam C2 DEVEM aplicar controles reforçados:
- criptografia em campo (não apenas em disco);
- MFA obrigatório para acesso interno;
- log com gravação de query/comando;
- segregação física ou lógica reforçada;
- alerta de anomalia em acesso;
- restrição máxima de acesso (need-to-know rigoroso).

**R-SEN-004 (DEVE):** RIPD DEVE ser elaborado para tratamento de C2 (R-RIP-001).

**R-SEN-005 (DEVERIA):** Quando dado biométrico for usado para autenticação, DEVERIA-se preferir armazenamento de **template criptografado** com função one-way em vez do dado biométrico bruto, e a comparação DEVERIA ocorrer no dispositivo do titular quando possível (ex.: TouchID/FaceID local).

## 13.2 Dados de crianças e adolescentes (C3) — Art. 14

**Princípio:** tratamento DEVE ocorrer no melhor interesse da criança/adolescente, com transparência reforçada.

**R-MEN-001 (DEVE):** Tratamento de dados de **menores de 12 anos** (crianças) DEVE ter consentimento específico e em destaque de **pelo menos um dos pais ou responsável legal**, exceto nas hipóteses do Art. 14, §3º (necessidade de contatar pais, proteção da criança — vedado repasse a terceiro sem consentimento).

**R-MEN-002 (DEVE):** Mecanismo de obtenção de consentimento parental DEVE empregar esforços razoáveis de verificação, considerando tecnologias disponíveis. Caixa de seleção "sou maior de 12" sem nenhuma verificação adicional não é esforço razoável.

**R-MEN-003 (DEVE):** Tratamento de dados de adolescentes (12 a 18 anos incompletos) DEVE também respeitar o melhor interesse, exigir consentimento adequado ao caso e oferecer transparência em linguagem acessível.

**R-MEN-004 (DEVE):** Informações fornecidas a menores sobre tratamento DEVEM:
- usar linguagem adequada à faixa etária;
- ser simples, claras, com recursos audiovisuais quando útil.

**R-MEN-005 (DEVE):** Coleta de dados de menores DEVE limitar-se ao estritamente necessário, ainda mais rigorosamente que C1 geral.

**R-MEN-006 (DEVE):** Publicidade direcionada e profiling de menores são fortemente restringidos. Decisões automatizadas com impacto em menores exigem cautela máxima e devem ser revisáveis.

---

# 14. Tratamento de dados de colaboradores (cenário sistemas internos)

A LGPD aplica-se integralmente à relação de trabalho. Particularidades importantes para sistemas internos.

## 14.1 Base legal típica

**Para o ciclo padrão de RH** (cadastro, folha, benefícios, controle de jornada, gestão de desempenho):
- **BL-02 (obrigação legal)** para o que decorre de CLT, eSocial, Receita Federal, INSS, sindical;
- **BL-05 (execução do contrato de trabalho)** para o que decorre do contrato;
- **BL-09 (legítimo interesse)** para gestão de pessoal, prevenção a fraude, segurança patrimonial — com LIA.

**Consentimento (BL-01)** é base **frágil** na relação de trabalho pelo desequilíbrio de poder. Posição da ANPD e doutrina dominante: evitar como base principal. Quando inevitável (ex.: foto em mural de aniversários, programa de embaixadores), oferecer alternativa real de recusa sem prejuízo.

**R-COL-001 (DEVE):** Mapear cada tratamento de dado de colaborador a uma base legal específica do Art. 7º. Evitar BL-01 como regra.

**R-COL-002 (DEVE):** Cláusulas em contrato de trabalho ou política interna que tentem obter "consentimento geral" para qualquer tratamento são inválidas. Consentimento, quando usado, é por finalidade.

## 14.2 Restrições específicas

**R-COL-003 (DEVE):** Dados sensíveis (C2) na relação de trabalho — atestados, exames ocupacionais, dados de saúde, filiação sindical — DEVEM seguir bases do Art. 11 (BLS-02 obrigação legal típica em SST; BLS-07 para tutela de saúde).

**R-COL-004 (DEVE):** Compartilhamento de dados de colaboradores com matriz no exterior, grupo econômico, ou fornecedores estrangeiros configura TID e DEVE seguir Seção 10.

**R-COL-005 (DEVE):** Sistemas de RH DEVEM permitir ao colaborador exercer os direitos do Art. 18, com adaptações:
- acesso aos próprios dados;
- correção;
- portabilidade (em geral cabível para dados fornecidos pelo colaborador);
- eliminação — geralmente **não cabível** antes do prazo de guarda legal (eSocial: até a vigência + prazo prescricional; trabalhista: até 5 anos após término).

## 14.3 Monitoramento e expectativa de privacidade

**R-COL-006 (DEVE):** Monitoramento de e-mail corporativo, navegação, chamadas, vídeo, biometria de ponto, geolocalização de veículos corporativos:
- DEVE ser comunicado previamente em política clara e específica;
- DEVE ter finalidade legítima e proporcional;
- DEVE seguir BL-09 com LIA documentado, ou outra base aplicável;
- DEVE ser registrado em ROPA;
- DEVE ter RIPD quando sistemático ou em larga escala.

**R-COL-007 (DEVE):** Mesmo em ambiente corporativo, o monitoramento NÃO PODE ter caráter discriminatório nem invadir desproporcionalmente a esfera privada do colaborador. Acesso a e-mail pessoal, redes sociais privadas, espaços íntimos é vedado, mesmo via equipamento da empresa.

**R-COL-008 (DEVERIA):** Resultados de monitoramento usados em decisão de RH (advertência, demissão, promoção) DEVERIAM ser revisáveis e contestáveis pelo colaborador.

## 14.4 Sistemas internos típicos — checklist específico

| Sistema | Cuidados |
|---|---|
| ERP (módulo RH/folha) | Base BL-02 + BL-05; retenção conforme eSocial; segregação de acesso por papel |
| Controle de ponto biométrico | C2 (biométrico); BLS-08 (segurança do titular) ou BLS-02 (obrigação legal); template criptografado |
| Sistema de avaliação de desempenho | BL-09; LIA; revisão de decisões; transparência ao colaborador |
| Plano de saúde / SST | C2; BLS-02 ou BLS-07; acesso restrito a profissionais de saúde |
| Intranet / colaboração interna | C1; cuidado com publicação de aniversários, fotos (avaliar consentimento real ou opt-out) |
| Sistema de denúncias (canal ético) | C1 + possível C2; confidencialidade rigorosa; base BL-02 (Lei Anticorrupção, governança) |
| Single sign-on / IAM | C1; criptografia de credenciais; log de acessos administrativos |
| Sistemas analíticos / BI sobre RH | Pseudonimizar quando possível; restringir acesso; documentar finalidade |
| Vigilância eletrônica (CFTV) | C1 (imagem); base BL-09; aviso de gravação; retenção mínima necessária |

---

# 15. Anonimização e pseudonimização

## 15.1 Critérios

**Anonimização (Art. 5º, XI):** processo que torna o dado não vinculável a indivíduo, considerados meios técnicos razoáveis no momento do tratamento.

**Reversibilidade:** se o dado puder ser revertido **com esforço razoável** ou cruzado com outra base para reidentificar, **não está anonimizado** — é pseudonimizado, e continua sob regime de dado pessoal.

**Pseudonimização (Art. 13, §4º):** tratamento que substitui identificadores diretos por identificadores artificiais, mantendo a chave de correspondência separada.

## 15.2 Regras técnicas

**R-ANO-001 (DEVE):** Antes de classificar uma base como "anonimizada" para fins de saída da LGPD, DEVE existir avaliação de risco de reidentificação considerando:
- variáveis quasi-identificadoras (CEP, idade, sexo, profissão, datas);
- bases públicas e privadas com potencial de cruzamento;
- tamanho da base e singularidade dos registros (k-anonimato, l-diversidade);
- evolução tecnológica esperada no período de uso.

**R-ANO-002 (DEVERIA):** Anonimização DEVERIA usar técnicas comprovadas: generalização, supressão, microagregação, ruído (privacy-preserving / differential privacy quando aplicável).

**R-ANO-003 (DEVE):** Se a anonimização for utilizada como forma exclusiva de garantir privacidade em uso analítico/treinamento de modelos, a avaliação DEVE ser documentada e revisada periodicamente.

**R-ANO-004 (DEVE):** Pseudonimização não isenta o dado de regras da LGPD. Chave de correspondência DEVE ser:
- armazenada separadamente;
- com acesso restrito;
- protegida por controle equivalente ao C2 quando o dado original é sensível.

**R-ANO-005 (DEVE):** Para treinamento de modelos de IA com dados pessoais:
- preferir anonimização robusta;
- quando inviável, aplicar base legal específica e documentar;
- considerar técnicas de privacy-preserving ML (federado, diferencial);
- ter RIPD.

---

# 16. Retenção, eliminação e descarte

## 16.1 Princípio

Tratamento (incluindo armazenamento) só é legítimo enquanto necessário à finalidade declarada. Findas as finalidades, eliminação é a regra (Art. 15), respeitadas hipóteses do Art. 16.

## 16.2 Hipóteses de término (Art. 15)

1. Verificação de que a finalidade foi alcançada ou que os dados deixaram de ser necessários;
2. Fim do período de tratamento (prazo definido);
3. Comunicação do titular (revogação de consentimento ou exercício de direito), respeitadas exceções;
4. Determinação da ANPD em violação à LGPD.

## 16.3 Hipóteses de conservação após término (Art. 16)

Dado pode ser conservado, apesar do término, para:
1. Cumprimento de obrigação legal/regulatória;
2. Estudo por órgão de pesquisa, garantida anonimização sempre que possível;
3. Transferência a terceiro, observados requisitos legais;
4. Uso exclusivo do controlador, vedado o acesso por terceiro, e desde que anonimizados.

## 16.4 Requisitos sistêmicos

**R-RET-001 (DEVE):** Cada categoria de dado DEVE ter política de retenção declarada com:
- prazo;
- critério (data fixa, data + N anos, evento + N anos);
- destino ao fim (eliminação, anonimização, transferência);
- base legal do prazo (se decorrente de lei, citar; se de decisão de negócio, justificar).

**R-RET-002 (DEVE):** Eliminação por expiração de retenção DEVE ser automatizada quando possível, com registro do que foi eliminado, quando e por qual regra.

**R-RET-003 (DEVE):** Backups DEVEM ter ciclo de retenção compatível com a política dos dados; backup não pode ser desculpa para conservar dado indefinidamente.

**R-RET-004 (DEVE):** Descarte físico de mídia (HD, SSD, papel) com dados pessoais DEVE usar métodos seguros (degausser, trituração industrial, sanitização criptográfica) com certificação/registro.

**R-RET-005 (DEVE):** Para sistemas legados em desativação, DEVE haver plano de migração ou eliminação dos dados pessoais antes do shutdown, documentado.

## 16.5 Prazos típicos (Brasil, 2026 — verificar atual)

| Categoria | Prazo típico | Base |
|---|---|---|
| Documentos fiscais | 5 anos | CTN, Art. 173/174 |
| Documentos trabalhistas (eSocial) | até vigência + prazo prescricional | CLT, eSocial |
| Contas a pagar/receber | 5 anos | Decadência tributária |
| Registros contábeis | 10 anos | Código Civil, Art. 1.194 |
| Dados de relacionamento com consumidor | 5 anos após o fim da relação (CDC, prescrição) | CDC, Art. 27 |
| Logs de aplicação (Marco Civil) | 6 meses (conexão) / 6 meses (acesso a aplicação) | Lei 12.965/2014 |
| Registro de incidente de segurança | 5 anos | Res. 15/2024, Art. 10 |
| Consentimento (mesmo após revogação) | 5 anos (compatível com prescrição) | Boa prática |

---

# 17. Compartilhamento com operadores e terceiros

## 17.1 Operador (processor)

Atua em nome do controlador, seguindo suas instruções. A responsabilidade primária pelo tratamento é do controlador, mas o operador responde solidariamente quando descumpre instruções ou a LGPD (Art. 42, §1º).

## 17.2 Cláusulas contratuais mínimas em contrato com operador

**R-TER-001 (DEVE):** Contrato com operador DEVE conter cláusulas que:
1. delimitem o escopo do tratamento (finalidades autorizadas, categorias de dados, titulares, duração);
2. obriguem o operador a tratar dados apenas conforme instruções documentadas do controlador;
3. obriguem o operador a manter sigilo;
4. exijam medidas técnicas e organizacionais mínimas equivalentes às do controlador (Seção 8);
5. condicionem subcontratação à autorização do controlador (sub-operadores, com mesmos deveres);
6. obriguem comunicação de incidentes ao controlador sem demora injustificada;
7. assegurem o suporte do operador no atendimento de direitos dos titulares;
8. autorizem auditorias pelo controlador (ou terceiro independente);
9. determinem devolução ou eliminação dos dados ao término do contrato;
10. tratem de TID (SCC anexadas se aplicável — Seção 10).

## 17.3 Due diligence de fornecedores

**R-TER-002 (DEVE):** Antes da contratação, fornecedor que tratará dados pessoais DEVE ser avaliado quanto a:
- maturidade em segurança da informação (certificações ISO 27001/27701, SOC 2, evidências);
- localização do tratamento (TID?);
- incidentes recentes;
- política de privacidade e capacidade de atender direitos do titular;
- subcontratados.

**R-TER-003 (DEVE):** Reavaliação periódica (mínimo anual) para fornecedores que tratam dados pessoais sensíveis ou em larga escala.

## 17.4 Compartilhamento com controlador conjunto / terceiro controlador

**R-TER-004 (DEVE):** Compartilhamento com outro controlador (ex.: grupo econômico, parceiro comercial, bureau) exige base legal própria para a operação de compartilhamento, transparência ao titular e contrato definindo responsabilidades.

**R-TER-005 (DEVE):** Compartilhamento de C2 entre controladores em saúde exige finalidade legítima (Art. 11, §4º) e veda repasse para obtenção de vantagem econômica salvo exceções (Art. 11, §4º e §5º).


---

# 18. CHECKLIST DE IMPLEMENTAÇÃO (sistema novo)

Aplicar em ordem antes do go-live. Cada item rastreia uma ou mais regras `R-*`. Status: `OK`, `GAP`, `N/A`.

## 18.1 Concepção e design (antes de qualquer código)

- [ ] **I-01** Avaliação documentada de aplicabilidade da LGPD (R-APL-001).
- [ ] **I-02** Mapeamento das categorias de dados a serem tratadas (C1/C2/C3) — dicionário de dados (R-CLA-001).
- [ ] **I-03** Identificação das finalidades específicas para cada conjunto de dados (R-PRI-001).
- [ ] **I-04** Identificação da base legal para cada finalidade (Seção 4, R-BAS-001).
- [ ] **I-05** Para BL-09 (legítimo interesse): LIA elaborado e aprovado (R-BAS-004).
- [ ] **I-06** Avaliação preliminar de risco — necessidade de RIPD identificada (R-RIP-001).
- [ ] **I-07** Decisão arquitetural sobre localidade dos dados; TID identificada e mecanismo selecionado (R-TID-001).
- [ ] **I-08** Definição de política de retenção por categoria (R-RET-001).
- [ ] **I-09** Identificação de operadores envolvidos e plano de adequação contratual (R-TER-001).
- [ ] **I-10** Privacy by Default: defaults restritivos definidos para configurações de titular (R-PBD-002).
- [ ] **I-11** Encarregado consultado / parecer arquivado.

## 18.2 Desenvolvimento

- [ ] **I-12** Schema com classificação de dados por campo (R-CLA-001).
- [ ] **I-13** Flags explícitas em campos C2 e C3 com alerta de revisão (R-CLA-002).
- [ ] **I-14** Coleta minimizada — formulários distinguem campos obrigatórios e justificam cada um (R-PRI-004, R-PBD-011).
- [ ] **I-15** Aviso de privacidade em ponto de coleta, claro e em camadas (R-PBD-012).
- [ ] **I-16** Mecanismo de consentimento (quando BL-01) registra timestamp, versão, evidência e finalidade (R-BAS-002).
- [ ] **I-17** Mecanismo de revogação de consentimento com fricção equivalente à coleta (R-BAS-002).
- [ ] **I-18** Funcionalidades de direitos do titular implementadas (D-01 a D-10) com prazo de 15 dias (Seção 7).
- [ ] **I-19** Funcionalidade de eliminação real, com propagação para downstream e tratamento de backups (R-DIR-005, R-DIR-006).
- [ ] **I-20** Portabilidade em formato estruturado e legível por máquina (R-DIR-008).
- [ ] **I-21** Decisões automatizadas com efeito relevante têm revisão por pessoa natural (R-DIR-010).
- [ ] **I-22** Política de privacidade publicada, versionada, identificando controlador e encarregado (R-PRI-010, R-PRI-011).
- [ ] **I-23** Cookies / trackers não essenciais exigem opt-in ativo (R-PBD-003).

## 18.3 Segurança

- [ ] **I-24** Autenticação obrigatória para acesso a dado pessoal (R-SEG-001).
- [ ] **I-25** Autorização por menor privilégio implementada (R-SEG-002).
- [ ] **I-26** MFA para acesso interno a C2 e grandes volumes de C1 (R-SEG-003).
- [ ] **I-27** Acessos privilegiados nominais, registrados, revisados (R-SEG-004).
- [ ] **I-28** Credenciais com hashing forte; segredos em vault (R-SEG-005).
- [ ] **I-29** TLS 1.2+ para todo tráfego com dado pessoal (R-SEG-006).
- [ ] **I-30** Criptografia em repouso (storage para C1; campo para C2) (R-SEG-007/008).
- [ ] **I-31** Gerenciamento de chaves em KMS/HSM com política de rotação (R-SEG-009).
- [ ] **I-32** Logs de operações de tratamento com conteúdo mínimo (R-SEG-010).
- [ ] **I-33** Logs imutáveis com retenção adequada (R-SEG-011).
- [ ] **I-34** Logs não contêm credenciais nem C2 em claro (R-SEG-012).
- [ ] **I-35** Análise de segurança pré-go-live (SAST + DAST + revisão; pentest se alto risco) (R-SEG-016).
- [ ] **I-36** Dependências monitoradas por CVE com SLA de patch (R-SEG-015).
- [ ] **I-37** Comunicação inter-serviços autenticada (R-SEG-017).
- [ ] **I-38** Backup com criptografia, teste de restauração, cópia isolada (R-SEG-018).
- [ ] **I-39** Ambientes segregados; produção não usada em dev sem mascaramento (R-SEG-020/021).

## 18.4 Operação e governança

- [ ] **I-40** Ficha de tratamento criada e integrada ao ROPA (R-ROP-002).
- [ ] **I-41** RIPD elaborado (se alto risco) com aprovação (R-RIP-001 a 003).
- [ ] **I-42** Plano de resposta a incidentes inclui o novo sistema (R-INC-004).
- [ ] **I-43** Monitoração de anomalias configurada (R-INC-003).
- [ ] **I-44** Contratos com operadores assinados com cláusulas mínimas e SCC quando TID (R-TER-001, R-TID-002).
- [ ] **I-45** Política de retenção configurada e automatizada (R-RET-002).
- [ ] **I-46** Treinamento da equipe operacional realizado (R-SEG-024).
- [ ] **I-47** Canal de exercício de direitos do titular comunicado e funcional (R-DIR-001).
- [ ] **I-48** Evidências de implementação das regras `R-*` arquivadas (R-PRI-014).

## 18.5 Específico para sistemas internos (colaboradores)

Aplicar adicionalmente quando o sistema trate dados de colaboradores.

- [ ] **I-49** Base legal mapeada para cada tratamento de dado de colaborador, evitando BL-01 como regra (R-COL-001).
- [ ] **I-50** Dados sensíveis ocupacionais (saúde, biométrico, sindicato) com base do Art. 11 (R-COL-003).
- [ ] **I-51** Compartilhamento com matriz/grupo no exterior tratado como TID (R-COL-004).
- [ ] **I-52** Monitoramento (e-mail, web, vídeo, biometria) comunicado em política específica, com LIA e RIPD (R-COL-006).
- [ ] **I-53** Política de retenção respeita prazos trabalhistas e eSocial (Seção 16.5).
- [ ] **I-54** Funcionalidade de direitos adaptada (acesso, correção, portabilidade; eliminação restrita) (R-COL-005).

## 18.6 Específico para sistemas externos (clientes)

- [ ] **I-55** Política de privacidade externa, acessível, em linguagem clara, versionada.
- [ ] **I-56** Identificação clara do encarregado e canal direto (Res. 18/2024).
- [ ] **I-57** Consentimento, quando aplicável, livre e granular por finalidade.
- [ ] **I-58** Marketing direto com base legal apropriada e opt-out simples.
- [ ] **I-59** Cookies/trackers com gestão de preferências completa.
- [ ] **I-60** Tratamento de menores com verificação de idade e consentimento parental (se aplicável) (R-MEN-001/002).

---

# 19. CHECKLIST DE VERIFICAÇÃO (sistema existente)

Aplicar em auditoria/revisão de adequação. Resultado: `OK`, `GAP` com severidade (`Alta`, `Média`, `Baixa`) e plano de ação.

## 19.1 Inventário e mapeamento

- [ ] **V-01** Existe inventário atualizado de todos os tipos de dados pessoais que o sistema trata? (Severidade Alta se ausente)
- [ ] **V-02** Cada campo está classificado em C1/C2/C3?
- [ ] **V-03** Cada operação de tratamento está associada a uma finalidade declarada?
- [ ] **V-04** Cada finalidade tem base legal identificada e fundamentada?
- [ ] **V-05** O ROPA existe, contém o sistema e está atualizado (revisão nos últimos 12 meses)?

## 19.2 Bases legais

- [ ] **V-06** Para tratamentos sob BL-01 (consentimento), há registro de cada consentimento com evidência?
- [ ] **V-07** Para tratamentos sob BL-09, há LIA documentado?
- [ ] **V-08** Para tratamentos sob BL-02, está citado o dispositivo legal específico?
- [ ] **V-09** Para dados sensíveis, a base é do Art. 11 (não usa legítimo interesse)?
- [ ] **V-10** Mudanças de finalidade após a coleta foram avaliadas quanto à compatibilidade?

## 19.3 Direitos do titular

- [ ] **V-11** Existe canal funcional para exercício dos direitos do Art. 18?
- [ ] **V-12** Tempo médio real de resposta a requisições está ≤ 15 dias?
- [ ] **V-13** Funcionalidade de acesso retorna todos os dados do titular (não apenas os do produto, mas integração com sistemas downstream)?
- [ ] **V-14** Funcionalidade de eliminação executa eliminação real (não soft delete eterno) e propaga para downstream?
- [ ] **V-15** Funcionalidade de portabilidade entrega dado em formato estruturado e interoperável?
- [ ] **V-16** Decisões automatizadas com efeito relevante têm revisão por pessoa natural disponível?
- [ ] **V-17** Política de privacidade é versionada e atualizada quando há mudanças relevantes?
- [ ] **V-18** Identificação do encarregado está publicamente visível e o canal funciona?

## 19.4 Privacy by Design / Default

- [ ] **V-19** Defaults em configurações de titular são os mais restritivos?
- [ ] **V-20** Coleta de dados respeita a minimização (campos justificados)?
- [ ] **V-21** Existem dark patterns que induzem consentimento ou compartilhamento? (Se sim → GAP)
- [ ] **V-22** Cookies não essenciais exigem consentimento ativo prévio?

## 19.5 Segurança

- [ ] **V-23** Inventário de acessos privilegiados existe e foi revisado nos últimos 3 meses?
- [ ] **V-24** MFA está aplicado para acesso a C2 e a grandes volumes de C1?
- [ ] **V-25** Tráfego está em TLS 1.2+ em todos os endpoints?
- [ ] **V-26** Dados em repouso estão criptografados conforme R-SEG-007/008?
- [ ] **V-27** Logs de acesso a dado pessoal existem, são imutáveis e cobrem o conteúdo mínimo?
- [ ] **V-28** Logs estão livres de credenciais e C2 em claro? (Amostragem)
- [ ] **V-29** Análise de segurança (SAST/DAST/pentest) realizada nos últimos 12 meses (24 meses se baixo risco)?
- [ ] **V-30** Vulnerabilidades críticas em componentes têm tempo médio de remediação ≤ 7 dias?
- [ ] **V-31** Backups são criptografados, testados, e há cópia isolada?
- [ ] **V-32** Ambientes não produtivos usam dados mascarados/sintéticos? (Se usam dados reais → GAP Alta sem aprovação documentada)

## 19.6 Incidentes

- [ ] **V-33** Plano de resposta a incidentes documentado e testado nos últimos 12 meses?
- [ ] **V-34** Equipe sabe acionar o encarregado e o fluxo de comunicação à ANPD em 3 dias úteis?
- [ ] **V-35** Registro de incidentes (mesmo não notificados) existe, com prazo de guarda de 5 anos? (Res. 15/2024, Art. 10)
- [ ] **V-36** Contratos com operadores obrigam comunicação de incidentes ao controlador?

## 19.7 Transferência internacional

- [ ] **V-37** Todas as TIDs (cloud, SaaS, suporte offshore, backup internacional) estão mapeadas no ROPA?
- [ ] **V-38** Cada TID tem mecanismo válido (SCC, decisão de adequação, BCR, etc.)?
- [ ] **V-39** Contratos com fornecedores internacionais incluem SCC do Anexo II da Res. 19/2024 (ou alternativa aprovada)?
- [ ] **V-40** O prazo de adequação à Res. 19/2024 foi cumprido?

## 19.8 Retenção e eliminação

- [ ] **V-41** Cada categoria de dado tem política de retenção declarada?
- [ ] **V-42** Eliminação por expiração é automatizada e registrada?
- [ ] **V-43** Há dados retidos sem base legal ativa (legados, "vai que precisamos")? (Se sim → GAP)
- [ ] **V-44** Backups têm ciclo de retenção compatível com a política?
- [ ] **V-45** Descarte físico de mídia segue procedimento seguro?

## 19.9 Operadores e terceiros

- [ ] **V-46** Inventário de operadores que tratam dados pessoais existe e está atualizado?
- [ ] **V-47** Cada operador tem contrato com cláusulas mínimas (R-TER-001)?
- [ ] **V-48** Sub-operadores estão autorizados e cadastrados?
- [ ] **V-49** Due diligence dos operadores foi realizada/revisada nos últimos 12 meses para alto risco?

## 19.10 Específico para colaboradores (se aplicável)

- [ ] **V-50** Base legal de cada tratamento de dado de colaborador NÃO depende de BL-01 (consentimento) como regra?
- [ ] **V-51** Monitoramento (e-mail, web, vídeo, biometria, geolocalização) está comunicado em política específica, com LIA e RIPD?
- [ ] **V-52** Dados sensíveis ocupacionais têm base do Art. 11?
- [ ] **V-53** Compartilhamento com matriz/grupo no exterior está tratado como TID?
- [ ] **V-54** Direitos do colaborador estão operacionalizados (acesso, correção, portabilidade)?

## 19.11 Específico para titulares menores (se aplicável)

- [ ] **V-55** Existe verificação de idade no fluxo de cadastro?
- [ ] **V-56** Tratamento de menores de 12 anos tem consentimento parental com esforço razoável de verificação?
- [ ] **V-57** Informações ao menor estão em linguagem adequada?
- [ ] **V-58** Publicidade direcionada e profiling de menores estão limitados?

## 19.12 Governança transversal

- [ ] **V-59** Encarregado está formalmente nomeado (Res. 18/2024)?
- [ ] **V-60** Programa de governança em privacidade (Art. 50) existe e está documentado?
- [ ] **V-61** Treinamento periódico em LGPD para equipes que tratam dados pessoais?
- [ ] **V-62** Evidências de implementação das regras `R-*` existem (accountability — R-PRI-014)?

---

# 20. Diferenças entre sistemas internos e externos — quadro síntese

| Aspecto | Sistemas externos (clientes) | Sistemas internos (colaboradores) |
|---|---|---|
| Base legal típica | BL-05 (contrato), BL-01 (consentimento granular), BL-09 (LI com LIA) | BL-02 (obrigação legal), BL-05 (contrato de trabalho), BL-09 (LI com LIA). Evitar BL-01 |
| Coleta inicial | Geralmente self-service do titular | Por RH/admissão; dado já vem de outras fontes (eSocial, atestados) |
| Direito de eliminação | Geralmente exercível, com exceções (Art. 16) | Restrito durante vigência do contrato e prazo prescricional |
| Consentimento | Mecanismo central para várias finalidades | Frágil por desequilíbrio; usar com cautela |
| Monitoramento | Foco em produto/serviço, transparente ao titular | Monitoramento corporativo legítimo, com política específica |
| RIPD | Quando alto risco | Mais frequente: biometria de ponto, vigilância, decisões automatizadas em RH |
| TID | Cloud/SaaS, parceiros internacionais | Matriz, grupo econômico, fornecedores de RH internacionais |
| Política de privacidade | Pública, externa, em linguagem para consumidor | Política interna específica, possivelmente em manual do colaborador |
| Canal de direitos | Público, em destaque no produto | Interno (RH, intranet) com adaptações |
| Marketing | Frequente; requer base legal e opt-out fácil | Geralmente não aplicável; comunicações internas têm outro regime |
| Decisão automatizada | Scoring, recomendação, precificação | Avaliação de desempenho, scoring de risco trabalhista, recrutamento |

---

# Anexo A — Mapeamento Artigo da LGPD → Requisitos sistêmicos

| Artigo | Tema | Regras `R-*` deste guia |
|---|---|---|
| Art. 5º | Definições | Seção 1 inteira; R-DEF-001 |
| Art. 6º | Princípios | R-PRI-001 a R-PRI-014 |
| Art. 7º | Bases legais para dados comuns | R-BAS-001 a R-BAS-007; Seção 4.1 |
| Art. 8º | Consentimento | R-BAS-002 |
| Art. 9º | Acesso facilitado à informação | R-PRI-010, R-PRI-011 |
| Art. 10 | Legítimo interesse | R-BAS-004 |
| Art. 11 | Dados sensíveis | R-SEN-001 a R-SEN-005; Seção 4.2 |
| Art. 12 | Anonimização | R-ANO-001 a R-ANO-005 |
| Art. 13 | Pseudonimização (parcial) | R-ANO-004 |
| Art. 14 | Dados de menores | R-MEN-001 a R-MEN-006 |
| Art. 15 | Término do tratamento | Seção 16.2 |
| Art. 16 | Conservação após término | Seção 16.3 |
| Art. 18 | Direitos do titular | R-DIR-001 a R-DIR-011; Seção 7 |
| Art. 19 | Prazos de resposta | R-DIR-003 (15 dias) |
| Art. 20 | Revisão de decisões automatizadas | R-DIR-010, R-DIR-011, R-PRI-013 |
| Art. 23–32 | Tratamento pelo Poder Público | Não detalhado neste guia (escopo privado) |
| Art. 33–36 | Transferência internacional | R-TID-001 a R-TID-005; Seção 10 |
| Art. 37 | Registro de operações (ROPA) | R-ROP-001 a R-ROP-004 |
| Art. 38 | RIPD | R-RIP-001 a R-RIP-004; Seção 12 |
| Art. 39 | Operador segue instruções do controlador | R-TER-001 |
| Art. 41 | Encarregado | Res. 18/2024; R-PRI-010 |
| Art. 42–45 | Responsabilidade civil | Implícito em todo o documento |
| Art. 46 | Segurança | R-SEG-001 a R-SEG-025; Seção 8 |
| Art. 48 | Comunicação de incidente | R-INC-001 a R-INC-007; Seção 9 |
| Art. 50 | Programa de governança | R-SEG-025; R-PRI-014 |
| Art. 52–54 | Sanções administrativas | Res. 4/2023 (dosimetria) |

---

# Anexo B — Resoluções da ANPD relevantes (até 2026)

| Resolução | Tema | Implicação principal |
|---|---|---|
| CD/ANPD nº 1/2021 | Regimento Interno | Estrutura da autoridade |
| CD/ANPD nº 2/2022 | Agentes de pequeno porte | Prazos em dobro; flexibilizações específicas |
| CD/ANPD nº 4/2023 | Dosimetria de sanções | Critérios de cálculo de multas (até 2% do faturamento, limitada a R$ 50 milhões por infração) |
| CD/ANPD nº 15/2024 | Comunicação de incidentes (RCIS) | 3 dias úteis; critérios de risco/dano relevante; registro 5 anos |
| CD/ANPD nº 18/2024 | Encarregado (DPO) | Nomeação formal; independência; divulgação pública de contato |
| CD/ANPD nº 19/2024 | Transferência internacional (RTID) | SCC obrigatórias (Anexo II); prazo de adequação 12 meses |

**Observação:** verificar publicação de resoluções posteriores a maio/2026 e atualizar este guia em revisão programada.

---

# Anexo C — Glossário rápido

- **ANPD** — Autoridade Nacional de Proteção de Dados
- **BCR** — Binding Corporate Rules; Normas Corporativas Globais
- **C1, C2, C3** — categorias de dados deste guia (comum, sensível, menor)
- **DPO** — Data Protection Officer; Encarregado
- **DPIA / RIPD** — Relatório de Impacto à Proteção de Dados Pessoais
- **LIA** — Legitimate Interest Assessment; avaliação de legítimo interesse
- **MFA** — Multi-Factor Authentication
- **OWASP** — Open Worldwide Application Security Project
- **PII** — Personally Identifiable Information; equivalente operacional a dado pessoal
- **RBAC / ABAC** — Role-Based / Attribute-Based Access Control
- **RCIS** — Regulamento de Comunicação de Incidente de Segurança (Res. 15/2024)
- **ROPA** — Records of Processing Activities; registro de operações de tratamento (Art. 37)
- **RTID** — Regulamento de Transferência Internacional de Dados (Res. 19/2024)
- **SAST / DAST** — Static / Dynamic Application Security Testing
- **SCC** — Standard Contractual Clauses; Cláusulas-padrão contratuais
- **TID** — Transferência Internacional de Dados
- **TLS** — Transport Layer Security

---

# Anexo D — Templates mínimos

## D.1 Texto base de consentimento (BL-01)

> [Empresa, CNPJ], com sede em [endereço], na qualidade de controladora, solicita seu consentimento para tratar os seguintes dados pessoais: [lista específica], com a finalidade de [finalidade específica], pelo prazo de [prazo], podendo compartilhá-los com [terceiros, se aplicável].
>
> Você pode revogar este consentimento a qualquer momento em [canal], sem prejuízo de tratamentos já realizados.
>
> Direitos garantidos pela LGPD (Art. 18) podem ser exercidos em [canal]. Encarregado: [nome/função], [contato].
>
> □ Eu li e concordo com o tratamento descrito acima.

(Texto deve ser apresentado isolado, sem agrupar com outros consentimentos ou aceites de termos de uso.)

## D.2 Comunicação inicial de incidente ao titular (Art. 48 / Res. 15/2024)

> Assunto: Comunicado importante sobre seus dados pessoais — [Empresa]
>
> Prezado(a) [nome do titular],
>
> Em [data], identificamos um incidente de segurança que afetou dados pessoais sob nossa responsabilidade. Em cumprimento à LGPD (Lei 13.709/2018) e à Resolução CD/ANPD nº 15/2024, informamos:
>
> **Natureza:** [descrição objetiva do que ocorreu]
>
> **Dados afetados:** [categorias específicas]
>
> **Possíveis consequências:** [riscos concretos para o titular]
>
> **Medidas adotadas:** [contenção, correção, segurança reforçada]
>
> **O que você pode fazer:**
> - [ação 1 — ex.: alterar senha em X]
> - [ação 2 — ex.: monitorar conta bancária]
> - [ação 3 — ex.: acionar bureau de crédito se aplicável]
>
> **Canais para esclarecimento:** [contato do encarregado], [canal de exercício de direitos]
>
> A ANPD foi comunicada em [data], processo nº [se já disponível].
>
> [Assinatura responsável]

## D.3 LIA — Esqueleto

```
1. Identificação do tratamento
   - Operação:
   - Sistema:
   - Categorias de dados:
   - Categorias de titulares:

2. Interesse legítimo invocado
   - Descrição concreta (não "melhorar nossos serviços"):
   - Vinculação a atividade do controlador:

3. Teste de necessidade
   - O tratamento é meio adequado ao interesse?
   - Existe meio menos invasivo? Por que não usar?

4. Teste de balanceamento
   - Expectativas razoáveis do titular:
   - Relação com o titular (cliente, prospect, terceiro):
   - Categorias de dados (sensíveis? larga escala? vulneráveis?):
   - Impacto potencial sobre o titular:
   - Salvaguardas adotadas (minimização, anonimização, transparência, opt-out):

5. Conclusão
   - Interesse prevalece sobre o titular? Justificativa:
   - Salvaguardas adicionais a implementar:
   - Programação de revisão (data):

6. Aprovação
   - Responsável técnico:
   - Encarregado:
   - Data:
```

## D.4 RIPD — Esqueleto

Ver Seção 12.2 — estrutura recomendada (9 seções).

---

# Anexo E — Sanções administrativas (visão sintética — Art. 52 LGPD / Res. 4/2023)

Aplicáveis pela ANPD após processo administrativo:

1. Advertência, com prazo para adoção de medidas corretivas;
2. Multa simples, de até 2% do faturamento da PJ no Brasil no último exercício, limitada a R$ 50.000.000,00 por infração;
3. Multa diária, observado o teto acima;
4. Publicização da infração;
5. Bloqueio dos dados pessoais a que se refere a infração;
6. Eliminação dos dados pessoais a que se refere a infração;
7. Suspensão parcial do funcionamento do banco de dados a que se refere a infração;
8. Suspensão do exercício da atividade de tratamento;
9. Proibição parcial ou total do exercício de atividades relacionadas a tratamento de dados.

**Critérios de dosimetria (Res. 4/2023):** gravidade, natureza dos direitos afetados, boa-fé, vantagem auferida, condição econômica, reincidência, grau do dano, cooperação, adoção de política de boas práticas e governança, RIPD, comunicação tempestiva de incidente, programa de conformidade.

Aplicação proativa das regras `R-*` deste guia mitiga severidade em caso de fiscalização.

---

# Anexo F — Procedimento de revisão deste documento

**R-DOC-001 (DEVE):** Este documento DEVE ser revisado:
- a cada nova Resolução da ANPD com impacto em sistemas;
- a cada alteração relevante na Lei 13.709/2018;
- a cada incidente significativo na empresa que revele lacunas;
- minimamente a cada 12 meses.

**Histórico de versões:**

| Versão | Data | Mudança | Responsável |
|---|---|---|---|
| 1.0 | 2026-05-16 | Versão inicial. | — |

