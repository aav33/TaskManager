/*
  Mini Boards — single-file front-end demo.
  - LocalStorage based data model compatible with the DB model discussed earlier.
  - Supports: create board, create category, create task, mark done, delete, share-code generation (local) and join-by-code (local).
  - If you have backend endpoints, set appConfig.backendAvailable = true and fill api endpoints.
*/

const appConfig = {
  backendAvailable: false, // set true if you have working backend URLs
  api: {
    activateShare: '/api/activate_share.php',
    joinWithCode: '/api/join_with_code.php'
  }
};

// --- data helpers (localStorage) ---
function loadData() {
  const raw = localStorage.getItem('mini_boards_v1');
  return raw ? JSON.parse(raw) : { users:[], boards:[], categories:[], tasks:[] };
}
function saveData(data) { localStorage.setItem('mini_boards_v1', JSON.stringify(data)); }

function uid() { return Math.floor(Date.now() + Math.random()*1000); }

// initial demo data
let store = loadData();
if (!store._initialized) {
  const me = { id: 1, email: 'demo@example.com', display_name: 'Demo' };
  store.users.push(me);
  const bid = uid();
  store.boards.push({ id: bid, owner_id: me.id, title: 'Esimerkkitaulu', visibility: 'private', share_code: null, share_code_expires: null, created_at: new Date().toISOString() });
  const c1 = uid(); const c2 = uid();
  store.categories.push({ id: c1, board_id: bid, name: 'Koulu', color: '#6c63ff' });
  store.categories.push({ id: c2, board_id: bid, name: 'Koti', color: '#ff9f1c' });
  store.tasks.push({ id: uid(), category_id: c1, title: 'Tee harjoitukset', is_done: 0, position: 1 });
  store.tasks.push({ id: uid(), category_id: c1, title: 'Lue kappale 3', is_done: 1, position: 2 });
  store.tasks.push({ id: uid(), category_id: c2, title: 'Siivoa huone', is_done: 0, position: 1 });
  store._initialized = true;
  saveData(store);
}

let currentUserId = store.users[0].id;
let currentBoardId = store.boards[0].id;

// --- DOM refs ---
const boardsList = document.getElementById('boardsList');
const newBoardTitle = document.getElementById('newBoardTitle');
const createBoardBtn = document.getElementById('createBoardBtn');
const boardTitle = document.getElementById('boardTitle');
const boardMeta = document.getElementById('boardMeta');
const columnsEl = document.getElementById('columns');
const shareBtn = document.getElementById('shareBtn');
const shareCodeBox = document.getElementById('shareCodeBox');
const shareCodeText = document.getElementById('shareCodeText');
const copyShareBtn = document.getElementById('copyShareBtn');
const joinCodeInput = document.getElementById('joinCodeInput');
const joinCodeBtn = document.getElementById('joinCodeBtn');
const joinMsg = document.getElementById('joinMsg');

function renderBoards() {
  boardsList.innerHTML = '';
  store.boards.forEach(b => {
    const el = document.createElement('div');
    el.className = 'board-item' + (b.id===currentBoardId? ' active':'');
    el.innerHTML = `<div>${escapeHtml(b.title)}</div><div class="small">${b.visibility}</div>`;
    el.onclick = ()=>{ currentBoardId = b.id; render(); };
    boardsList.appendChild(el);
  });
}

function render() {
  renderBoards();
  const board = store.boards.find(b=>b.id===currentBoardId);
  if (!board) { boardTitle.textContent = 'Valitse taulu'; columnsEl.innerHTML=''; boardMeta.textContent=''; shareCodeBox.style.display='none'; return; }
  boardTitle.textContent = board.title;
  boardMeta.textContent = `Omistaja: ${board.owner_id} • ${board.visibility}`;
  if (board.share_code) {
    shareCodeBox.style.display='flex';
    shareCodeText.textContent = `Koodi: ${board.share_code} (exp: ${board.share_code_expires? new Date(board.share_code_expires).toLocaleString() : '∞'})`;
  } else {
    shareCodeBox.style.display='none';
  }

  const categories = store.categories.filter(c=>c.board_id===board.id);
  columnsEl.innerHTML = '';
  categories.forEach(cat => {
    const col = document.createElement('div'); col.className='column';
    col.innerHTML = `<h3><span class="color-dot" style="background:${cat.color||'#ddd'}"></span>${escapeHtml(cat.name)}</h3>`;
    const inputRow = document.createElement('div'); inputRow.className='input-row';
    const tInput = document.createElement('input'); tInput.placeholder='Uusi tehtävä';
    const addBtn = document.createElement('button'); addBtn.className='btn'; addBtn.textContent='Lisää';
    addBtn.onclick = ()=>{ if(tInput.value.trim()) addTask(cat.id, tInput.value.trim()); tInput.value=''; };
    inputRow.appendChild(tInput); inputRow.appendChild(addBtn);
    col.appendChild(inputRow);

    const tasks = store.tasks.filter(t=>t.category_id===cat.id).sort((a,b)=>a.position-b.position);
    if (tasks.length===0) {
      const ph = document.createElement('div'); ph.className='placeholder'; ph.textContent='Ei tehtäviä'; col.appendChild(ph);
    } else {
      tasks.forEach(t=>{ const tEl = renderTask(t); col.appendChild(tEl); });
    }
    const footer = document.createElement('div'); footer.style.marginTop='8px';
    const delCat = document.createElement('button'); delCat.className='btn ghost'; delCat.textContent='Poista kategoria';
    delCat.onclick = ()=>{ if(confirm('Poistetaanko kategoria ja sen tehtävät?')) deleteCategory(cat.id); };
    footer.appendChild(delCat);
    col.appendChild(footer);

    columnsEl.appendChild(col);
  });

  const addCol = document.createElement('div'); addCol.className='column';
  addCol.innerHTML = `<h3>+ Lisää minitaulu</h3>`;
  const inputRow = document.createElement('div'); inputRow.className='input-row';
  const nameInput = document.createElement('input'); nameInput.placeholder='Kategorian nimi';
  const colorInput = document.createElement('input'); colorInput.type='color'; colorInput.value='#6c63ff'; colorInput.title='väri';
  const addBtn = document.createElement('button'); addBtn.className='btn'; addBtn.textContent='Lisää';
  addBtn.onclick = ()=>{ if(nameInput.value.trim()) addCategory(currentBoardId, nameInput.value.trim(), colorInput.value); nameInput.value=''; };
  inputRow.appendChild(nameInput); inputRow.appendChild(colorInput); inputRow.appendChild(addBtn);
  addCol.appendChild(inputRow);
  columnsEl.appendChild(addCol);
}

function renderTask(t) {
  const div = document.createElement('div'); div.className='task'+(t.is_done? ' done':'');
  div.innerHTML = `<input type='checkbox' ${t.is_done? 'checked':''} /> <div class='title'>${escapeHtml(t.title)}</div> <div style='display:flex;gap:6px'><button class='btn ghost' data-id='edit'>✎</button><button class='btn ghost' data-id='del'>🗑</button></div>`;
  const cb = div.querySelector('input[type=checkbox]'); cb.onchange = ()=> toggleDone(t.id, cb.checked);
  div.querySelector("button[data-id='del']").onclick = ()=>{ if(confirm('Poistetaanko tehtävä?')) deleteTask(t.id); };
  div.querySelector("button[data-id='edit']").onclick = ()=>{ const nv = prompt('Muokkaa tehtävää', t.title); if(nv) editTask(t.id, nv); };
  return div;
}

// --- data operations ---
function addBoard(title) {
  const b = { id: uid(), owner_id: currentUserId, title, visibility:'private', share_code:null, share_code_expires:null, created_at:new Date().toISOString() };
  store.boards.push(b); saveData(store); currentBoardId=b.id; render();
}
function addCategory(boardId, name, color) {
  const c = { id: uid(), board_id: boardId, name, color }; store.categories.push(c); saveData(store); render();
}
function deleteCategory(catId) {
  store.categories = store.categories.filter(c=>c.id!==catId);
  store.tasks = store.tasks.filter(t=>t.category_id!==catId);
  saveData(store); render();
}
function addTask(categoryId, title) {
  const pos = store.tasks.filter(t=>t.category_id===categoryId).length + 1;
  const t = { id: uid(), category_id: categoryId, title, is_done:0, position: pos };
  store.tasks.push(t);
  saveData(store);
  render();
}

function deleteTask(taskId) {
  store.tasks = store.tasks.filter(t=>t.id!==taskId);
  saveData(store);
  render();
}

function editTask(taskId, title) {
  const t = store.tasks.find(x=>x.id===taskId);
  if(t){
    t.title = title;
    saveData(store);
    render();
  }
}

function toggleDone(taskId, isDone) {
  const t = store.tasks.find(x=>x.id===taskId);
  if(t){
    t.is_done = isDone ? 1 : 0;
    saveData(store);
    render();
  }
}

// --- share code generation (local) ---
function generateLocalShareCode() {
  let code;
  do {
    code = String(Math.floor(Math.random()*1000000)).padStart(6,'0');
  } while (store.boards.some(b=>b.share_code === code));
  return code;
}

async function activateShareLocal(boardId, hours=24) {
  const b = store.boards.find(x=>x.id===boardId);
  if(!b) return null;
  const code = generateLocalShareCode();
  b.visibility='shared';
  b.share_code = code;
  b.share_code_expires = new Date(Date.now() + hours*3600*1000).toISOString();
  saveData(store);
  render();
  return {share_code:code, expires_in_hours:hours};
}

async function activateShare(boardId) {
  if (appConfig.backendAvailable) {
    const res = await fetch(appConfig.api.activateShare, {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body: `board_id=${boardId}`
    });
    return await res.json();
  } else {
    return await activateShareLocal(boardId);
  }
}

async function joinWithCodeLocal(code) {
  const b = store.boards.find(x=>x.share_code===code);
  if(!b) return { error: 'Code not found' };
  if (b.share_code_expires && new Date(b.share_code_expires) < new Date()) return { error:'Code expired' };
  b._members = b._members || [];
  if (!b._members.includes(currentUserId)) b._members.push(currentUserId);
  saveData(store);
  return { ok:true, board_id: b.id };
}

async function joinWithCode(code) {
  if (appConfig.backendAvailable) {
    const res = await fetch(appConfig.api.joinWithCode, {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body: `code=${encodeURIComponent(code)}`
    });
    return await res.json();
  } else {
    return await joinWithCodeLocal(code);
  }
}

// --- UI wiring ---
createBoardBtn.onclick = ()=>{
  if(newBoardTitle.value.trim()) {
    addBoard(newBoardTitle.value.trim());
    newBoardTitle.value='';
  }
};
shareBtn.onclick = async ()=>{
  const res = await activateShare(currentBoardId);
  if(res && res.share_code) {
    shareCodeBox.style.display='flex';
    shareCodeText.textContent = `Koodi: ${res.share_code} (exp: ${res.share_code_expires || res.expires_in_hours + 'h'})`;
  } else {
    alert('Jakaminen epäonnistui');
  }
};
copyShareBtn.onclick = ()=>{
  const text = shareCodeText.textContent;
  navigator.clipboard.writeText(text).then(()=> alert('Kopioitu leikepöydälle'));
};
joinCodeBtn.onclick = async ()=>{
  const code = joinCodeInput.value.trim();
  if(!code) return;
  joinMsg.textContent='Yhdistetään...';
  const res = await joinWithCode(code);
  if(res && res.ok) {
    joinMsg.textContent='Liityit onnistuneesti!';
    currentBoardId = res.board_id;
    render();
  } else {
    joinMsg.textContent = 'Virhe: ' + (res.error || 'ei');
  }
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":"&#39;"
  }[c]));
}

// ensimmäinen renderöinti
render();