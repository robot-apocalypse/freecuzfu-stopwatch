(function () {
  const display = document.getElementById('display');
  const btnStart = document.getElementById('btn-start');
  const btnLap = document.getElementById('btn-lap');
  const btnReset = document.getElementById('btn-reset');
  const lapList = document.getElementById('lap-list');

  let running = false;
  let startTime = 0;
  let elapsed = 0;
  let rafId = null;
  let laps = [];
  let lastLapElapsed = 0;

  function fmt(ms) {
    const total = Math.floor(ms);
    const min = Math.floor(total / 60000);
    const sec = Math.floor((total % 60000) / 1000);
    const hund = Math.floor((total % 1000) / 10);
    return (
      String(min).padStart(2, '0') + ':' +
      String(sec).padStart(2, '0') + '.' +
      String(hund).padStart(2, '0')
    );
  }

  function tick() {
    elapsed = performance.now() - startTime;
    display.textContent = fmt(elapsed);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    startTime = performance.now() - elapsed;
    running = true;
    btnStart.textContent = 'Stop';
    btnStart.classList.add('active');
    btnLap.disabled = false;
    display.classList.add('running');
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(rafId);
    rafId = null;
    running = false;
    btnStart.textContent = 'Start';
    btnStart.classList.remove('active');
    btnLap.disabled = true;
    display.classList.remove('running');
  }

  function addLap() {
    const num = laps.length + 1;
    const split = elapsed - lastLapElapsed;
    lastLapElapsed = elapsed;
    laps.push({ num, split, total: elapsed });
    renderLaps();
  }

  function renderLaps() {
    lapList.innerHTML = '';
    for (let i = laps.length - 1; i >= 0; i--) {
      const lap = laps[i];
      const li = document.createElement('li');
      li.innerHTML =
        '<span class="lap-num">' + lap.num + '</span>' +
        '<span class="lap-split">' + fmt(lap.split) + '</span>' +
        '<span class="lap-total">' + fmt(lap.total) + '</span>';
      lapList.appendChild(li);
    }
  }

  btnStart.addEventListener('click', () => {
    if (running) stop(); else start();
  });

  btnLap.addEventListener('click', () => {
    if (running) addLap();
  });

  btnReset.addEventListener('click', () => {
    stop();
    elapsed = 0;
    lastLapElapsed = 0;
    laps = [];
    display.textContent = '00:00.00';
    lapList.innerHTML = '';
  });
}());

// PWA install
(function () {
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  const btn = document.getElementById('install-btn');
  let prompt;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    btn.textContent = '⊕ Install';
    btn.hidden = false;
    btn.addEventListener('click', () => alert('Tap the Share icon ⎋, then "Add to Home Screen".'));
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    prompt = e;
    btn.hidden = false;
  });

  window.addEventListener('appinstalled', () => { btn.hidden = true; prompt = null; });

  btn.addEventListener('click', async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') btn.hidden = true;
    prompt = null;
  });
}());
