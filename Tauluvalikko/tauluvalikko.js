const profilePic = document.getElementById('profile-pic');
const profileMenu = document.querySelector('.profile-menu');
const createBoardBtn = document.getElementById('create-board-btn');
const allBoards = document.getElementById('all-boards');
const boardView = document.getElementById('board-view');
const boardTitleEl = document.getElementById('board-title');
const taskList = document.getElementById('task-list');
let currentBoard = null;
let boards = [];

profilePic.addEventListener('click', () => {
  profileMenu.classList.toggle('hidden');
});

function logout() { alert('Uloskirjautuminen!'); }

createBoardBtn.addEventListener('click', () => {
  const title = prompt("Anna taulun otsikko:");
  if (!title) return;
  const visibility = prompt("Valitse näkyvyys (yksityinen/yhteinen):").toLowerCase();
  const code = visibility === "yhteinen" ? Math.random().toString(36).substr(2, 6) : null;
  const board = { title, visibility, code, tasks: [] };
  boards.push(board);
  renderBoards();
});

function renderBoards() {
  allBoards.innerHTML = '';
  boards.forEach((b, index) => {
    const card = document.createElement('div');
    card.classList.add('board-card');
    card.textContent = b.title + (b.code ? `\nKoodi: ${b.code}` : '');
    card.addEventListener('click', () => openBoard(index));
    allBoards.appendChild(card);
  });
}

function openBoard(index) {
  currentBoard = boards[index];
  boardTitleEl.textContent = currentBoard.title;
  renderTasks();
  boardView.style.display = 'flex';
}

function closeBoard() { boardView.style.display = 'none'; currentBoard = null; }

function addTask() {
  const input = document.getElementById('new-task-input');
  if (!input.value) return;
  currentBoard.tasks.push({ text: input.value, done: false });
  input.value = '';
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';
  currentBoard.tasks.forEach((task, i) => {
    const div = document.createElement('div');
    div.className = 'task' + (task.done ? ' done' : '');
    div.textContent = task.text;
    div.addEventListener('click', () => {
      task.done = !task.done;
      renderTasks();
    });
    taskList.appendChild(div);
  });
}