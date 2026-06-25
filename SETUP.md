# 🚀 Cajuna Planner — Setup em 5 minutos

## O que você vai precisar
- Conta Google
- Planilha Google Sheets (criar do zero)
- Este repositório publicado via GitHub Pages

---

## Passo 1 — Criar a Planilha

1. Acesse [drive.google.com](https://drive.google.com)
2. Crie uma nova **Planilha Google** (pode deixar em branco — as abas são criadas automaticamente)
3. Copie o **ID** da planilha — é o trecho longo entre `/d/` e `/edit` na URL:
   ```
   https://docs.google.com/spreadsheets/d/ → COLE_ESTE_TRECHO ← /edit
   ```

---

## Passo 2 — Configurar o Apps Script (API)

1. Dentro da planilha: **Extensões > Apps Script**
2. Apague tudo que estiver no editor
3. Cole o conteúdo completo do arquivo `api.gs` deste repositório
4. Na linha `const SHEET_ID = 'COLE_O_ID_DA_SUA_PLANILHA_AQUI';`, substitua pelo ID copiado no Passo 1
5. Salve com **Ctrl+S**
6. Clique em **Implantar > Nova implantação**
   - Tipo: **Web App**
   - Executar como: **Eu mesmo**
   - Quem pode acessar: **Qualquer pessoa (inclusive anônimos)**
7. Clique em **Implantar**, autorize as permissões solicitadas
8. **Copie a URL gerada** — começa com `https://script.google.com/macros/s/...`

---

## Passo 3 — Conectar a URL no Site

1. No arquivo `index.html` deste repositório, localize a linha:
   ```javascript
   const API_URL = 'COLE_A_URL_DO_APPS_SCRIPT_AQUI';
   ```
2. Substitua `COLE_A_URL_DO_APPS_SCRIPT_AQUI` pela URL copiada no Passo 2
3. Salve e faça commit (ou edite direto no GitHub)

---

## Passo 4 — Publicar via GitHub Pages

1. No repositório: **Settings > Pages**
2. Source: **Deploy from a branch**
3. Branch: **main / root**
4. Salve — em ~1 minuto o site estará online
5. Compartilhe a URL com toda a equipe!

---

## ✅ Resultado

As abas da planilha (**Tarefas**, **Atas**, **Deals**) são criadas automaticamente no primeiro acesso.
As 17 tarefas do planejamento estratégico já vêm pré-carregadas.

**Qualquer pessoa com o link acessa e edita os mesmos dados em tempo real — sem instalar nada, sem configurar nada.**

---

## ⚠️ Importante: Reimplantar após editar o api.gs

Se você editar o `api.gs` no futuro, sempre crie uma **nova implantação** (não edite a existente).
A URL muda — atualize no `index.html` também.
