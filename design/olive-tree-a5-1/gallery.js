/** Studio wiring only. Explicit synthetic contexts, no app store/router. */
import { STAGES } from './geometry.js';
import { SIZE, ANCHOR } from './config.js';
import { createTreeScene } from './tree-scene.js';
const $ = (selector) => document.querySelector(selector),
  query = new URLSearchParams(location.search),
  themes = ['light', 'paper', 'atmospheric', 'night'];
const theme = themes.includes(query.get('theme'))
  ? query.get('theme')
  : 'paper';
document.documentElement.dataset.theme = theme;
$('#theme').value = theme;
$('#theme').addEventListener(
  'change',
  () => (document.documentElement.dataset.theme = $('#theme').value),
);
if (query.has('capture')) document.body.classList.add('capture');
const parsed = Number(query.get('stage') ?? 6);
let selectedStage = Number.isInteger(parsed) && STAGES[parsed] ? parsed : 6,
  context = 'today',
  view = 'preview',
  oldScene = null,
  newScene = null;
const displayName = (name) =>
  name
    .replace('Fruchttragender', 'Frucht\u00adtragender')
    .replaceAll('Olivenbaum', 'Oliven\u00adbaum');
const displayMeaning = (text) =>
  text.replace('nebeneinanderstehen', 'nebeneinander\u00adstehen');
for (const stage of STAGES) {
  const option = document.createElement('option');
  option.value = stage.index;
  option.textContent = stage.name;
  $('#stage').append(option);
}
$('#stage').value = selectedStage;
const live = createTreeScene($('#live-tree'), {
  stage: selectedStage,
  autoplay: !query.has('paused'),
  onStatus: (text) => ($('#status').textContent = text),
  onStage: (index) => {
    description(index);
    if (context !== 'seed') {
      selectedStage = index;
      $('#stage').value = index;
    }
  },
});
function description(index) {
  $('#stage-name').textContent = displayName(STAGES[index].name);
  $('#stage-meaning').textContent = displayMeaning(STAGES[index].meaning);
}
description(selectedStage);
function selectStage(index) {
  if (context === 'seed') return Promise.resolve(false);
  selectedStage = index;
  $('#stage').value = index;
  return live.setStage(index);
}
$('#stage').addEventListener(
  'change',
  () => void selectStage(Number($('#stage').value)),
);
const contexts = {
  today: [
    'Heute',
    'Dein Weg geht weiter.',
    'Eigene Worte, bewusste Schritte: deine persönliche Glaubensgeschichte.',
  ],
  journey: [
    'Mein Weg',
    'Was dich verwurzelt.',
    'Deine Anliegen, Gedanken und ausdrücklich bestätigten Entwicklungen bleiben miteinander verbunden.',
  ],
  detail: [
    'Dein Olivenbaum',
    'Deine Geschichte bleibt.',
    'Sieben Bilder machen festgehaltene persönliche Entwicklung sichtbar. Sie messen keine geistliche Reife.',
  ],
  seed: [
    'Dein erster Weg',
    'Ein Anfang darf klein sein.',
    'Ein Gedanke, ein Gebet, ein nächster Schritt. Das symbolische Pflanzen vergibt keine zusätzliche Entwicklungsstufe.',
  ],
};
function showContext(value) {
  if (!Object.hasOwn(contexts, value)) return false;
  context = value;
  $('#context').value = value;
  const [area, title, intro] = contexts[value];
  $('#area').textContent = area;
  $('#screen-title').textContent = title;
  $('#screen-intro').textContent = intro;
  $('#stage').disabled = value === 'seed';
  $('#next-stage').disabled = value === 'seed';
  $('#next-step').hidden = value === 'detail';
  document
    .querySelectorAll('[data-context]')
    .forEach((button) =>
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.context === value),
      ),
    );
  void live.setStage(value === 'seed' ? 0 : selectedStage);
  return true;
}
$('#context').addEventListener('change', () =>
  showContext($('#context').value),
);
document
  .querySelectorAll('[data-context]')
  .forEach((button) =>
    button.addEventListener('click', () => showContext(button.dataset.context)),
  );
for (const stage of STAGES) {
  const li = document.createElement('li'),
    button = document.createElement('button'),
    meaning = document.createElement('p');
  button.textContent = displayName(stage.name);
  button.addEventListener('click', () => {
    if (context === 'seed') showContext('detail');
    void selectStage(stage.index);
  });
  meaning.textContent = displayMeaning(stage.meaning);
  li.append(button, meaning);
  $('#stage-meanings').append(li);
  const card = document.createElement('article');
  card.className = 'stage-card';
  const frame = document.createElement('div');
  frame.className = 'art-frame';
  const image = document.createElement('img');
  image.src = new URL(stage.variants[0].src, import.meta.url).href;
  image.alt = stage.name;
  image.loading = 'lazy';
  const s = stage.art.scale;
  image.style.transform = `matrix(${s},0,0,${s},${((1 - s) * ANCHOR[0] * 200) / SIZE},${((1 - s) * ANCHOR[1] * 200) / SIZE})`;
  frame.append(image);
  const title = document.createElement('h3');
  title.textContent = displayName(stage.name);
  const p = document.createElement('p');
  p.textContent = displayMeaning(stage.meaning);
  const action = document.createElement('button');
  action.textContent = 'Bewegt ansehen';
  action.addEventListener('click', () => {
    if (context === 'seed') showContext('today');
    showView('preview');
    void selectStage(stage.index);
    $('#live-tree').scrollIntoView({ block: 'center' });
  });
  const source = document.createElement('a');
  source.href = stage.source;
  source.textContent = 'Quell-PNG';
  card.append(frame, title, p, action, source);
  $('#family-grid').append(card);
}
function showView(next) {
  view = next;
  for (const value of ['preview', 'family', 'compare'])
    $('#' + value).hidden = value !== next;
  $('#context-control').hidden = $('#stage-control').hidden =
    next !== 'preview';
  document
    .querySelectorAll('[data-view]')
    .forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.view === next)),
    );
  live.setEnabled(next === 'preview');
  if (next === 'compare' && !oldScene) {
    oldScene = createTreeScene($('#old-tree'), {
      profile: 'a5',
      onStatus: (text) => ($('#old-status').textContent = text),
    });
    newScene = createTreeScene($('#new-tree'), {
      onStatus: (text) => ($('#new-status').textContent = text),
    });
  }
  oldScene?.setEnabled(next === 'compare');
  newScene?.setEnabled(next === 'compare');
}
document
  .querySelectorAll('[data-view]')
  .forEach((button) =>
    button.addEventListener('click', () => showView(button.dataset.view)),
  );
$('#pause').addEventListener('click', () => live.pause());
$('#play').addEventListener('click', () => live.play());
$('#retry').addEventListener('click', () => void live.retry());
$('#next-stage').addEventListener(
  'click',
  () => void selectStage(((live.stage?.index ?? selectedStage) + 1) % 7),
);
$('#read-metrics').addEventListener('click', () => {
  const { renderTimes, submitTimes, ...metrics } = live.metrics;
  $('#metrics').textContent = JSON.stringify(metrics, null, 2);
});
$('#raw').addEventListener('click', () => {
  $('#family-grid').classList.add('raw');
  $('#raw').setAttribute('aria-pressed', 'true');
  $('#registered').setAttribute('aria-pressed', 'false');
});
$('#registered').addEventListener('click', () => {
  $('#family-grid').classList.remove('raw');
  $('#raw').setAttribute('aria-pressed', 'false');
  $('#registered').setAttribute('aria-pressed', 'true');
});
$('#compare-size').addEventListener('change', () => {
  for (const id of ['old-tree', 'new-tree'])
    $('#' + id).style.width = $('#compare-size').value + 'px';
});
$('#compare-restart').addEventListener('click', () => {
  oldScene?.play();
  newScene?.play();
});
const dialogTexts = {
  bible:
    'In FaithPath führt dieser Zugang direkt zur Bibel. Diese isolierte Baumstudie lädt keine App-Routen und verändert keine Daten.',
  journey:
    'Beispiel: Vor einer schwierigen Antwort kurz innehalten. In FaithPath könntest du hier deinen vorhandenen persönlichen Weg fortsetzen. Diese Vorschau speichert nichts.',
  journal:
    'Dein Journal bleibt in der echten FaithPath-App unverändert erreichbar. Diese Designstudie zeigt ausschließlich die Baumdarstellung.',
};
document.querySelectorAll('[data-demo]').forEach((button) =>
  button.addEventListener('click', () => {
    $('#dialog-text').textContent = dialogTexts[button.dataset.demo];
    $('#demo-dialog').showModal();
  }),
);
showContext(
  Object.hasOwn(contexts, query.get('context'))
    ? query.get('context')
    : 'today',
);
showView(
  ['family', 'compare'].includes(query.get('view'))
    ? query.get('view')
    : 'preview',
);
window.OLIVE_A51 = {
  live,
  get old() {
    return oldScene;
  },
  get next() {
    return newScene;
  },
  showView,
  showContext,
  setStage: selectStage,
  get view() {
    return view;
  },
  dispose() {
    live.dispose();
    oldScene?.dispose();
    newScene?.dispose();
  },
};
