// ============================================================
// CAJUNA PLANNER — Google Apps Script Backend v5
// ============================================================

const SHEET_ID    = '18Q3C9cL2KCmgCVnkY1huhD5wtlMTQ4WUnjUiyEFPdsQ';
const SHEET_TASKS = 'Tarefas';
const SHEET_ATAS  = 'Atas';
const SHEET_DEALS = 'Deals';
const SHEET_USERS = 'Usuarios';

// ---- CORS helper ----
function setCors(output) {
  return output.setMimeType(ContentService.MimeType.JSON);
}

// O Apps Script não permite setar Access-Control-Allow-Origin manualmente,
// mas ao implantar como "Qualquer pessoa (anônimos)" e usar fetch com mode:'cors'
// via URL de implantação, o Google já inclui os headers necessários.
// IMPORTANTE: sempre use a URL /exec, nunca /dev.

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'load';
  let result;
  try {
    if      (action === 'getTasks') result = { ok:true, tasks: getTasks() };
    else if (action === 'getAtas')  result = { ok:true, atas:  getAtas()  };
    else if (action === 'getDeals') result = { ok:true, deals: getDeals() };
    else if (action === 'load' || action === 'getAll')
      result = { ok:true, tasks: getTasks(), atas: getAtas(), deals: getDeals() };
    else result = { ok:false, error: 'Ação inválida' };
  } catch(err) {
    result = { ok:false, error: err.message };
  }
  return setCors(ContentService.createTextOutput(JSON.stringify(result)));
}

function doPost(e) {
  let body, result;
  try {
    body = JSON.parse(e.postData.contents);
    const action = body.action;
    if      (action === 'login')      result = loginUser(body.email, body.senha);
    else if (action === 'saveTask')   result = saveTask(body.task);
    else if (action === 'deleteTask') result = deleteTask(body.id);
    else if (action === 'saveTasks')  result = saveTasks(body.tasks);
    else if (action === 'saveAtas')   result = saveAtas(body.atas);
    else if (action === 'saveDeal')   result = saveDeal(body.deal);
    else if (action === 'saveDeals')  result = saveDeals(body.deals);
    else if (action === 'deleteDeal') result = deleteDeal(body.id);
    else result = { ok:false, error: 'Ação inválida' };
  } catch(err) {
    result = { ok:false, error: err.message };
  }
  return setCors(ContentService.createTextOutput(JSON.stringify(result)));
}

// ================================================================
// LOGIN
// ================================================================
function loginUser(email, senha) {
  const sheet = getOrCreateSheet(SHEET_USERS);
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return { ok:false, error:'Nenhum usuário cadastrado.' };
  const h = data[0].map(String);
  const iE = h.indexOf('email'), iS = h.indexOf('senha'),
        iT = h.indexOf('tipo'),  iN = h.indexOf('nome');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][iE]).trim().toLowerCase() === email.trim().toLowerCase() &&
        String(data[i][iS]).trim() === senha.trim()) {
      return { ok:true,
        nome:  iN >= 0 ? String(data[i][iN]) : '',
        email: String(data[i][iE]).trim().toLowerCase(),
        tipo:  iT >= 0 ? String(data[i][iT]) : 'dashboard' };
    }
  }
  return { ok:false, error:'Email ou senha incorretos.' };
}

// ================================================================
// TAREFAS
// ================================================================
function getTasks() {
  const sheet = getOrCreateSheet(SHEET_TASKS);
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0].map(String);
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => { obj[h] = row[i]; });
    return obj;
  });
}

function saveTasks(tasks) {
  const sheet = getOrCreateSheet(SHEET_TASKS);
  sheet.clearContents();
  const H = ['id','tarefa','setor','responsavel','inicio','fim','mes','status','obs'];
  sheet.appendRow(H);
  tasks.forEach(t => sheet.appendRow(H.map(h => t[h] !== undefined ? t[h] : '')));
  return { ok:true, count: tasks.length };
}

function saveTask(task) {
  const sheet   = getOrCreateSheet(SHEET_TASKS);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0].map(String);
  const idCol   = headers.indexOf('id');
  if (!task.id) {
    const ids = data.slice(1).map(r => Number(r[idCol])).filter(Boolean);
    task.id = ids.length ? Math.max(...ids) + 1 : 1;
  }
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(task.id)) {
      headers.forEach((h,j) => { if (task[h] !== undefined) sheet.getRange(i+1,j+1).setValue(task[h]); });
      return { ok:true, id:task.id, action:'updated' };
    }
  }
  sheet.appendRow(headers.map(h => task[h] !== undefined ? task[h] : ''));
  return { ok:true, id:task.id, action:'created' };
}

function deleteTask(id) {
  const sheet = getOrCreateSheet(SHEET_TASKS);
  const data  = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('id');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) { sheet.deleteRow(i+1); return { ok:true }; }
  }
  return { ok:false, error:'Não encontrado' };
}

// ================================================================
// ATAS
// ================================================================
function getAtas() {
  const sheet = getOrCreateSheet(SHEET_ATAS);
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0].map(String);
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => { obj[h] = row[i]; });
    return obj;
  });
}

function saveAtas(atas) {
  const sheet = getOrCreateSheet(SHEET_ATAS);
  sheet.clearContents();
  const H = ['key','data','diaSemana','tipo','isoData','status','presentes','ata','decisoes','proximos'];
  sheet.appendRow(H);
  atas.forEach(a => sheet.appendRow(H.map(h => a[h] !== undefined ? a[h] : '')));
  return { ok:true, count: atas.length };
}

// ================================================================
// DEALS (CRM Kanban)
// ================================================================
function getDeals() {
  const sheet = getOrCreateSheet(SHEET_DEALS);
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0].map(String);
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => {
      obj[h] = (h === 'tags')
        ? (row[i] ? String(row[i]).split(',').map(t => t.trim()).filter(Boolean) : [])
        : row[i];
    });
    return obj;
  });
}

function saveDeals(deals) {
  const sheet = getOrCreateSheet(SHEET_DEALS);
  sheet.clearContents();
  const H = ['id','cliente','servico','valor','responsavel','prioridade','coluna','ultimoContato','contato','tags','obs'];
  sheet.appendRow(H);
  deals.forEach(d => sheet.appendRow(H.map(h => {
    if (h === 'tags') return Array.isArray(d[h]) ? d[h].join(', ') : (d[h]||'');
    return d[h] !== undefined ? d[h] : '';
  })));
  return { ok:true, count: deals.length };
}

function saveDeal(deal) {
  const sheet   = getOrCreateSheet(SHEET_DEALS);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0].map(String);
  const idCol   = headers.indexOf('id');
  if (!deal.id) deal.id = 'deal_' + Date.now();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(deal.id)) {
      headers.forEach((h,j) => {
        const val = (h==='tags')
          ? (Array.isArray(deal[h]) ? deal[h].join(', ') : (deal[h]||''))
          : (deal[h] !== undefined ? deal[h] : '');
        sheet.getRange(i+1,j+1).setValue(val);
      });
      return { ok:true, id:deal.id, action:'updated' };
    }
  }
  const H2 = ['id','cliente','servico','valor','responsavel','prioridade','coluna','ultimoContato','contato','tags','obs'];
  sheet.appendRow(H2.map(h => {
    if (h==='tags') return Array.isArray(deal[h]) ? deal[h].join(', ') : (deal[h]||'');
    return deal[h] !== undefined ? deal[h] : '';
  }));
  return { ok:true, id:deal.id, action:'created' };
}

function deleteDeal(id) {
  const sheet = getOrCreateSheet(SHEET_DEALS);
  const data  = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('id');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) { sheet.deleteRow(i+1); return { ok:true }; }
  }
  return { ok:false, error:'Não encontrado' };
}

// ================================================================
// HELPERS
// ================================================================
function getOrCreateSheet(name) {
  const ss  = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === SHEET_TASKS) {
      sheet.appendRow(['id','tarefa','setor','responsavel','inicio','fim','mes','status','obs']);
      seedDefaultTasks(sheet);
    }
    if (name === SHEET_ATAS)
      sheet.appendRow(['key','data','diaSemana','tipo','isoData','status','presentes','ata','decisoes','proximos']);
    if (name === SHEET_DEALS)
      sheet.appendRow(['id','cliente','servico','valor','responsavel','prioridade','coluna','ultimoContato','contato','tags','obs']);
    if (name === SHEET_USERS) {
      sheet.appendRow(['email','senha','tipo','nome']);
      sheet.appendRow(['admin@cajunastudio.com.br','cajuna2026','dashboard','Admin']);
    }
  }
  return sheet;
}

function seedDefaultTasks(sheet) {
  const T = [
    [1, 'Finalizar e publicar site','Site','Alex + Hugo','2026-06-23','2026-06-29','Mês 1 — Consolidação','A fazer',''],
    [2, 'Estruturar processo comercial','Comercial','Alex + Ewerton','2026-06-23','2026-06-29','Mês 1 — Consolidação','A fazer',''],
    [3, 'Template de proposta visual','Comercial','Alex','2026-06-30','2026-07-06','Mês 1 — Consolidação','A fazer',''],
    [4, 'Configurar Trello (funil)','Operações','Alex + Ewerton','2026-06-30','2026-07-06','Mês 1 — Consolidação','A fazer',''],
    [5, 'Lançar Instagram e TikTok','Conteúdo','Hugo','2026-07-07','2026-07-13','Mês 1 — Consolidação','A fazer',''],
    [6, 'Revisar contratos e termos','Jurídico','Alex','2026-07-07','2026-07-13','Mês 1 — Consolidação','A fazer',''],
    [7, 'Definir metas de faturamento','Financeiro','Ewerton + Alex','2026-07-14','2026-07-22','Mês 1 — Consolidação','A fazer',''],
    [8, 'Documentar SLA de entregas','Operações','Hugo + Alex','2026-07-14','2026-07-22','Mês 1 — Consolidação','A fazer',''],
    [9, 'Prospecção ativa (leads)','Comercial','Alex + Ewerton','2026-07-23','2026-08-05','Mês 2 — Ativação Comercial','A fazer',''],
    [10,'Testar fluxo de briefing','Experiência','Ewerton + Hugo','2026-07-23','2026-08-05','Mês 2 — Ativação Comercial','A fazer',''],
    [11,'Produzir 1º case/portfólio','Criativo','Hugo','2026-08-06','2026-08-12','Mês 2 — Ativação Comercial','A fazer',''],
    [12,'Subir campanhas tráfego pago','Marketing','Hugo','2026-08-06','2026-08-19','Mês 2 — Ativação Comercial','A fazer',''],
    [13,'Revisão de precificação','Financeiro','Ewerton + Alex','2026-08-13','2026-08-22','Mês 2 — Ativação Comercial','A fazer',''],
    [14,'Controle de caixa e NF','Financeiro','Ewerton','2026-08-23','2026-09-05','Mês 3 — Crescimento','A fazer',''],
    [15,'Upsell ID Visual → Social','Comercial','Alex + Ewerton','2026-08-23','2026-09-05','Mês 3 — Crescimento','A fazer',''],
    [16,'Retrospectiva dos 3 meses','Operações','Todos','2026-09-09','2026-09-15','Mês 3 — Crescimento','A fazer',''],
    [17,'Planejamento próximo trimestre','Operações','Todos','2026-09-16','2026-09-22','Mês 3 — Crescimento','A fazer',''],
  ];
  T.forEach(t => sheet.appendRow(t));
}
