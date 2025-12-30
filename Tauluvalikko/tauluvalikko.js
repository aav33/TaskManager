const profilePic = document.getElementById('profile-pic');
const profileMenu = document.querySelector('.profile-menu');
const createBoardBtn = document.getElementById('create-board-btn');
const allBoards = document.getElementById('all-boards');
const searchInput = document.getElementById('search-board');
const joinInput = document.getElementById('board-code');
const favoritesContainer = document.getElementById('favorites');
const recentContainer = document.getElementById('recent');

const popup = document.getElementById('create-popup');
const confirmCreate = document.getElementById('confirm-create');
const cancelCreate = document.getElementById('cancel-create');
const titleInput = document.getElementById('new-board-title');
const privacySelect = document.getElementById('privacy-select');

let boards = [];
let currentBoard = null;
let recentBoards = [];

let loggedIn = false;
let currentUser = null;

// --- helpers ---
function saveUserBoards(username, boards) {
  localStorage.setItem("boards_" + username, JSON.stringify(boards));
}
function loadUserBoards(username) {
  const raw = localStorage.getItem("boards_" + username);
  return raw ? JSON.parse(raw) : [];
}
function saveRecentBoards(username, recent) {
  localStorage.setItem("recent_" + username, JSON.stringify(recent));
}
function loadRecentBoards(username) {
  const raw = localStorage.getItem("recent_" + username);
  return raw ? JSON.parse(raw) : [];
}

profilePic.addEventListener('click', () => {
  profileMenu.classList.toggle('hidden');
});

function login(username) {
  loggedIn = true;
  currentUser = username;
  boards = loadUserBoards(username);
  recentBoards = loadRecentBoards(username);
  renderBoards();
  renderRecent();
  console.log("Kirjauduttu sisään käyttäjällä:", username);
}

function logout() {
  loggedIn = false;
  currentUser = null;
  currentBoard = null;
  boards = [];
  localStorage.clear();
  alert('Uloskirjautuminen onnistui!');
  window.location.href = "../Kirjautuminen/kirjautuminen.html";
}

/*Taulun luonti pop-upilla (Tekemässä)
createBoardBtn.addEventListener('click', () => {
  if (!loggedIn) {
    alert("Kirjaudu ensin sisään!");
    return;
  }
  popup.classList.remove('hidden');
});

cancelCreate.addEventListener('click', () => {
  popup.classList.add('hidden');
  titleInput.value = '';
});

confirmCreate.addEventListener('click', () => {
  const title = titleInput.value.trim();
  const privacy = privacySelect.value;
  if (!title) {
    alert("Anna taululle nimi!");
    return;
  }
  const code = privacy === "public" ? Math.random().toString(36).substring(2, 8) : null;
  const board = { title, tasks: [], favorite: false, code };
  boards.push(board);
  saveUserBoards(currentUser, boards);
  renderBoards();
  popup.classList.add('hidden');
  titleInput.value = '';
  alert(`Taulu luotu! ${code ? "Koodi: " + code : "Yksityinen taulu"}`);
});
*/
// Taulujen renderöinti
function renderBoards() {
  allBoards.innerHTML = '';
  favoritesContainer.innerHTML = '';

  boards.forEach((b, index) => {
    const card = document.createElement('div');
    card.classList.add('board-card');

    const title = document.createElement('span');
    title.textContent = b.title;

    const favBtn = document.createElement('button');
    favBtn.textContent = b.favorite ? "⭐" : "☆"; //Tähdet
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      b.favorite = !b.favorite;
      saveUserBoards(currentUser, boards);
      renderBoards();
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = "🗑️"; //Poistaminen
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Haluatko varmasti poistaa taulun "${b.title}"?`)) {
        boards.splice(index, 1);
        saveUserBoards(currentUser, boards);
        renderBoards();
      }
    });

    card.appendChild(title);
    card.appendChild(favBtn);
    card.appendChild(delBtn);

    card.addEventListener('click', () => openBoard(index));
    allBoards.appendChild(card);

    if (b.favorite) {
      const favCard = card.cloneNode(true);
      favCard.addEventListener('click', () => openBoard(index));
      favoritesContainer.appendChild(favCard);
    }
  });
}

// Äskettäin katsotut
function renderRecent() {
  recentContainer.innerHTML = '';
  recentBoards.forEach((b) => {
    const card = document.createElement('div');
    card.classList.add('board-card');
    card.textContent = b.title;
    card.addEventListener('click', () => {
      currentBoard = b;
      localStorage.setItem("currentBoard", JSON.stringify(currentBoard));
      window.location.href = "../taulunakyma/taulunakyma.html";
    });
    recentContainer.appendChild(card);
  });
}

// Taulun avaaminen
function openBoard(index) {
  currentBoard = boards[index];
  localStorage.setItem("currentBoard", JSON.stringify(currentBoard));

  // Lisää äskettäisiin
  const existing = recentBoards.find(b => b.title === currentBoard.title);
  if (!existing) {
    recentBoards.unshift(currentBoard);
    if (recentBoards.length > 5) recentBoards.pop();
    saveRecentBoards(currentUser, recentBoards);
    renderRecent();
  }

  window.location.href = "../taulunakyma/taulunakyma.html";
}

// Haku tauluista
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = boards.filter(b => b.title.toLowerCase().includes(query));
  renderFilteredBoards(filtered);
});

function renderFilteredBoards(filteredBoards) {
  allBoards.innerHTML = '';
  filteredBoards.forEach((b, index) => {
    const card = document.createElement('div');
    card.classList.add('board-card');
    card.textContent = b.title;
    card.addEventListener('click', () => openBoard(index));
    allBoards.appendChild(card);
  });
}

// Liittyminen koodilla
joinInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const code = joinInput.value.trim();
    const board = boards.find(b => b.code === code);
    if (board) {
      currentBoard = board;
      localStorage.setItem("currentBoard", JSON.stringify(currentBoard));

      // Lisää äskettäisiin
      const existing = recentBoards.find(rb => rb.title === currentBoard.title);
      if (!existing) {
        recentBoards.unshift(currentBoard);
        if (recentBoards.length > 5) recentBoards.pop();
        saveRecentBoards(currentUser, recentBoards);
        renderRecent();
      }

      window.location.href = "../taulunakyma/taulunakyma.html";
    } else {
      alert("Taulua ei löytynyt annetulla koodilla!");
    }
  }
});

// --- DEMO: automaattinen kirjautuminen testikäyttäjälle ---
login("testikäyttäjä");