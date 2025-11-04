// app.js - run inside app.html
(function(){
  // expose user
  const userPill = document.getElementById('user-pill');
  if(window.NSAuth && userPill){
    const u = window.NSAuth.getUser();
    userPill.textContent = (u && u.name) ? u.name : (u && u.email) ? u.email.split('@')[0] : 'Guest';
  }

  // logout
  const logout = document.getElementById('logoutBtn');
  if(logout) logout.addEventListener('click', ()=> { if(confirm('Logout?')) NSAuth.signOut(); });

  // orbit mouse parallax
  const orbit = document.getElementById('orbit');
  if(orbit){
    document.addEventListener('mousemove', (e)=>{
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      orbit.style.transform = rotateY(${x}deg) rotateX(${y}deg);
    });
  }

  // click handlers (demo navigation)
  document.querySelectorAll('.orb-item').forEach(it=>{
    it.addEventListener('click', ()=> {
      const target = it.dataset.target;
      alert('Open ' + target + ' — in a real app this would navigate to that page or open a panel.');
    });
  });

  // mini timer
  let miniSec = 25*60;
  let miniTimer = null;
  const miniDisplay = document.getElementById('miniTimer');
  function formatMMSS(s){ return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); }
  if(miniDisplay) miniDisplay.textContent = formatMMSS(miniSec);
  const startBtn = document.getElementById('miniStart');
  if(startBtn){
    startBtn.addEventListener('click', ()=>{
      if(miniTimer){ clearInterval(miniTimer); miniTimer = null; startBtn.textContent = 'Start'; return; }
      miniTimer = setInterval(()=> {
        if(miniSec<=0){ clearInterval(miniTimer); miniTimer=null; alert('Pomodoro finished'); return; }
        miniSec--; miniDisplay.textContent = formatMMSS(miniSec);
      },1000);
      startBtn.textContent = 'Stop';
    });
  }

  // quick note save to localStorage
  const quickNote = document.getElementById('quickNote');
  if(quickNote){
    quickNote.value = localStorage.getItem('ns_quick_note') || '';
    quickNote.addEventListener('input', (e)=> localStorage.setItem('ns_quick_note', e.target.value));
  }

  // show mini task example (count tasks stored in auth users as demo)
  const miniTask = document.getElementById('miniTask');
  const statTasks = document.getElementById('statTasks');
  const statMinutes = document.getElementById('statMinutes');
  (function updateStats(){
    // demo: count tasks from localStorage 'ns_tasks' (not implemented fully here)
    const tasks = JSON.parse(localStorage.getItem('ns_tasks_demo') || '[]');
    statTasks.textContent = tasks.length || 0;
    statMinutes.textContent = localStorage.getItem('ns_study_minutes') || 0;
    if(miniTask) miniTask.textContent = tasks.length ? tasks[0].text : 'No tasks yet';
  })();
})();
