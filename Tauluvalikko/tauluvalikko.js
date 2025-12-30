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
let recentBoards = [];
let currentUser = "testikäyttäjä"; // demo, korvaa oikealla kirjautuneella käyttäjällä

// --- profiili ---
profilePic.addEventListener('click', () => {
  profileMenu.classList.toggle('hidden');
});

function logout() {
  alert("Uloskirjautuminen onnistui!");
  window.location.href = "../login.html";
}

// --- popup ---
createBoardBtn.addEventListener('click', () => {
  popup.classList.remove('hidden');
});

cancelCreate.addEventListener('click', () => {
  popup.classList.add('hidden');
  titleInput.value = '';
});

confirmCreate.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  const visibility = privacySelect.value;

  if (!title) {
    alert("Anna taululle nimi!");
    return;
  }

  try {
    // Lähetetään pyyntö backendille
    const res = await fetch('create_board.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title, visibility })
    });
    const json = await res.json();

    if (json.error) {
      alert(json.error);
      return;
    }

    // Sulje popup onnistuneen luomisen jälkeen
    popup.classList.add('hidden');
    titleInput.value = '';

    alert(`Taulu luotu! ${json.code ? "Koodi: " + json.code : "Yksityinen taulu"}`);

    // Lisää taulu listaan
    boards.push({ id: json.board_id, title, visibility, code: json.code || null, favorite: false });
    renderBoards();

  } catch (err) {
    alert("Virhe luotaessa taulua: " + err.message);
  }
});

// --- renderöinti ---
function renderBoards() {
  allBoards.innerHTML = '';
  favoritesContainer.innerHTML = '';

  boards.forEach((b, index) => {
    const card = document.createElement('div');
    card.classList.add('board-card');

    const title = document.createElement('span');
    title.textContent = b.title;

    const favBtn = document.createElement('button');
    favBtn.textContent = b.favorite ? "⭐" : "☆";
    favBtn.addEventListener('click', e => {
      e.stopPropagation();
      b.favorite = !b.favorite;
      renderBoards();
    });

    card.appendChild(title);
    card.appendChild(favBtn);

    card.addEventListener('click', () => openBoard(index));
    allBoards.appendChild(card);

    if (b.favorite) {
      const favCard = card.cloneNode(true);
      favCard.addEventListener('click', () => openBoard(index));
      favoritesContainer.appendChild(favCard);
    }
  });
}

// --- taulun avaaminen ---
function openBoard(index) {
  const board = boards[index];
  console.log("Avataan taulu:", board.title);
}
