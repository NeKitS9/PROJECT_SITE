'use strict';

/* =========================================================
   1. Локализация
   ========================================================= */
const I18N = {
  ru: {
    'hero.title':'Простые инструменты','hero.sub':'Для быстрых расчётов и повседневных задач',
    'hero.timer':'Таймер','hero.calc':'Калькулятор','hero.conv':'Конвертер',
    'timer.title':'Таймер','timer.lead':'Удобный таймер и секундомер для любых задач',
    'timer.tab.timer':'Таймер','timer.tab.stopwatch':'Секундомер',
    'timer.hint':'Нажмите на время, чтобы задать своё','unit.min':'мин',
    'sw.hint':'Пробел — старт и пауза, L — круг',
    'btn.start':'Старт','btn.pause':'Пауза','btn.resume':'Продолжить','btn.reset':'Сброс','btn.lap':'Круг',
    'calc.title':'Калькулятор','calc.lead':'Инженерный: скобки, тригонометрия, степени и корни',
    'calc.history':'История','calc.clear':'Очистить',
    'conv.title':'Конвертер валют','conv.lead':'Актуальные курсы и динамика за 30 дней',
    'conv.from':'Из','conv.to':'В','conv.stats':'За 30 дней','conv.min':'Мин.','conv.avg':'Сред.',
    'conv.max':'Макс.','conv.now':'Сейчас','conv.loading':'Загружаем курсы…',
    'conv.live':'Курсы загружены','conv.offline':'Нет связи с сервисом курсов — показаны приблизительные значения',
    'conv.nochart':'История курса недоступна','conv.days':'Динамика за 30 дней',
    'footer.note':'Курсы валют предоставлены открытым API и обновляются раз в сутки. Не является финансовой рекомендацией.',
    'lap':'Круг','updated':'Данные о курсах на','done':'Время вышло!'
  },
  en: {
    'hero.title':'Simple tools','hero.sub':'For quick calculations and everyday tasks',
    'hero.timer':'Timer','hero.calc':'Calculator','hero.conv':'Converter',
    'timer.title':'Timer','timer.lead':'A handy timer and stopwatch for any task',
    'timer.tab.timer':'Timer','timer.tab.stopwatch':'Stopwatch',
    'timer.hint':'Click the time to set your own','unit.min':'min',
    'sw.hint':'Space — start and pause, L — lap',
    'btn.start':'Start','btn.pause':'Pause','btn.resume':'Resume','btn.reset':'Reset','btn.lap':'Lap',
    'calc.title':'Calculator','calc.lead':'Scientific: brackets, trigonometry, powers and roots',
    'calc.history':'History','calc.clear':'Clear',
    'conv.title':'Currency converter','conv.lead':'Live rates and a 30-day trend',
    'conv.from':'From','conv.to':'To','conv.stats':'Last 30 days','conv.min':'Min','conv.avg':'Avg',
    'conv.max':'Max','conv.now':'Now','conv.loading':'Loading rates…',
    'conv.live':'Rates loaded','conv.offline':'No connection to the rates service — approximate values shown',
    'conv.nochart':'Rate history unavailable','conv.days':'30-day trend',
    'footer.note':'Rates are provided by an open API and update once a day. Not financial advice.',
    'lap':'Lap','updated':'Rate data as of','done':'Time is up!'
  }
};
let lang = localStorage.getItem('lang') || 'ru';
const t = k => (I18N[lang] && I18N[lang][k]) || I18N.ru[k] || k;

function applyLang(){
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.getElementById('langLabel').textContent = lang.toUpperCase();
  localStorage.setItem('lang', lang);
  document.dispatchEvent(new CustomEvent('langchange'));
}
document.getElementById('langToggle').addEventListener('click', () => {
  lang = lang === 'ru' ? 'en' : 'ru';
  applyLang();
});

/* =========================================================
   2. Тема
   ========================================================= */
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
else if (window.matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.dataset.theme = 'light';

document.getElementById('themeToggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
  if (window.__redrawChart) window.__redrawChart();
});

/* =========================================================
   3. Подсветка активного раздела
   ========================================================= */
const navPills = [...document.querySelectorAll('[data-nav]')];
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navPills.forEach(p => p.classList.toggle('is-current', p.dataset.nav === e.target.id));
  });
}, { rootMargin: '-45% 0px -45% 0px' });
['timer','calculator','converter'].forEach(id => {
  const el = document.getElementById(id);
  if (el) io.observe(el);
});

/* =========================================================
   4. Звук
   ========================================================= */
let audioCtx = null;
let soundOn = localStorage.getItem('sound') !== 'off';

function beep(times = 3){
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    for (let i = 0; i < times; i++){
      const at = audioCtx.currentTime + i * 0.45;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.28, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(at); osc.stop(at + 0.36);
    }
  } catch (_) { /* звук недоступен — не критично */ }
}

const soundBtn = document.getElementById('soundToggle');
function paintSound(){
  soundBtn.setAttribute('aria-pressed', String(soundOn));
  soundBtn.querySelector('.ic-sound-on').style.display = soundOn ? 'block' : 'none';
  soundBtn.querySelector('.ic-sound-off').style.display = soundOn ? 'none' : 'block';
}
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  localStorage.setItem('sound', soundOn ? 'on' : 'off');
  paintSound();
  if (soundOn) beep(1);
});
paintSound();

/* =========================================================
   5. Таймер
   ========================================================= */
const pad = n => String(n).padStart(2, '0');

function fmtClock(sec){
  // Округляем вверх: пока осталась хоть доля секунды, на табло не должен гореть ноль
  sec = Math.max(0, Math.ceil(sec - 0.001));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

const timer = {
  total: 300,        // изначально заданная длительность, сек
  remaining: 300,    // осталось, сек (дробное)
  running: false,
  endsAt: 0,
  tick: 0
};
const tDisplay  = document.getElementById('timerDisplay');
const tProgress = document.getElementById('timerProgress');
const tStart    = document.getElementById('timerStart');
const tHint     = document.querySelector('[data-pane="timer"] .display__hint');
const tReset    = document.getElementById('timerReset');

function renderTimer(){
  if (!tDisplay.classList.contains('is-editing')) tDisplay.textContent = fmtClock(timer.remaining);
  const pct = timer.total > 0 ? (1 - timer.remaining / timer.total) * 100 : 0;
  tProgress.style.width = Math.min(100, Math.max(0, pct)) + '%';
  const label = tStart.querySelector('span');
  label.textContent = timer.running ? t('btn.pause')
    : (timer.remaining < timer.total && timer.remaining > 0 ? t('btn.resume') : t('btn.start'));
  tStart.querySelector('.ic-play').style.display  = timer.running ? 'none' : 'block';
  tStart.querySelector('.ic-pause').style.display = timer.running ? 'block' : 'none';
  document.title = timer.running
    ? `${fmtClock(timer.remaining)} — ${t('timer.title')}`
    : 'Простые инструменты — таймер, калькулятор, конвертер валют';
}

function tickTimer(){
  if (!timer.running) return;
  timer.remaining = (timer.endsAt - Date.now()) / 1000;
  if (timer.remaining <= 0){
    timer.remaining = 0;
    timer.running = false;
    clearInterval(timer.tick);
    tDisplay.classList.add('is-done');
    tHint.textContent = t('done');
    beep(3);
    renderTimer();
    return;
  }
  renderTimer();
}

function startTimer(){
  if (timer.remaining <= 0) timer.remaining = timer.total;
  if (timer.remaining <= 0) return;
  timer.running = true;
  timer.endsAt = Date.now() + timer.remaining * 1000;
  tDisplay.classList.remove('is-done');
  tHint.textContent = t('timer.hint');
  beep(0); // разблокировать AudioContext по жесту пользователя
  clearInterval(timer.tick);
  timer.tick = setInterval(tickTimer, 200);
  tickTimer();
}
function pauseTimer(){
  timer.running = false;
  clearInterval(timer.tick);
  renderTimer();
}
function resetTimer(){
  pauseTimer();
  timer.remaining = timer.total;
  tDisplay.classList.remove('is-done');
  tHint.textContent = t('timer.hint');
  renderTimer();
}

tStart.addEventListener('click', () => timer.running ? pauseTimer() : startTimer());
tReset.addEventListener('click', resetTimer);

document.querySelectorAll('[data-adjust]').forEach(btn => {
  btn.addEventListener('click', () => {
    const delta = Number(btn.dataset.adjust);
    timer.total = Math.max(0, timer.total + delta);
    timer.remaining = Math.max(0, timer.remaining + delta);
    if (timer.running) timer.endsAt = Date.now() + timer.remaining * 1000;
    if (timer.remaining > 0) tDisplay.classList.remove('is-done');
    document.querySelectorAll('#timerPresets .chip').forEach(c => c.classList.remove('is-active'));
    renderTimer();
  });
});

document.querySelectorAll('#timerPresets .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#timerPresets .chip').forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    timer.total = timer.remaining = Number(chip.dataset.seconds);
    pauseTimer();
    tDisplay.classList.remove('is-done');
    renderTimer();
  });
});

/* Редактирование времени прямо на дисплее */
function parseTimeInput(str){
  const parts = String(str).trim().split(':').map(p => p.replace(/\D/g, ''));
  if (parts.some(p => p === '') || parts.length > 3) return null;
  const nums = parts.map(Number);
  if (nums.some(isNaN)) return null;
  if (nums.length === 1) return nums[0] * 60;                       // «5» → 5 минут
  if (nums.length === 2) return nums[0] * 60 + nums[1];             // мм:сс
  return nums[0] * 3600 + nums[1] * 60 + nums[2];                   // чч:мм:сс
}

tDisplay.setAttribute('tabindex', '0');
tDisplay.addEventListener('click', () => {
  if (tDisplay.classList.contains('is-editing')) return;
  pauseTimer();
  tDisplay.classList.add('is-editing');
  tDisplay.contentEditable = 'true';
  tDisplay.focus();
  const range = document.createRange();
  range.selectNodeContents(tDisplay);
  const sel = getSelection();
  sel.removeAllRanges(); sel.addRange(range);
});
function commitTimeEdit(){
  if (!tDisplay.classList.contains('is-editing')) return;
  const secs = parseTimeInput(tDisplay.textContent);
  tDisplay.contentEditable = 'false';
  tDisplay.classList.remove('is-editing');
  if (secs !== null && secs > 0){
    timer.total = timer.remaining = Math.min(secs, 99 * 3600);
    document.querySelectorAll('#timerPresets .chip').forEach(c =>
      c.classList.toggle('is-active', Number(c.dataset.seconds) === timer.total));
  }
  tDisplay.classList.remove('is-done');
  renderTimer();
}
tDisplay.addEventListener('blur', commitTimeEdit);
tDisplay.addEventListener('keydown', e => {
  if (e.key === 'Enter'){ e.preventDefault(); commitTimeEdit(); }
  if (e.key === 'Escape'){ tDisplay.classList.remove('is-editing'); tDisplay.contentEditable = 'false'; renderTimer(); }
});

/* =========================================================
   6. Секундомер
   ========================================================= */
const sw = { elapsed: 0, running: false, startedAt: 0, tick: 0, laps: [] };
const swDisplay = document.getElementById('swDisplay');
const swStart   = document.getElementById('swStart');
const swLapBtn  = document.getElementById('swLap');
const swResetBtn= document.getElementById('swReset');
const swLapsEl  = document.getElementById('swLaps');

function fmtSw(ms){
  const total = Math.floor(ms / 10);            // сотые
  const cs = total % 100;
  const s  = Math.floor(total / 100) % 60;
  const m  = Math.floor(total / 6000) % 60;
  const h  = Math.floor(total / 360000);
  const head = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return { head, cs: pad(cs) };
}
function renderSw(){
  const { head, cs } = fmtSw(sw.elapsed);
  swDisplay.innerHTML = `${head}<span class="display__ms">.${cs}</span>`;
  const label = swStart.querySelector('span');
  label.textContent = sw.running ? t('btn.pause') : (sw.elapsed > 0 ? t('btn.resume') : t('btn.start'));
  swStart.querySelector('.ic-play').style.display  = sw.running ? 'none' : 'block';
  swStart.querySelector('.ic-pause').style.display = sw.running ? 'block' : 'none';
}
function tickSw(){
  if (!sw.running) return;
  sw.elapsed = Date.now() - sw.startedAt;
  renderSw();
}
function toggleSw(){
  if (sw.running){
    sw.running = false;
    clearInterval(sw.tick);
    renderSw();
  } else {
    sw.running = true;
    sw.startedAt = Date.now() - sw.elapsed;
    clearInterval(sw.tick);
    sw.tick = setInterval(tickSw, 33);
    tickSw();
  }
}
function addLap(){
  if (sw.elapsed === 0) return;
  const prev = sw.laps.length ? sw.laps[0].total : 0;
  sw.laps.unshift({ total: sw.elapsed, split: sw.elapsed - prev });
  renderLaps();
}
function renderLaps(){
  swLapsEl.innerHTML = sw.laps.map((l, i) => {
    const n = sw.laps.length - i;
    const total = fmtSw(l.total), split = fmtSw(l.split);
    return `<li><span>${t('lap')} ${n}</span><em>+${split.head}.${split.cs}</em><b>${total.head}.${total.cs}</b></li>`;
  }).join('');
}
swStart.addEventListener('click', toggleSw);
swLapBtn.addEventListener('click', addLap);
swResetBtn.addEventListener('click', () => {
  sw.running = false; clearInterval(sw.tick);
  sw.elapsed = 0; sw.laps = [];
  renderLaps(); renderSw();
});

/* Переключение вкладок таймер / секундомер */
document.querySelectorAll('.switch__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.switch__btn').forEach(b => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    document.querySelectorAll('.pane').forEach(p =>
      p.classList.toggle('is-active', p.dataset.pane === btn.dataset.mode));
  });
});

/* Горячие клавиши для активной вкладки секундомера */
document.addEventListener('keydown', e => {
  const swPaneActive = document.querySelector('[data-pane="stopwatch"]').classList.contains('is-active');
  const typing = /INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.target.isContentEditable;
  if (!swPaneActive || typing) return;
  if (e.code === 'Space'){ e.preventDefault(); toggleSw(); }
  if (e.key.toLowerCase() === 'l' || e.key.toLowerCase() === 'д'){ addLap(); }
});

/* =========================================================
   7. Калькулятор — разбор и вычисление выражений
   ========================================================= */
const FUNCS = {
  sin: x => Math.sin(toRad(x)),  cos: x => Math.cos(toRad(x)),  tan: x => Math.tan(toRad(x)),
  asin: x => fromRad(Math.asin(x)), acos: x => fromRad(Math.acos(x)), atan: x => fromRad(Math.atan(x)),
  ln: Math.log, log: Math.log10, '√': Math.sqrt,
  exp: Math.exp, abs: Math.abs
};
let angleMode = 'deg';
const toRad   = x => angleMode === 'deg' ? x * Math.PI / 180 : x;
const fromRad = x => angleMode === 'deg' ? x * 180 / Math.PI : x;

function tokenize(src){
  const tokens = [];
  let i = 0;
  const names = ['asin','acos','atan','sin','cos','tan','ln','log','√','abs'];
  while (i < src.length){
    const c = src[i];
    if (c === ' '){ i++; continue; }
    if (/[0-9.]/.test(c)){
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const raw = src.slice(i, j);
      if ((raw.match(/\./g) || []).length > 1) throw new Error('bad-number');
      tokens.push({ t: 'num', v: parseFloat(raw) });
      i = j; continue;
    }
    if (c === 'π'){ tokens.push({ t: 'num', v: Math.PI }); i++; continue; }
    if (c === 'e'){ tokens.push({ t: 'num', v: Math.E }); i++; continue; }
    const name = names.find(n => src.startsWith(n, i));
    if (name){ tokens.push({ t: 'fn', v: name }); i += name.length; continue; }
    if (c === '('){ tokens.push({ t: 'lp' }); i++; continue; }
    if (c === ')'){ tokens.push({ t: 'rp' }); i++; continue; }
    if ('+-*/^!%E'.includes(c)){ tokens.push({ t: 'op', v: c }); i++; continue; }
    throw new Error('bad-char');
  }
  return tokens;
}

function factorial(n){
  if (n < 0 || !Number.isInteger(n)) throw new Error('factorial');
  if (n > 170) return Infinity;
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function evaluate(src){
  const tk = tokenize(src);
  let pos = 0;
  const peek = () => tk[pos];
  const eat  = () => tk[pos++];

  function parseExpr(){                       // + и −
    let left = parseTerm();
    while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')){
      const op = eat().v;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }
  function parseTerm(){                       // × и ÷ (+ неявное умножение)
    let left = parseSci();
    for (;;){
      const p = peek();
      if (p && p.t === 'op' && (p.v === '*' || p.v === '/')){
        const op = eat().v;
        const right = parseSci();
        if (op === '/' && right === 0) throw new Error('div-zero');
        left = op === '*' ? left * right : left / right;
      } else if (p && (p.t === 'num' || p.t === 'fn' || p.t === 'lp')){
        left = left * parseSci();             // 2π, 3(4+1), 2sin(30)
      } else return left;
    }
  }
  function parseSci(){                        // EXP: 2E3 = 2000
    let left = parseUnary();
    while (peek() && peek().t === 'op' && peek().v === 'E'){
      eat();
      left = left * Math.pow(10, parseUnary());
    }
    return left;
  }
  function parseUnary(){
    const p = peek();
    if (p && p.t === 'op' && (p.v === '-' || p.v === '+')){
      const op = eat().v;
      const v = parseUnary();
      return op === '-' ? -v : v;
    }
    return parsePower();
  }
  function parsePower(){                      // ^ правоассоциативна
    const base = parsePostfix();
    if (peek() && peek().t === 'op' && peek().v === '^'){
      eat();
      return Math.pow(base, parseUnary());
    }
    return base;
  }
  function parsePostfix(){                    // ! и %
    let v = parsePrimary();
    for (;;){
      const p = peek();
      if (p && p.t === 'op' && p.v === '!'){ eat(); v = factorial(v); }
      else if (p && p.t === 'op' && p.v === '%'){ eat(); v = v / 100; }
      else return v;
    }
  }
  function parsePrimary(){
    const p = eat();
    if (!p) throw new Error('unexpected-end');
    if (p.t === 'num') return p.v;
    if (p.t === 'lp'){
      const v = parseExpr();
      if (!peek() || peek().t !== 'rp') throw new Error('paren');
      eat();
      return v;
    }
    if (p.t === 'fn'){
      let arg;
      if (peek() && peek().t === 'lp'){ eat(); arg = parseExpr();
        if (!peek() || peek().t !== 'rp') throw new Error('paren');
        eat();
      } else arg = parseUnary();              // √9 без скобок
      const fn = FUNCS[p.v];
      const out = fn(arg);
      if (typeof out !== 'number' || Number.isNaN(out)) throw new Error('domain');
      return out;
    }
    throw new Error('unexpected');
  }

  const result = parseExpr();
  if (pos < tk.length) throw new Error('trailing');
  if (!Number.isFinite(result)) throw new Error('infinite');
  return result;
}

function fmtNumber(n){
  if (!Number.isFinite(n)) return '∞';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-9) return n.toExponential(6).replace(/\.?0+e/, 'e');
  const rounded = Number(n.toPrecision(12));
  return String(rounded);
}

const calcExpr   = document.getElementById('calcExpr');
const calcResult = document.getElementById('calcResult');
const histEl     = document.getElementById('calcHistory');
let expr = '';
let ans = 0;
let history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
let invOn = false;

const PRETTY = { '*':'×', '/':'÷', '-':'−', 'E':'e' };
const prettify = s => s.replace(/[*/\-E]/g, c => PRETTY[c]);

function renderCalc(){
  calcExpr.textContent = expr ? prettify(expr) : '0';
  calcExpr.scrollTop = calcExpr.scrollHeight;
  if (!expr){ calcResult.textContent = '0'; calcResult.classList.remove('is-error'); return; }
  try {
    const v = evaluate(expr);
    calcResult.textContent = fmtNumber(v);
    calcResult.classList.remove('is-error');
  } catch (_) {
    calcResult.textContent = '…';             // выражение ещё не дописано
    calcResult.classList.remove('is-error');
  }
}
function renderHistory(){
  histEl.innerHTML = history.map(h =>
    `<li data-expr="${h.e.replace(/"/g,'&quot;')}">${prettify(h.e)} <b>= ${h.r}</b></li>`).join('');
}
histEl.addEventListener('click', e => {
  const li = e.target.closest('li');
  if (!li) return;
  expr = li.dataset.expr;
  renderCalc();
});
document.getElementById('histClear').addEventListener('click', () => {
  history = []; localStorage.removeItem('calcHistory'); renderHistory();
});

function calcEquals(){
  if (!expr) return;
  try {
    const v = evaluate(expr);
    ans = v;
    const shown = fmtNumber(v);
    calcResult.textContent = shown;
    calcResult.classList.remove('is-error');
    history.unshift({ e: expr, r: shown });
    history = history.slice(0, 20);
    localStorage.setItem('calcHistory', JSON.stringify(history));
    renderHistory();
    expr = shown.replace(/e[+-]?\d+$/i, m => 'E' + m.slice(1).replace('+',''));
    calcExpr.textContent = prettify(expr);
  } catch (err) {
    calcResult.textContent = ({
      'div-zero': lang === 'ru' ? 'Деление на ноль' : 'Division by zero',
      'domain':   lang === 'ru' ? 'Вне области определения' : 'Out of domain',
      'paren':    lang === 'ru' ? 'Проверьте скобки' : 'Check the brackets',
      'factorial':lang === 'ru' ? 'Факториал только для целых ≥ 0' : 'Factorial needs a non-negative integer'
    })[err.message] || (lang === 'ru' ? 'Ошибка в выражении' : 'Invalid expression');
    calcResult.classList.add('is-error');
  }
}

function insert(str){
  if (calcResult.classList.contains('is-error')){ expr = ''; calcResult.classList.remove('is-error'); }
  expr += str;
  renderCalc();
}

document.getElementById('calcKeys').addEventListener('click', e => {
  const key = e.target.closest('.key');
  if (!key) return;
  if (key.dataset.ins){ insert(key.dataset.ins); return; }

  switch (key.dataset.act){
    case 'clear': expr = ''; calcResult.classList.remove('is-error'); renderCalc(); break;
    case 'back':  expr = expr.replace(/(asin|acos|atan|sin|cos|tan|ln|log|.)$/, ''); renderCalc(); break;
    case 'eq':    calcEquals(); break;
    case 'ans':   insert(fmtNumber(ans)); break;
    case 'neg':
      if (/(^|[(+\-*/^E])$/.test(expr)) insert('-');
      else { expr = '-(' + expr + ')'; renderCalc(); }
      break;
    case 'angle':
      angleMode = angleMode === 'deg' ? 'rad' : 'deg';
      document.getElementById('angleLabel').textContent = angleMode === 'deg' ? 'Deg' : 'Rad';
      key.classList.toggle('is-rad', angleMode === 'rad');
      renderCalc();
      break;
    case 'inv': {
      invOn = !invOn;
      key.classList.toggle('is-on', invOn);
      const map = invOn
        ? { 'sin(':['asin(','sin⁻¹'], 'cos(':['acos(','cos⁻¹'], 'tan(':['atan(','tan⁻¹'] }
        : { 'asin(':['sin(','sin'],  'acos(':['cos(','cos'],  'atan(':['tan(','tan'] };
      document.querySelectorAll('#calcKeys .key[data-ins]').forEach(b => {
        const rule = map[b.dataset.ins];
        if (rule){ b.dataset.ins = rule[0]; b.textContent = rule[1]; }
      });
      break;
    }
  }
});

/* Ввод с физической клавиатуры */
document.addEventListener('keydown', e => {
  const inCalc = document.getElementById('calculator').getBoundingClientRect().top < window.innerHeight * 0.6
              && document.getElementById('calculator').getBoundingClientRect().bottom > window.innerHeight * 0.4;
  const typing = /INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.target.isContentEditable;
  if (!inCalc || typing || e.metaKey || e.ctrlKey) return;

  if (/^[0-9.+\-*/()^!%]$/.test(e.key)){ insert(e.key); flash(e.key); e.preventDefault(); }
  else if (e.key === 'Enter' || e.key === '='){ calcEquals(); flash('='); e.preventDefault(); }
  else if (e.key === 'Backspace'){ expr = expr.slice(0, -1); renderCalc(); e.preventDefault(); }
  else if (e.key === 'Escape'){ expr = ''; renderCalc(); }
});
function flash(ch){
  const btn = [...document.querySelectorAll('#calcKeys .key')]
    .find(b => b.dataset.ins === ch || (ch === '=' && b.dataset.act === 'eq'));
  if (!btn) return;
  btn.classList.add('is-hit');
  setTimeout(() => btn.classList.remove('is-hit'), 120);
}

/* =========================================================
   8. Конвертер валют
   ========================================================= */
const CURRENCIES = {
  usd:{f:'🇺🇸',ru:'Доллар США',       en:'US Dollar'},
  eur:{f:'🇪🇺',ru:'Евро',              en:'Euro'},
  rub:{f:'🇷🇺',ru:'Российский рубль',  en:'Russian Ruble'},
  gbp:{f:'🇬🇧',ru:'Фунт стерлингов',   en:'British Pound'},
  cny:{f:'🇨🇳',ru:'Китайский юань',    en:'Chinese Yuan'},
  jpy:{f:'🇯🇵',ru:'Японская иена',     en:'Japanese Yen'},
  chf:{f:'🇨🇭',ru:'Швейцарский франк', en:'Swiss Franc'},
  kzt:{f:'🇰🇿',ru:'Казахстанский тенге',en:'Kazakh Tenge'},
  byn:{f:'🇧🇾',ru:'Белорусский рубль', en:'Belarusian Ruble'},
  uah:{f:'🇺🇦',ru:'Гривна',            en:'Ukrainian Hryvnia'},
  try:{f:'🇹🇷',ru:'Турецкая лира',     en:'Turkish Lira'},
  aed:{f:'🇦🇪',ru:'Дирхам ОАЭ',        en:'UAE Dirham'},
  gel:{f:'🇬🇪',ru:'Грузинский лари',   en:'Georgian Lari'},
  amd:{f:'🇦🇲',ru:'Армянский драм',    en:'Armenian Dram'},
  pln:{f:'🇵🇱',ru:'Польский злотый',   en:'Polish Zloty'},
  inr:{f:'🇮🇳',ru:'Индийская рупия',   en:'Indian Rupee'},
  krw:{f:'🇰🇷',ru:'Корейская вона',    en:'Korean Won'},
  cad:{f:'🇨🇦',ru:'Канадский доллар',  en:'Canadian Dollar'},
  aud:{f:'🇦🇺',ru:'Австралийский доллар',en:'Australian Dollar'},
  rsd:{f:'🇷🇸',ru:'Сербский динар',    en:'Serbian Dinar'}
};

/* Резервные курсы к доллару — используются только если API недоступен */
const FALLBACK_USD = {
  usd:1, eur:0.92, rub:86.27, gbp:0.78, cny:7.12, jpy:147, chf:0.86, kzt:480,
  byn:3.27, uah:41.3, try:34.2, aed:3.67, gel:2.7, amd:387, pln:3.94,
  inr:83.5, krw:1340, cad:1.36, aud:1.5, rsd:108
};

const CDN = [
  d => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${d}/v1/currencies/usd.min.json`,
  d => `https://${d === 'latest' ? 'latest' : d}.currency-api.pages.dev/v1/currencies/usd.min.json`
];

async function fetchDay(day){
  for (const build of CDN){
    try {
      const res = await fetch(build(day), { cache: 'default' });
      if (!res.ok) continue;
      const json = await res.json();
      if (json && json.usd) return { date: json.date || day, usd: json.usd };
    } catch (_) { /* пробуем следующее зеркало */ }
  }
  return null;
}

const state = { usd: null, date: null, live: false, series: [] };

const fromCur    = document.getElementById('fromCur');
const toCur      = document.getElementById('toCur');
const fromAmount = document.getElementById('fromAmount');
const toAmount   = document.getElementById('toAmount');
const convStatus = document.getElementById('convStatus');
const convRate   = document.getElementById('convRate');

function fillSelects(){
  const opts = Object.keys(CURRENCIES).map(code =>
    `<option value="${code}">${CURRENCIES[code].f} ${code.toUpperCase()} — ${CURRENCIES[code][lang]}</option>`).join('');
  const a = fromCur.value || localStorage.getItem('curFrom') || 'usd';
  const b = toCur.value   || localStorage.getItem('curTo')   || 'rub';
  fromCur.innerHTML = opts; toCur.innerHTML = opts;
  fromCur.value = a; toCur.value = b;
}

const rate = (from, to) => {
  const table = state.usd || FALLBACK_USD;
  if (!table[from] || !table[to]) return null;
  return table[to] / table[from];
};

const nf = (v, digits) => new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US',
  { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);

function smartDigits(v){
  const a = Math.abs(v);
  if (a === 0) return 2;
  if (a < 0.01) return 6;
  if (a < 1) return 4;
  if (a < 1000) return 2;
  return 2;
}

function convert(source){
  const from = fromCur.value, to = toCur.value;
  const r = rate(from, to);
  if (r === null) return;

  if (source !== 'to'){
    const amount = parseFloat(String(fromAmount.value).replace(/\s/g, '').replace(',', '.'));
    const out = Number.isFinite(amount) ? amount * r : 0;
    toAmount.value = nf(out, smartDigits(out));
  } else {
    const amount = parseFloat(String(toAmount.value).replace(/\s/g, '').replace(',', '.'));
    const out = Number.isFinite(amount) ? amount / r : 0;
    fromAmount.value = nf(out, smartDigits(out));
  }

  convRate.innerHTML = `1 ${from.toUpperCase()} = <b>${nf(r, smartDigits(r))} ${to.toUpperCase()}</b>` +
    ` &nbsp;·&nbsp; 1 ${to.toUpperCase()} = <b>${nf(1 / r, smartDigits(1 / r))} ${from.toUpperCase()}</b>`;
  localStorage.setItem('curFrom', from);
  localStorage.setItem('curTo', to);
}

fromAmount.addEventListener('input', () => convert('from'));
toAmount.addEventListener('input',   () => convert('to'));
fromCur.addEventListener('change', () => { convert('from'); loadHistory(); });
toCur.addEventListener('change',   () => { convert('from'); loadHistory(); });
document.getElementById('swapBtn').addEventListener('click', () => {
  const a = fromCur.value;
  fromCur.value = toCur.value;
  toCur.value = a;
  convert('from');
  loadHistory();
});

/* Быстрые пары */
const QUICK = [['usd','rub'],['eur','rub'],['usd','eur'],['cny','rub'],['try','rub'],['kzt','rub']];
document.getElementById('quickList').innerHTML = QUICK.map(([a, b]) =>
  `<button data-a="${a}" data-b="${b}">${a.toUpperCase()} → ${b.toUpperCase()}</button>`).join('');
document.getElementById('quickList').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  fromCur.value = btn.dataset.a;
  toCur.value = btn.dataset.b;
  convert('from');
  loadHistory();
});

function setStatus(kind, key){
  convStatus.className = 'conv__status ' + kind;
  convStatus.innerHTML = `<span class="dot"></span><span>${t(key)}</span>`;
}

/* ---- График динамики ---- */
function drawChart(series){
  const box = document.getElementById('chartBox');
  const cap = document.getElementById('chartCap');
  if (!series || series.length < 4){
    box.innerHTML = `<div class="chart__empty">${t('conv.nochart')}</div>`;
    cap.textContent = '—';
    ['statMin','statAvg','statMax','statNow'].forEach(id => document.getElementById(id).textContent = '—');
    return;
  }
  const vals = series.map(p => p.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const now = vals[vals.length - 1];
  const d = smartDigits(now);
  document.getElementById('statMin').textContent = nf(min, d);
  document.getElementById('statAvg').textContent = nf(avg, d);
  document.getElementById('statMax').textContent = nf(max, d);
  document.getElementById('statNow').textContent = nf(now, d);
  cap.textContent = `${fromCur.value.toUpperCase()} → ${toCur.value.toUpperCase()} · ${t('conv.days')}`;

  const W = 320, H = 170, padL = 44, padR = 10, padT = 12, padB = 26;
  const span = (max - min) || (max * 0.01) || 1;
  const lo = min - span * 0.15, hi = max + span * 0.15;
  const x = i => padL + i * (W - padL - padR) / (series.length - 1);
  const y = v => padT + (hi - v) * (H - padT - padB) / (hi - lo);

  const line = series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(series.length - 1).toFixed(1)},${H - padB} L${padL},${H - padB} Z`;

  let grid = '', labels = '';
  for (let k = 0; k <= 3; k++){
    const v = lo + (hi - lo) * k / 3;
    const yy = y(v).toFixed(1);
    grid += `<line class="chart__grid" x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}"/>`;
    labels += `<text class="chart__label" x="${padL - 6}" y="${Number(yy) + 4}" text-anchor="end">${nf(v, d > 2 ? d : (hi - lo < 4 ? 2 : 0))}</text>`;
  }
  const fmtDate = s => {
    const dt = new Date(s);
    return dt.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
  };
  const ticks = [0, Math.floor((series.length - 1) / 2), series.length - 1];
  const xlabels = ticks.map((i, n) => {
    const anchor = n === 0 ? 'start' : n === 2 ? 'end' : 'middle';
    return `<text class="chart__label" x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="${anchor}">${fmtDate(series[i].d)}</text>`;
  }).join('');

  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${cap.textContent}">
    <defs><linearGradient id="chartFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--accent)" stop-opacity=".45"/>
      <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
    </linearGradient></defs>
    ${grid}${labels}
    <path class="chart__area" d="${area}"/>
    <path class="chart__line" d="${line}"/>
    <circle cx="${x(series.length - 1).toFixed(1)}" cy="${y(now).toFixed(1)}" r="3.5" fill="var(--accent)"/>
    ${xlabels}
  </svg>`;
}
window.__redrawChart = () => drawChart(state.series);

function isoDate(offsetDays){
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

let historyToken = 0;
async function loadHistory(){
  const token = ++historyToken;
  const from = fromCur.value, to = toCur.value;
  const box = document.getElementById('chartBox');
  box.innerHTML = `<div class="chart__empty">${t('conv.loading')}</div>`;

  if (!state.live){ drawChart(null); return; }

  const cacheKey = `hist:${from}-${to}:${isoDate(0)}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached){
    state.series = JSON.parse(cached);
    drawChart(state.series);
    return;
  }

  const offsets = [30, 27, 24, 21, 18, 15, 12, 9, 6, 3, 0];
  const days = await Promise.all(offsets.map(o => fetchDay(o === 0 ? 'latest' : isoDate(o))));
  if (token !== historyToken) return;         // пользователь успел сменить пару

  const series = days
    .map(day => {
      if (!day || !day.usd[from] || !day.usd[to]) return null;
      return { d: day.date, v: day.usd[to] / day.usd[from] };
    })
    .filter(Boolean);

  state.series = series;
  if (series.length >= 4) sessionStorage.setItem(cacheKey, JSON.stringify(series));
  drawChart(series);
}

async function loadRates(){
  setStatus('', 'conv.loading');
  const latest = await fetchDay('latest');
  if (latest){
    state.usd = latest.usd;
    state.date = latest.date;
    state.live = true;
    setStatus('is-live', 'conv.live');
    const dt = new Date(latest.date);
    document.getElementById('footerUpdated').textContent =
      `${t('updated')} ${dt.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day:'numeric', month:'long', year:'numeric' })}`;
  } else {
    state.usd = FALLBACK_USD;
    state.live = false;
    setStatus('is-offline', 'conv.offline');
    document.getElementById('footerUpdated').textContent = '';
  }
  convert('from');
  loadHistory();
}

/* Вкладку могли свернуть: браузер душит таймеры в фоне,
   поэтому при возврате пересчитываем время по системным часам. */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (timer.running) tickTimer();
  if (sw.running) tickSw();
});

/* =========================================================
   9. Старт
   ========================================================= */
fillSelects();
applyLang();
renderTimer();
renderSw();
renderCalc();
renderHistory();
loadRates();

document.addEventListener('langchange', () => {
  fillSelects();
  renderTimer();
  renderSw();
  renderLaps();
  convert('from');
  drawChart(state.series);
  if (state.date){
    const dt = new Date(state.date);
    document.getElementById('footerUpdated').textContent =
      `${t('updated')} ${dt.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { day:'numeric', month:'long', year:'numeric' })}`;
  }
});
