// auth.js - simple client-side auth for demo purposes
// For production use Firebase Auth or server-side auth & email provider
(function(){
  // Helper: save users { email -> {name, pass} } in localStorage under 'ns_users'
  const USERS_KEY = 'ns_users_v1';
  const SESSION_KEY = 'ns_session_v1';

  function loadUsers(){
    try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }catch(e){return {}}
  }
  function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
  function setSession(email){ localStorage.setItem(SESSION_KEY, JSON.stringify({email, ts:Date.now()})); }
  function clearSession(){ localStorage.removeItem(SESSION_KEY); }
  function getSession(){ try{return JSON.parse(localStorage.getItem(SESSION_KEY));}catch(e){return null} }

  /* ---------- UI wiring (index.html) ---------- */
  const tabs = document.querySelectorAll('.tab');
  const forms = { login: document.getElementById('login-form'), signup: document.getElementById('signup-form'), forgot: document.getElementById('forgot-form') };
  const tabEls = Array.from(tabs);
  tabEls.forEach(tb=>{
    tb.addEventListener('click', ()=> switchTab(tb.dataset.tab));
  });
  document.querySelectorAll('.switch-to').forEach(s=> s.addEventListener('click', (e)=> switchTab(e.target.dataset.tab)));

  function switchTab(name){
    tabEls.forEach(t=>t.classList.toggle('active', t.dataset.tab === name));
    Object.keys(forms).forEach(k=> forms[k] && forms[k].classList.toggle('hidden', k !== name));
    // clear messages
    const msgEls = document.querySelectorAll('#auth-msg,#signup-msg,#forgot-msg'); msgEls.forEach(m=>m.textContent='');
  }

  // toggle password visibility
  const tbtn = document.getElementById('toggle-pass');
  if(tbtn){ tbtn.addEventListener('click', ()=> {
    const p = document.getElementById('login-pass');
    p.type = p.type==='password' ? 'text' : 'password';
  })}

  // SIGN UP
  document.getElementById('signup-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const pass = document.getElementById('signup-pass').value;
    const msg = document.getElementById('signup-msg');

    if(!name||!email||!pass){ msg.textContent = 'All fields required'; return; }
    const users = loadUsers();
    if(users[email]){ msg.textContent = 'Email already registered. Please sign in.'; return; }
    users[email] = { name, pass };
    saveUsers(users);
    msg.textContent = 'Account created. You can sign in now.';
    setTimeout(()=>switchTab('login'), 900);
  });

  // LOGIN
  document.getElementById('login-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-pass').value;
    const remember = document.getElementById('remember').checked;
    const msg = document.getElementById('auth-msg');

    if(!email||!pass){ msg.textContent = 'Fill both fields'; return; }
    const users = loadUsers();
    if(!users[email] || users[email].pass !== pass){
      msg.textContent = 'Invalid credentials (demo)';
      return;
    }
    // success
    setSession(email);
    if(!remember) { /* session will still persist unless you implement session expiry - demo */ }
    msg.style.color = '#bff'; msg.textContent = 'Signed in — opening app...';
    setTimeout(()=> window.location.href = 'app.html', 600);
  });

  // FORGOT (demo)
  document.getElementById('forgot-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim().toLowerCase();
    const msg = document.getElementById('forgot-msg');
    const users = loadUsers();
    if(!email || !users[email]){ msg.textContent = 'Email not found (demo)'; return; }
    // create demo reset code and show the reset area (in production you'd email a link)
    const code = Math.floor(100000 + Math.random()*899999).toString();
    localStorage.setItem('ns_reset_code', JSON.stringify({email, code, ts: Date.now()}));
    msg.textContent = Demo reset code: ${code} — enter it below to set new password. (In production this would be emailed.);
    document.getElementById('reset-step').classList.remove('hidden');
  });

  document.getElementById('apply-reset').addEventListener('click', ()=>{
    const obj = JSON.parse(localStorage.getItem('ns_reset_code') || 'null');
    const code = document.getElementById('reset-code').value.trim();
    const newpass = document.getElementById('reset-newpass').value;
    const msg = document.getElementById('forgot-msg');
    if(!obj || obj.code !== code){ msg.textContent = 'Invalid code'; return; }
    const users = loadUsers(); users[obj.email].pass = newpass; saveUsers(users);
    localStorage.removeItem('ns_reset_code');
    msg.textContent = 'Password updated. You can sign in now.';
    setTimeout(()=> switchTab('login'), 800);
  });

  // GOOGLE SIGN-IN button (simple demo wrapper; to make it real follow steps below and set CLIENT_ID)
  const googleBtn = document.getElementById('googleBtn');
  googleBtn.addEventListener('click', ()=>{
    // Try to use the Google Identity Services prompt if available:
    if(window.google && google.accounts && google.accounts.oauth2){
      // If you provided CLIENT_ID in the head meta, you can use the token client for OAuth
      // For demo we show a friendly alert and simulate login
      // Real flow: google.accounts.id.initialize(...) etc.
      alert('If you configured Google Sign-In, the Google popup would open (see README). For the demo we simulate sign-in.');
      // Simulate demo sign-in
      const demoEmail = 'google.user@demo.com';
      setSession(demoEmail);
      window.location.href = 'app.html';
    } else {
      // Fallback: simulate
      alert('Google library not loaded or client id not set. To enable Google Sign-In add a Google client id — see instructions below.');
    }
  });

  /* ---------- session redirect (app.html) ---------- */
  if(location.pathname.endsWith('app.html')){
    const s = getSession();
    if(!s){ alert('No active session — redirecting to sign in'); window.location.href = 'index.html'; }
    else {
      // expose the session email to app
      window.__NS_SESSION = s;
    }
  }

  /* ---------- logout and expose functions ---------- */
  window.NSAuth = {
    signOut: function(){
      clearSession();
      window.location.href = 'index.html';
    },
    getUser: function(){
      const s = getSession(); if(!s) return null;
      const users = loadUsers(); return users[s.email] ? { email:s.email, name: users[s.email].name } : { email:s.email };
    },
    // helper for dev/testing to preseed a demo account
    seedDemo: function(){
      const users = loadUsers();
      users['demo@neon.local'] = { name:'Neon Demo', pass:'demo123' };
      saveUsers(users);
      alert('Demo account created: demo@neon.local / demo123');
    }
  };

})();
