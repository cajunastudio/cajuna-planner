// ============================================================
// CAJUNA PLANNER — Google Apps Script Backend
// Cole este código em: Extensões > Apps Script > Novo projeto
// Depois: Implantar > Nova implantação > Web App
//   - Executar como: Eu mesmo
//   - Quem pode acessar: Qualquer pessoa
// Copie a URL gerada e cole em index.html na variável API_URL
// ============================================================

const SHEET_ID = '1Ik8J2Zp_9isYuZlZQUabK4111p7Omaku8qJp93Yp7gY';
const SHEET_TASKS    = 'Tarefas';
const SHEET_MEETINGS = 'Reunioes';
const SHEET_CONFIG   = 'Config';

function doGet(e) {
  const action = e.parameter.action || 'getTasks';
  let result;
  try {
    if (action === 'getTasks')    result = getTasks();
    else if (action === 'getMeetings') result = getMeetings();
    else if (action === 'getConfig')   result = getConfig();
    else result = { error: 'Ação inválida' };
  } catch(err) {
    result = { error: err.message };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let body, result;
  try {
    body = JSON.parse(e.postData.contents);
    const action = body.action;
    if      (action === 'saveTasks')   result = saveTasks(body.tasks);
    else if (action === 'saveTask')    result = saveTask(body.task);
    else if (action === 'deleteTask')  result = deleteTask(body.id);
    else if (action === 'saveConfig')  result = saveConfig(body.config);
    else result = { error: 'Ação inválida' };
  } catch(err) {
    result = { error: err.message };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- TASKS ----

function getTasks() {
  const sheet = getOrCreateSheet(SHEET_TASKS);
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function saveTasks(tasks) {
  const sheet = getOrCreateSheet(SHEET_TASKS);
  sheet.clearContents();
  const headers = ['id','tarefa','setor','responsavel','inicio','fim','mes','status','obs'];
  sheet.appendRow(headers);
  tasks.forEach(t => {
    sheet.appendRow(headers.map(h => t[h] !== undefined ? t[h] : ''));
  });
  return { ok: true, count: tasks.length };
}

function saveTask(task) {
  const sheet = getOrCreateSheet(SHEET_TASKS);
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');

  // Garante ID
  if (!task.id) {
    const ids = data.slice(1).map(r => Number(r[idCol])).filter(Boolean);
    task.id = ids.length ? Math.max(...ids) + 1 : 1;
  }

  // Tenta atualizar linha existente
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(task.id)) {
      headers.forEach((h, j) => {
        if (task[h] !== undefined) sheet.getRange(i + 1, j + 1).setValue(task[h]);
      });
      return { ok: true, id: task.id, action: 'updated' };
    }
  }

  // Nova linha
  sheet.appendRow(headers.map(h => task[h] !== undefined ? task[h] : ''));
  return { ok: true, id: task.id, action: 'created' };
}

function deleteTask(id) {
  const sheet = getOrCreateSheet(SHEET_TASKS);
  const data  = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('id');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { ok: true, id };
    }
  }
  return { ok: false, error: 'Tarefa não encontrada' };
}

// ---- MEETINGS ----

function getMeetings() {
  const sheet = getOrCreateSheet(SHEET_MEETINGS);
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

// ---- CONFIG ----

function getConfig() {
  const sheet = getOrCreateSheet(SHEET_CONFIG);
  const data  = sheet.getDataRange().getValues();
  const config = {};
  data.forEach(row => { if (row[0]) config[row[0]] = row[1]; });
  return config;
}

function saveConfig(config) {
  const sheet = getOrCreateSheet(SHEET_CONFIG);
  sheet.clearContents();
  Object.entries(config).forEach(([k, v]) => sheet.appendRow([k, v]));
  return { ok: true };
}

// ---- HELPERS ----

function getOrCreateSheet(name) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  let sheet   = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === SHEET_TASKS) {
      sheet.appendRow(['id','tarefa','setor','responsavel','inicio','fim','mes','status','obs']);
      seedDefaultTasks(sheet);
    }
    if (name === SHEET_MEETINGS) {
      sheet.appendRow(['data','diaSemana','tipo']);
    }
    if (name === SHEET_CONFIG) {
      sheet.appendRow(['ganttStart','2026-06-23']);
      sheet.appendRow(['ganttEnd',  '2026-09-22']);
    }
  }
  return sheet;
}

function seedDefaultTasks(sheet) {
  const tasks = [
    [1, 'Finalizar e publicar site',      'Site',        'Alex + Hugo',    '2026-06-23','2026-06-29','Mês 1 — Consolidação',      'A fazer',''],
    [2, 'Estruturar processo comercial',  'Comercial',   'Alex + Ewerton', '2026-06-23','2026-06-29','Mês 1 — Consolidação',      'A fazer',''],
    [3, 'Template de proposta visual',    'Comercial',   'Alex',           '2026-06-30','2026-07-06','Mês 1 — Consolidação',      'A fazer',''],
    [4, 'Configurar Trello (funil)',       'Operações',   'Alex + Ewerton', '2026-06-30','2026-07-06','Mês 1 — Consolidação',      'A fazer',''],
    [5, 'Lançar Instagram e TikTok',      'Conteúdo',    'Hugo',           '2026-07-07','2026-07-13','Mês 1 — Consolidação',      'A fazer',''],
    [6, 'Revisar contratos e termos',     'Jurídico',    'Alex',           '2026-07-07','2026-07-13','Mês 1 — Consolidação',      'A fazer',''],
    [7, 'Definir metas de faturamento',   'Financeiro',  'Ewerton + Alex', '2026-07-14','2026-07-22','Mês 1 — Consolidação',      'A fazer',''],
    [8, 'Documentar SLA de entregas',     'Operações',   'Hugo + Alex',    '2026-07-14','2026-07-22','Mês 1 — Consolidação',      'A fazer',''],
    [9, 'Prospecção ativa (leads)',        'Comercial',   'Alex + Ewerton', '2026-07-23','2026-08-05','Mês 2 — Ativação Comercial','A fazer',''],
    [10,'Testar fluxo de briefing',       'Experiência', 'Ewerton + Hugo', '2026-07-23','2026-08-05','Mês 2 — Ativação Comercial','A fazer',''],
    [11,'Produzir 1º case/portfólio',     'Criativo',    'Hugo',           '2026-08-06','2026-08-12','Mês 2 — Ativação Comercial','A fazer',''],
    [12,'Subir campanhas tráfego pago',   'Marketing',   'Hugo',           '2026-08-06','2026-08-19','Mês 2 — Ativação Comercial','A fazer',''],
    [13,'Revisão de precificação',        'Financeiro',  'Ewerton + Alex', '2026-08-13','2026-08-22','Mês 2 — Ativação Comercial','A fazer',''],
    [14,'Controle de caixa e NF',         'Financeiro',  'Ewerton',        '2026-08-23','2026-09-05','Mês 3 — Crescimento',       'A fazer',''],
    [15,'Upsell ID Visual → Social',      'Comercial',   'Alex + Ewerton', '2026-08-23','2026-09-05','Mês 3 — Crescimento',       'A fazer',''],
    [16,'Retrospectiva dos 3 meses',      'Operações',   'Todos',          '2026-09-09','2026-09-15','Mês 3 — Crescimento',       'A fazer',''],
    [17,'Planejamento próximo trimestre', 'Operações',   'Todos',          '2026-09-16','2026-09-22','Mês 3 — Crescimento',       'A fazer',''],
  ];
  tasks.forEach(t => sheet.appendRow(t));
}
