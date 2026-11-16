# Prompt para tarefas de frontend

> Cola este ficheiro (ou referencia-o) no início de cada tarefa de frontend e preenche a secção **Tarefa**.
> Tudo o que está abaixo dela são regras obrigatórias.

## Tarefa

- **O que fazer:** <descrever a funcionalidade / página>
- **Página(s) afetada(s):** <ex.: Leads, Detalhe de oportunidade>
- **Endpoint(s) da API:** <ex.: GET /api/v1/leads — ou "ainda não existe">
- **Referência no mockup:** <função em `mockup/src/App.tsx`, ex.: `Leads`, `OpportunityDetail`>

---

## 1. Antes de escrever código

1. **Procura componentes que já existam.** Lê `src/components/` e procura pelo nome e pela função:
   ```sh
   ls -R src/components src/pages src/hooks src/api
   grep -rn "export default\|export function" src/components
   ```
2. **Se já existir um componente parecido, reutiliza-o ou alarga-o com props.** Nunca cries um segundo `Table`, `Pill`, `Filters`, etc. Se mudares a API de um componente partilhado, atualiza todos os sítios que o usam.
3. **Abre a parte correspondente do mockup** (`mockup/src/App.tsx` e `mockup/src/index.css`) e identifica que blocos visuais a tarefa precisa.
4. Faz uma lista curta: componentes que vais **reutilizar**, **alargar** e **criar**. Escreve-a no PR ou na resposta.

## 2. Estrutura de pastas

```
src/
  api/            # um ficheiro por recurso: leadsApi.ts, opportunitiesApi.ts … (usa apiFetch de client.ts)
  hooks/          # hooks TanStack Query por recurso: useLeads.ts, useOpportunity.ts …
  components/
    ui/           # genéricos, sem lógica de negócio: Icon, Pill, Button, Table, Filters, Tabs, Dialog, Drawer, StatCard …
    layout/       # AppLayout (sidebar + topbar + <Outlet/>), Sidebar, Topbar, MobileNav
    <domínio>/    # específicos: leads/, opportunities/, operations/, works/, documents/, finance/ …
  pages/          # uma página por rota: LeadsPage.tsx, OpportunityDetailPage.tsx …
  lib/            # utilitários puros: format.ts (dinheiro, datas, %), csv.ts …
  index.css       # Tailwind + tokens do design (@theme) + estilos base
```

**Stack:** React + **TypeScript** (sem ficheiros `.js`/`.jsx`) + **Tailwind CSS v4** (plugin `@tailwindcss/vite`, sem `tailwind.config.js`) + React Router + TanStack Query.

## 3. Regras de componentes

- **Cada coisa é um componente.** Uma tabela, um cartão, uma barra de filtros, um separador, um modal, uma linha de kanban: cada um é um componente próprio, num ficheiro `NomeDoComponente.tsx`.
- **As páginas só compõem.** Uma página (`src/pages/XPage.tsx`) junta componentes e liga-os aos dados (hooks). Não tem markup grande nem estilos próprios para além do layout da página.
- **Um componente por ficheiro**, exportado por omissão, com nome em PascalCase igual ao nome do ficheiro.
- **Props tipadas** com `interface Props`. Sem `any`.
- **Os componentes de `ui/` não sabem nada do negócio:** recebem dados e callbacks por props e não chamam a API.
- **Componentes pequenos.** Se um ficheiro passar das ~150 linhas ou tiver mais do que uma responsabilidade, divide-o.
- **Estilos só com Tailwind:** classes utilitárias diretamente no JSX. Não criar ficheiros `.css` por componente nem usar `style={{}}`, exceto para valores dinâmicos (ex.: largura de uma barra calculada).
- **Usar sempre os tokens do tema** (`bg-brand`, `text-muted`, `border-line`, `rounded-control`…), definidos em `@theme` no `src/index.css`. Só usar valores arbitrários (`text-[11px]`, `w-[200px]`) para medidas do mockup que não tenham token. Uma cor nova vai primeiro para o `@theme`, nunca como `bg-[#123456]` repetido.
- **Combinações que se repetem viram componente, não classe CSS:** se o mesmo conjunto de classes aparece em vários sítios (ex.: botão primário), cria `components/ui/Button.tsx` com variantes por props. Só usar `@layer components` no `index.css` se não houver alternativa.
- **Breakpoints do mockup:** telemóvel até 720px e ecrã pequeno até 1050px. Usar `min-[721px]:` e `min-[1051px]:` (mobile-first), como no layout já existente.

## 4. Páginas e rotas

- **Cada página é uma rota** registada em `src/App.tsx`, dentro do `AppLayout` (sidebar + topbar). O portal do investidor e o login ficam fora do layout.
- Rotas em português e minúsculas, alinhadas com o menu do mockup:

  | Menu | Rota lista | Rota detalhe |
  |---|---|---|
  | Painel | `/` | — |
  | Leads | `/leads` | `/leads/:id` |
  | Oportunidades | `/oportunidades` | `/oportunidades/:id` |
  | Operações | `/operacoes` | `/operacoes/:id` |
  | Obras | `/obras` | `/obras/:id` |
  | Imóveis | `/imoveis` | `/imoveis/:id` |
  | Contactos | `/contactos` | `/contactos/:id` |
  | Investidores | `/investidores` | `/investidores/:id` |
  | Finanças | `/financas` | `/financas/:id` |
  | Documentos | `/documentos` | `/documentos/:id` |
  | Definições | `/definicoes` | — |
  | Portal do investidor | `/portal` | — |

- Os separadores dentro de um detalhe (Resumo, Análise financeira…) usam `?tab=`, para que um link abra o separador certo.

## 5. Design: seguir o mockup

O mockup (`mockup/src`) é a referência visual. **Não tem de ser cópia exata, mas o essencial tem de ser igual:** layout, hierarquia, cores, densidade, tipografia e comportamento em telemóvel.

- **Tokens** (já estão em `@theme` no `src/index.css`; os valores de origem estão no fim de `mockup/src/index.css`):
  - Marca `--brand #0f6b6e`, `--brand-dark #0a4f52`, `--brand-soft #e5f2f1`
  - Texto `--ink #172323`, secundário `--muted #687777`, linhas `--line #dfe7e5`, fundo `#f3f4f4`
  - Estados: verde `#16805d`/`#e8f5ef`, vermelho `#c44843`/`#fbeceb`, âmbar `#a56b14`/`#fff5df`
  - Sidebar `#0d2f31` com 200px de largura; topbar com 58px
  - Raio 3–4px, **sem sombras**, superfícies planas com borda `1px var(--line)`
  - Fonte **DM Sans**, 13px de base, `font-variant-numeric: tabular-nums` em números e tabelas
- **Já implementado (reutilizar, nunca duplicar):**
  - `components/layout/`: `AppLayout`, `Sidebar`, `Topbar`, `MobileNav` e `navigation.ts` (menu e rotas). Para uma nova página do menu, basta trocar o `PlaceholderPage` da rota em `App.tsx`.
  - `components/ui/` — base: `Icon`, `Avatar`, `Button`, `ButtonLink`, `Pill`, `Panel`, `PanelHeader`, `PageHeading`, `EntityHeader`, `RecordFields`, `Notice`, `Timeline`, `LoadingState`, `ErrorState`, `EmptyState`.
  - `components/ui/` — dados e gráficos: `Table`, `Filters`, `StatCard`, `VerticalBarChart`, `HorizontalBars`, `StackedTrack`.
  - `components/ui/` — formulários: `FormField`, `NumberInput`, `SegmentedChoice`, `FileUploadButton`, `inputClasses` (classes para `input`, `select` e `textarea`).
  - `components/ui/` — sobreposições e navegação: `Dialog`, `Drawer`, `DropdownMenu`, `Tabs`, `FloatingActionButton`, `useEscape`.
  - `components/ui/` — fluxos: `KanbanBoard` (usa `KanbanColumn`), `PhaseStepper`, `ImportExcel` (usa `ImportStep` e `lib/csv.ts`).
  - `Select` aceita texto (`"T2"`) ou `{ value, label }` (ex.: id e nome). **Nunca usar `<select>` solto** fora de `components/ui/`.
  - `VerticalBarChart` aceita `compare` (segunda barra, ex.: previsto vs. realizado), `formatValue` e `legend`.
- **Componentes de domínio partilhados (reutilizar, nunca duplicar):**
  - `components/documents/DocumentsPanel` é **o** separador "Documentos" de qualquer registo: `<DocumentsPanel owner={{ kind: "operation", id }} />` (`opportunity`, `operation`, `work`, `investment`, `movement`, `property`). Os tipos permitidos e os obrigatórios por `kind` vêm de `src/temp.tsx`; os avisos de validade e de obrigatórios em falta aparecem sozinhos.
  - `components/finance/MovementsTable` é **a** tabela de movimentos: nos detalhes de operação, investimento e obra usa `useMovements({ link: { kind, id } })` e `hideLink`.
  - `hooks/useUrlFilters(keys)` guarda os filtros de uma lista no URL.
  - `lib/links.ts` (`entityPath`) dá o caminho de qualquer entidade associada.
  - Se faltar alguma coisa a um destes componentes, alarga-o com uma prop opcional.
- **Padrões do mockup ainda por criar (criar quando forem precisos):** quadros de domínio como o cartão de oportunidade, cartão escuro de resultados (`results-card`).
- **Ícones:** usar o componente `Icon` (SVG de traço 1.8) com o mesmo conjunto de ícones do mockup. Não juntar outra biblioteca de ícones sem motivo.
- **Telemóvel (≤720px):** a sidebar dá lugar à barra inferior (`MobileNav`), as tabelas passam a linhas compactas, os kanbans fazem scroll horizontal com snap e os formulários ficam numa coluna. Testa sempre a 390px de largura.
- **Se o mockup não cobrir o caso**, segue os padrões mais próximos que já existem e diz explicitamente o que inventaste.

## 6. Dados e API

- Todos os pedidos passam por `apiFetch` (`src/api/client.ts`). Nunca usar `fetch` diretamente num componente.
- Um ficheiro por recurso em `src/api/` com os tipos da resposta, e um hook TanStack Query em `src/hooks/` (`useQuery` para ler, `useMutation` + `invalidateQueries` para escrever).
- **Todas as listas e detalhes tratam quatro estados:** a carregar, erro (com "Tentar novamente"), vazio (com uma mensagem útil) e com dados.
- **Se o endpoint ainda não existir:** cria dados de exemplo em `src/temp.tsx` (tudo o que é hard coded vive aí), devolvidos pela mesma função da API, com `// TODO: trocar pelo endpoint quando existir`. Os componentes não podem saber se os dados são reais ou de exemplo.
- **Operações e definições:** os registos de exemplo, origens, níveis de acesso, direções, limites iniciais e listas de opções também ficam em `src/temp.tsx`. As stores em `src/api/fixtures/` só simulam validação e mutações e leem esses dados; não criam um segundo conjunto de fixtures.
- O servidor simulado fica em `src/api/fixtures/<recurso>Store.ts` (usa `respond` de `fixtures/respond.ts`), valida com as mesmas regras de `src/lib/` e responde 422 com a mensagem em pt-PT. Datas de exemplo relativas a hoje, para os estados (atrasado, a expirar) fazerem sentido em qualquer dia.
- Os dados de exemplo usam pessoas e emails fictícios (`@exemplo.pt`), nunca dados reais.

### Validação de formulários

- Os limites de cada campo ficam em `src/lib/` (`opportunityRules.ts`, `leadRules.ts`, `workRules.ts`), nunca escritos à mão no componente. O formulário e o servidor simulado usam as mesmas regras.
- **Todos os campos de texto têm `maxLength`**, e o servidor simulado recusa (422) o que exceder. Nenhum campo aceita texto sem limite.
- **Telemóvel:** só dígitos, espaços e um `+` inicial (o campo remove letras e símbolos ao escrever), entre 9 e 15 dígitos, máximo 20 caracteres.
- **Nome da lead:** 2 a 80 caracteres. **Referenciado por:** até 80. **Mensagem:** até 500. **Contacto registado:** responsável até 80, resultado até 120, nota até 500.
- **Nome (leads e contactos):** só letras, espaços, hífens, pontos e apóstrofos. **Palavras:** nenhum texto aceita palavras com mais de 40 caracteres sem espaços (partiam o layout).
- **Contacto** (`contactRules.ts`): nome 2 a 80; email opcional, formato válido, até 120; telemóvel opcional com as regras acima; empresa até 80; NIF opcional, 9 dígitos com dígito de controlo válido; morada até 200; notas até 500; com consentimento RGPD o canal é obrigatório (a data é automática).
- **Perfil de investidor** (`investorRules.ts`): capital disponível, montante mínimo e máximo em euros (`MONEY`), maiores que 0, com **mínimo ≤ máximo ≤ capital**; perfil de risco e estado da relação obrigatórios; prazos preferidos até 200.
- **Investimento:** operação, tipo de retorno e data obrigatórios; valor comprometido > 0 (`MONEY`); participação > 0 e taxa entre 0 e 100 (`PERCENT`).
- **Obras:** **Nome da obra:** 3 a 80 caracteres. **Notas:** até 500 caracteres. **Datas:** data de fim ≥ data de início. **Orçamento:** categoria e empreiteiro até 80 caracteres; valores com `MONEY` (0 a 99 999 999 €); regras de negócio: pago ≤ faturado ≤ contratado e executado ≤ contratado.
- Os erros aparecem por campo só depois de tentar submeter, em pt-PT. Se o servidor recusar, mostra-se um `Notice` no formulário.
- Na importação de Excel, as linhas que não cumprem estas regras são ignoradas.
- **Imóveis** (`lib/propertyRules.ts`): morada 3–60 (como o título das oportunidades), área 1–99 999 m² com 2 casas, ano de construção 1800–ano atual, preço pedido e VVR em `MONEY` e > 0, URL do anúncio `http(s)://` até 300, notas até 500.
- **Movimentos** (`lib/financeRules.ts`): valor `MONEY` > 0, pelo menos uma data (prevista ou efetiva), data efetiva nunca no futuro, associação obrigatória quando se escolhe um tipo, notas até 500. Uma saída ligada a um item de orçamento não pode exceder o valor contratado em falta. O estado vem das datas (`movementStatus`): com data efetiva → Realizado; prevista já passada → Atrasado; senão Previsto.
- **Financiamentos:** nome 2–80, montante `MONEY` > 0.
- **Documentos** (`lib/documentRules.ts`): máximo 10 MB por ficheiro e 20 ficheiros por pedido, nome até 120, tipo da lista do `kind`, validade opcional. "A expirar" a menos de 30 dias.
- Datas sem hora são texto `aaaa-mm-dd` (`todayIso`, `isValidIsoDate` em `lib/format.ts`) e comparam-se como texto.

## 7. Texto e formatação

- Toda a interface em **português de Portugal**.
- Dinheiro: `Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })`. Datas: `dd/mm/aaaa`. Percentagens com vírgula (`22,8%`). Usar sempre as funções de `src/lib/format.ts` e não formatar à mão.
- Os nomes das fases têm de corresponder ao mockup:
  - **Oportunidades (1–8):** Novo, Contactado, Análise financeira, Informação pendente, Due diligence, Negociação, CPCV, Aprovado
  - **Operações (9–15):** Em aquisição, Adquirido, Em obra, Em preparação para venda, À venda, Vendido, Fechado

## 8. Qualidade e acessibilidade

- Botões são `<button>` e links de navegação são `<Link>`. Os botões só com ícone têm `aria-label`.
- Os campos de formulário têm `<label>`. Os modais fecham com Esc e com clique fora.
- Sem `console.log` no código final. Sem código comentado "para depois".

## 9. Antes de dar a tarefa por terminada

- [ ] Procurei e reutilizei componentes existentes, sem duplicados
- [ ] Cada bloco novo é um componente em `components/`, e a página só compõe
- [ ] A página tem rota em `App.tsx` e entrada no menu, se fizer parte do menu
- [ ] O visual corresponde ao mockup no essencial, em desktop e a 390px
- [ ] Os quatro estados estão tratados (a carregar, erro, vazio, com dados)
- [ ] Estilos só com classes Tailwind e tokens do tema (sem `.css` novos, sem cores hexadecimais soltas)
- [ ] Textos em pt-PT; dinheiro, datas e % formatados por `lib/format.ts`
- [ ] `npm run typecheck` e `npm run build` passam sem erros
- [ ] Resumo final: componentes criados, componentes alterados e diferenças em relação ao mockup
