# Cajuna Planner

Ferramenta de gestão estratégica da Cajuna Studio — Planejamento Jun–Set 2026.

🔗 **Acesse em:** https://cajunastudio.github.io/cajuna-planner

## Funcionalidades

- **Dashboard** — métricas de progresso por fase + barras de progresso + próximas reuniões
- **Cronograma Gantt** — visualização temporal por setor com indicador de status
- **Tarefas** — tabela editável com filtros por fase, setor, status e busca por texto
- **Reuniões** — pautas completas de terça e quinta + calendário Jun–Set 2026
- Adicionar, editar, excluir tarefas
- Ciclar status clicando no bullet (A fazer → Em andamento → Concluído)
- Campo de observação por tarefa
- **Google Sheets como backend** — dados salvos na planilha em tempo real
- Fallback para localStorage quando offline
- Exportar dados em JSON

## Configuração do Backend (Google Sheets)

1. Abra a planilha: https://docs.google.com/spreadsheets/d/1Ik8J2Zp_9isYuZlZQUabK4111p7Omaku8qJp93Yp7gY
2. Extensões → Apps Script → Novo projeto
3. Cole todo o conteúdo do arquivo `api.gs` deste repositório
4. **Implantar → Nova implantação → Web App**
   - Executar como: **Eu mesmo**
   - Quem pode acessar: **Qualquer pessoa**
5. Copie a URL gerada
6. No Planner, clique em **⚙ Configurações** e cole a URL
7. Salvar e Reconectar — pronto!

## Stack

- HTML puro · sem build · deploy via GitHub Pages
- [Tailwind CSS](https://tailwindcss.com) via CDN
- [Alpine.js](https://alpinejs.dev) para reatividade
- Google Apps Script como API REST gratuita
- Google Sheets como banco de dados
