# 🚀 Cajuna Planner — Guia de Setup Completo

## Visão geral

O sistema tem 3 partes:
1. **Google Sheets** — banco de dados (abas: Tarefas, Atas, Deals, Config)
2. **Google Apps Script** (`api.gs`) — API que conecta o site à planilha
3. **Site** (`index.html`) — hospedado no GitHub Pages

---

## PASSO 1 — Criar a planilha

1. Acesse [sheets.new](https://sheets.new) para criar uma planilha nova
2. Renomeie para **"Cajuna Planner"**
3. Copie o **ID da planilha** — é o trecho longo da URL entre `/d/` e `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/ **SEU_ID_AQUI** /edit
   ```

---

## PASSO 2 — Configurar o Apps Script

1. Na planilha: **Extensões > Apps Script**
2. Apague tudo e cole o conteúdo do arquivo `api.gs` deste repositório
3. Na linha 10, substitua `COLE_O_ID_DA_SUA_PLANILHA_AQUI` pelo ID copiado no Passo 1:
   ```js
   const SHEET_ID = 'SEU_ID_AQUI';
   ```
4. Salve (Ctrl+S)
5. Clique em **Implantar > Nova implantação**
   - Tipo: **Web App**
   - Executar como: **Eu mesmo**
   - Quem pode acessar: **Qualquer pessoa**
6. Clique **Implantar**, autorize as permissões
7. **Copie a URL** gerada (começa com `https://script.google.com/macros/s/...`)

---

## PASSO 3 — Conectar o site à API

1. Abra o site no navegador
2. Clique em **⚙ Configurações** (canto inferior esquerdo na sidebar)
3. Cole a URL do Apps Script no campo
4. Clique **Salvar e Reconectar**
5. O indicador deve ficar 🟢 **Sheets conectado**

> A URL fica salva no `localStorage` do navegador. Cada pessoa que acessar o site precisa fazer esse passo **uma única vez**.

---

## PASSO 4 — Publicar o site (GitHub Pages)

1. No repositório GitHub: **Settings > Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / pasta: **/ (root)**
4. Salve — em ~1 minuto o site estará disponível em:
   ```
   https://cajunastudio.github.io/cajuna-planner/
   ```
5. Compartilhe esse link com toda a equipe

---

## Estrutura da planilha

| Aba | Colunas |
|---|---|
| **Tarefas** | id, tarefa, setor, responsavel, inicio, fim, mes, status, obs |
| **Atas** | key, data, diaSemana, tipo, isoData, status, presentes, ata, decisoes, proximos |
| **Deals** | id, cliente, servico, valor, responsavel, prioridade, coluna, ultimoContato, contato, tags, obs |
| **Config** | ganttStart, ganttEnd |

As abas são criadas automaticamente pelo script na primeira execução.

---

## ⚠️ Problemas comuns

| Problema | Solução |
|---|---|
| Indicador vermelho "Modo offline" | Verifique se a URL do script está correta em ⚙ Configurações |
| Dados não aparecem para outros | Cada usuário precisa colar a URL em Configurações uma vez |
| Erro de autorização | Reimplante o script e reautorize |
| Aba não criada na planilha | Acesse `?action=getAll` na URL da API para forçar criação |
