const profilePic = document.getElementById('profile-pic');
const profileMenu = document.querySelector('.profile-menu');
const createBoardBtn = document.getElementById('create-board-btn');
const allBoards = document.getElementById('all-boards');

profilePic.addEventListener('click', () => {
  profileMenu.classList.toggle('hidden');
});

createBoardBtn.addEventListener('click', () => {
  const boardTitle = prompt("Anna taulun otsikko:");
  if (!boardTitle) return;

  const visibility = prompt("Valitse näkyvyys (yksityinen/yhteinen):").toLowerCase();
  const boardId = Math.random().toString(36).substr(2, 6); // satunnainen koodi

  const boardCard = document.createElement('div');
  boardCard.classList.add('board-card');
  boardCard.textContent = boardTitle + (visibility === "yhteinen" ? ` (Koodi: ${boardId})` : "");
  allBoards.appendChild(boardCard);
});
