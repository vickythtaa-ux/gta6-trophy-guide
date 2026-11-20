// Leonida Trophy Guide — tracker, filters, spoiler setting, export/import.
// All data lives in data/trophies.json and data/roadmap.json; nothing is fetched
// from the network. Progress is a set of trophy ids in localStorage.
const KEY = 'gta6-trophy-guide-progress-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoilers-v1';

const listEl = document.getElementById('trophy-list');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoilers');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const gradeCountsEl = document.getElementById('grade-counts');
const roadmapEl = document.getElementById('roadmap-list');

let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
} catch {
  earned = new Set();
}
let filter = 'all';
let spoilersHidden = (localStorage.getItem(SPOILER_KEY) ?? 'on') === 'on';
spoilerEl.checked = spoilersHidden;

const [trophyDoc, roadmapDoc] = await Promise.all([
  (await fetch('data/trophies.json')).json(),
  (await fetch('data/roadmap.json')).json(),
]);
const trophies = trophyDoc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function isSpoilerHidden(t) {
  return spoilersHidden && t.kind === 'story' && !earned.has(t.id);
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  progressFill.style.width = `${Math.round((done / total) * 100)}%`;
  progressText.textContent = `${done} of ${total} earned${done === total ? ' — platinum time!' : ''}`;
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  gradeCountsEl.replaceChildren();
  for (const g of grades) {
    const all = trophies.filter((t) => t.grade === g);
    const got = all.filter((t) => earned.has(t.id)).length;
    const pill = document.createElement('span');
    pill.className = 'grade-pill';
    pill.innerHTML = `<span class="dot ${g}"></span>${g[0].toUpperCase() + g.slice(1)} ${got}/${all.length}`;
    gradeCountsEl.appendChild(pill);
  }
}

function renderRoadmap() {
  roadmapEl.replaceChildren();
  for (const phase of roadmapDoc.phases) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = phase.title;
    const p = document.createElement('p');
    p.textContent = phase.text;
    const chips = document.createElement('div');
    chips.className = 'roadmap-trophies';
    for (const id of phase.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      const s = document.createElement('span');
      s.textContent = (earned.has(id) ? '✓ ' : '') + t.name;
      chips.appendChild(s);
    }
    li.append(h, p, chips);
    roadmapEl.appendChild(li);
  }
}

function matches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  switch (filter) {
    case 'story': return t.kind === 'story';
    case 'missable': return t.missable;
    case 'collectibles': return t.kind === 'collectibles';
    case 'activities': return t.kind === 'activities';
    case 'online': return false;
    default: return true;
  }
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(matches);
  if (filter === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No online trophies here — all 55 are offline and single-player, so the whole set can be earned without ever going online.';
  } else if (shown.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No trophies match that search or filter.';
  } else {
    emptyEl.hidden = true;
  }
  for (const t of shown) {
    const li = document.createElement('li');
    if (earned.has(t.id)) li.classList.add('earned');
    if (t.missable) li.classList.add('missable');

    const checkWrap = document.createElement('div');
    checkWrap.className = 'trophy-check';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderProgress();
      renderRoadmap();
      renderList();
    });
    checkWrap.appendChild(box);

    const body = document.createElement('div');
    body.className = 'trophy-body';
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    const hiddenSpoiler = isSpoilerHidden(t);
    if (hiddenSpoiler) {
      name.textContent = 'Hidden trophy';
      name.classList.add('hidden-name');
    } else {
      name.textContent = t.name;
    }
    head.appendChild(name);
    if (!hiddenSpoiler) {
      const gradeBadge = document.createElement('span');
      gradeBadge.className = `badge ${t.grade}`;
      gradeBadge.textContent = t.grade;
      head.appendChild(gradeBadge);
      if (t.hidden) {
        const hb = document.createElement('span');
        hb.className = 'badge hidden-badge';
        hb.textContent = 'Hidden on PSN';
        head.appendChild(hb);
      }
      if (t.missable) {
        const mb = document.createElement('span');
        mb.className = 'badge missable-badge';
        mb.textContent = 'Possibly missable';
        head.appendChild(mb);
      }
    } else {
      const hb = document.createElement('span');
      hb.className = 'badge hidden-badge';
      hb.textContent = 'Story — hidden';
      head.appendChild(hb);
    }
    body.appendChild(head);

    if (hiddenSpoiler) {
      const p = document.createElement('p');
      p.className = 'trophy-desc';
      p.textContent = 'A story trophy. Its name, description and guide stay hidden until you earn it — tick the box once it pops in the game.';
      body.appendChild(p);
    } else {
      const desc = document.createElement('p');
      desc.className = 'trophy-desc';
      desc.textContent = t.description;
      const guide = document.createElement('p');
      guide.className = 'trophy-guide';
      guide.textContent = t.guide;
      const source = document.createElement('p');
      source.className = 'trophy-source';
      source.textContent = t.source;
      body.append(desc, guide, source);
    }
    li.append(checkWrap, body);
    listEl.appendChild(li);
  }
}

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    filter = chip.dataset.filter;
    renderList();
  });
});
searchEl.addEventListener('input', renderList);
gradeEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', () => {
  spoilersHidden = spoilerEl.checked;
  localStorage.setItem(SPOILER_KEY, spoilersHidden ? 'on' : 'off');
  renderList();
});

document.getElementById('export').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    const valid = ids.filter((id) => byId.has(Number(id))).map(Number);
    earned = new Set(valid);
    save();
    renderProgress();
    renderRoadmap();
    renderList();
  } catch {
    alert('That file is not a trophy progress export from this guide.');
  }
  event.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    save();
    renderProgress();
    renderRoadmap();
    renderList();
  }
});

renderProgress();
renderRoadmap();
renderList();
