// --- MUUTTUJAT JA ALUSTUS ---
const urlParams = new URLSearchParams(window.location.search);
const currentBoardId = urlParams.get('id');

let categories = []; 
let todos = [];
let currentCategory = ""; 
let categoryMap = {}; // { "Kategorian Nimi": ID_tietokannassa }

// --- 1. DATAN LATAUS ---
async function initializeData() {
    if (!currentBoardId) return;

    try {
        const response = await fetch(`get_board_data.php?id=${currentBoardId}`);
        const result = await response.json();

        if (result.success) {
            categoryMap = {};
            
            // Tallennetaan kategoriat ja niiden ID:t
            categories = result.categories.map(c => {
                categoryMap[c.name] = c.id;
                return c.name;
            });

            // Muunnetaan tehtävät
            todos = result.tasks.map(t => ({
                id: t.id,
                text: t.title,
                category: result.categories.find(c => c.id == t.category_id)?.name || "",
                completed: parseInt(t.is_done) === 1
            }));

            if (categories.length > 0) {
                switchCategory(categories[0]);
            } else {
                renderSidebar();
            }
        }
    } catch (error) {
        console.error("Virhe ladattaessa tietoja:", error);
    }
}

// --- 2. TEHTÄVIEN HALLINTA ---

async function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();

    if (text === "" || !currentCategory) return;

    const catId = categoryMap[currentCategory];

    const response = await fetch('add_task.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            task_text: text,
            category_id: catId
        })
    });

    const result = await response.json();

    if (result.success) {
        todos.push({ id: result.id, text: text, category: currentCategory, completed: false });
        input.value = "";
        renderTodos();
    }
}

async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newStatus = !todo.completed;

    try {
        const response = await fetch('update_task_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                task_id: id, 
                is_done: newStatus ? 1 : 0 
            })
        });

        const result = await response.json();
        if (result.success) {
            todos = todos.map(t => t.id === id ? {...t, completed: newStatus} : t);
            renderTodos();
        }
    } catch (error) {
        console.error("Virhe tilan päivityksessä:", error);
    }
}

async function deleteTodo(id) {
    if (!confirm("Haluatko varmasti poistaa tämän tehtävän?")) return;

    try {
        const response = await fetch('../taulunakyma/delete_task.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: id })
        });

        const text = await response.text();
        const result = JSON.parse(text);

        if (result.success) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
        } else {
            alert("Virhe poistettaessa: " + result.error);
        }
    } catch (error) {
        console.error("Virhe poistoprosessissa:", error);
    }
}

// --- 3. KATEGORIOIDEN HALLINTA ---

async function saveNewBoard() {
    const name = document.getElementById('new-board-name').value.trim();
    if (name && !categories.includes(name)) {
        const response = await fetch('add_category.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                board_id: currentBoardId
            })
        });

        const result = await response.json();

        if (result.success) {
            categoryMap[name] = result.id;
            categories.push(name);
            renderSidebar();
            switchCategory(name);
            closeModal('board-modal');
            document.getElementById('new-board-name').value = "";
        }
    }
}

async function deleteBoard(catName) {
    const catId = categoryMap[catName];
    if (!catId) return;

    if (confirm(`Haluatko varmasti poistaa kategorian "${catName}" ja kaikki sen tehtävät?`)) {
        try {
            const response = await fetch('delete_category.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_id: catId })
            });

            const result = await response.json();
            if (result.success) {
                categories = categories.filter(c => c !== catName);
                todos = todos.filter(t => t.category !== catName);
                delete categoryMap[catName];

                currentCategory = categories.length > 0 ? categories[0] : "";
                
                renderSidebar();
                switchCategory(currentCategory);
            }
        } catch (error) {
            console.error("Virhe poistettaessa kategoriaa:", error);
        }
    }
}

// --- 4. JAKOKOODIN HALLINTA ---

async function openShareModal() {
    try {
        // Haetaan taulun tiedot tietokannasta, jotta saadaan koodi
        const response = await fetch(`get_board_data.php?id=${currentBoardId}`);
        const result = await response.json();

        if (result.success && result.board.code) {
            document.getElementById('share-code-display').innerText = result.board.code;
            openModal('share-modal');
        } else {
            alert("Jakokoodia ei löytynyt. Varmista, että taulu on luotu oikein.");
        }
    } catch (error) {
        console.error("Virhe haettaessa koodia:", error);
    }
}

// --- RENDERÖINTI JA MODAALIT ---

function renderSidebar() {
    const container = document.getElementById('category-list');
    if(!container) return;
    container.innerHTML = "";
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = "category-item";
        div.innerHTML = `
            <button class="category-btn ${cat === currentCategory ? 'active' : ''}" onclick="switchCategory('${cat}')">${cat}</button>
            <button class="delete-board-x" onclick="deleteBoard('${cat}')">×</button>
        `;
        container.appendChild(div);
    });
}

function renderTodos() {
    const list = document.getElementById('todo-list');
    if(!list) return;
    list.innerHTML = "";
    const filtered = todos.filter(t => t.category === currentCategory);

    filtered.forEach(todo => {
        const item = document.createElement('div');
        item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        item.innerHTML = `
            <div class="todo-content" onclick="toggleTodo(${todo.id})">
                <input type="checkbox" ${todo.completed ? 'checked' : ''}>
                <span>${todo.text}</span>
            </div>
            <button class="btn btn-danger" onclick="deleteTodo(${todo.id})">Poista</button>
        `;
        list.appendChild(item);
    });
}

function switchCategory(cat) {
    currentCategory = cat;
    const titleEl = document.getElementById('current-category-title');
    if(titleEl) titleEl.innerText = cat || "Valitse kategoria";
    renderSidebar();
    renderTodos();
}

function openModal(id) { 
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex'; 
        const input = modal.querySelector('.modal-input');
        if (input) input.focus();
    }
}

function closeModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none'; 
}

// Käynnistys
initializeData();