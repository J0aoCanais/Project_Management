# Base de dados

Documentação do modelo de dados do projeto Imoventures.

**Versão atual: v1**

![Diagrama ER v1](v1/ER.png)

## Ficheiros

| Ficheiro | Descrição |
|---|---|
| `v1/er.png` | Diagrama entidade-relação |
| `v1/model.json` | Modelo editável em https://onda.dei.uc.pt/v4/ |
| `v1/schema.sql` | Cópia de referência do SQL. O código em uso está em [`database/schema.sql`](../../database/schema.sql) |

## Entidades

| Entidade | Descrição |
|---|---|
| `contact` | Pessoas e empresas (compradores, investidores, empreiteiros) |
| `lead` | Contacto inicial que pode originar uma oportunidade |
| `opportunity` | Negócio em análise, antes da compra |
| `property` | Imóvel associado a uma oportunidade |
| `operation` | Negócio já fechado, em execução |
| `investment` | Investimento de um contacto numa operação |
| `construction_work` | Obra de uma operação |
| `construction_budget` | Rubricas de orçamento da obra |
| `financial_movement` | Entradas e saídas de dinheiro |
| `phase` | Fases do processo |
| `phase_history` | Histórico de mudanças de fase de oportunidades e operações |
| `investor_profile` | Perfil de investimento de um contacto investidor |
| `role` | Papéis que um contacto pode ter |
| `movement_category` | Categorias dos movimentos financeiros (entrada ou saída) |
| `users` | Utilizadores com acesso à aplicação |
| `lead_source` | Origens das leads |
| `task` | Tarefas de acompanhamento de leads e oportunidades |


## Versões

| Versão | Estado | Notas |
|---|---|---|
| v1 | atual | Modelo inicial |