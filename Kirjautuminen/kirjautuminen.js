// Välilehtien vaihtaminen
const tabRegister = document.getElementById('tab-register');
const tabLogin = document.getElementById('tab-login');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const sendBtn = document.getElementById('send-code');
const regMsg = document.getElementById('reg-msg');
const loginMsg = document.getElementById('login-msg');

// Vaihda välilehti
function switchTab(to) {
  if(to === 'login'){
    tabLogin.classList.add('active'); tabRegister.classList.remove('active');
    registerForm.style.display = 'none'; registerForm.setAttribute('aria-hidden','true');
    loginForm.style.display = ''; loginForm.setAttribute('aria-hidden','false');
  } else {
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    loginForm.style.display = 'none'; loginForm.setAttribute('aria-hidden','true');
    registerForm.style.display = ''; registerForm.setAttribute('aria-hidden','false');
  }
}

// Välilehtien klikkaustapahtumat
tabRegister.addEventListener('click',()=>switchTab('register'));
tabLogin.addEventListener('click',()=>switchTab('login'));

// Apufunktiot: näytä ilmoitus
function showRegMessage(html){ regMsg.innerHTML = html; }
function showLoginMessage(html){ loginMsg.innerHTML = html; }

// Lähetä koodi (backend: send_code.php)
sendBtn.addEventListener('click', async () => {
  const email = document.getElementById('reg-email').value.trim();
  if(!email || !email.includes('@')){
    showRegMessage('<span class="error">Anna kelvollinen sähköpostiosoite.</span>');
    return;
  }
  try {
    sendBtn.disabled = true; 
    sendBtn.textContent = 'Lähetetään...';

    const res = await fetch('send_code.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email})
    });
    const json = await res.json();

    // Tarkista, onko sähköposti jo käytössä
    if(json.message === 'email_used'){
      showRegMessage('<span class="error">Sähköposti on jo käytössä.</span>');
    } else if(json.ok){
      showRegMessage('<div class="sent-code">Varmennuskoodi lähetetty. Tarkista sähköpostisi.</div>');
    } else {
      showRegMessage('<span class="error">'+(json.message||'Koodin lähetys epäonnistui')+'</span>');
    }

  } catch (err) {
    showRegMessage('<span class="error">Palvelinvirhe: '+err.message+'</span>');
  } finally{
    sendBtn.disabled = false; 
    sendBtn.textContent = 'Lähetä koodi';
  }
});

// Rekisteröinti (backend: register.php)
registerForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('reg-email').value.trim();
  const pwd = document.getElementById('reg-password').value;
  const code = document.getElementById('reg-code').value.trim();
  
  // Tarkista pakolliset kentät
  if(!email || !pwd){ 
    showRegMessage('<span class="error">Sähköposti ja salasana vaaditaan.</span>'); 
    return; 
  }
  try {
    const res = await fetch('register.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, password: pwd, code})
    });
    const json = await res.json();
    
    if(json.ok){
      showRegMessage('<div class="note">Rekisteröinti onnistui! Voit nyt kirjautua.</div>');
      // Tyhjennä kentät
      document.getElementById('reg-password').value = '';
      document.getElementById('reg-code').value = '';
    } else {
      // Jos sähköposti on jo käytössä
      if(json.message === 'email_used'){
        showRegMessage('<span class="error">Sähköposti on jo käytössä.</span>');
      } else {
        showRegMessage('<span class="error">'+(json.message||'Rekisteröinti epäonnistui')+'</span>');
      }
    }
  } catch (err) {
    showRegMessage('<span class="error">Palvelinvirhe: '+err.message+'</span>');
  }
});

// Kirjautuminen (backend: login.php)
loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pwd = document.getElementById('login-password').value;
  
  // Tarkista pakolliset kentät
  if(!email || !pwd){ 
    showLoginMessage('<span class="error">Sähköposti ja salasana vaaditaan.</span>'); 
    return; 
  }
  try {
    const res = await fetch('login.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, password: pwd})
    });
    const json = await res.json();
    if(json.ok){
      showLoginMessage('<div class="note">Kirjautuminen onnistui — ohjataan...</div>');
      // Valinnainen: uudelleenohjaus
      setTimeout(()=> window.location = 'index.html', 800);
    } else {
      showLoginMessage('<span class="error">'+(json.message||'Kirjautuminen epäonnistui')+'</span>');
    }
  } catch (err) {
    showLoginMessage('<span class="error">Palvelinvirhe: '+err.message+'</span>');
  }
});
