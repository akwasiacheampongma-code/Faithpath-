import { LIFE_TOPICS } from './content.js';
import { sameRef } from './domain.js';
import {
  stepSuggestions,
  SENTENCE_STARTS,
  smallerStep,
} from './step-suggestions.js';
import { chooseStepText, writeOwnStep } from './step-selection.js';
import { escapeHtml as e } from './view-html.js';

const kinds = ['Ganz klein anfangen', 'Etwas ausprobieren', 'Erst nachdenken'];
const draftFields = ['stepSuggestion', 'stepOwnText', 'stepCandidate'];
const applying = new WeakSet();
const string = (value) => (typeof value === 'string' ? value : '');

/** Historical paths have no topic ID. Use only an unambiguous original verse
 * and category, never somebody's title, concern or journal prose. */
export function topicForStep(path, preferred = '') {
  if (LIFE_TOPICS.some((topic) => topic.id === preferred)) return preferred;
  const ref = path.links?.find(
    (link) => link.kind === 'verse' && link.ref,
  )?.ref;
  if (!ref) return '';
  const matches = LIFE_TOPICS.filter(
    (topic) =>
      topic.category === path.category &&
      sameRef({ ...topic.refs[0], translation: ref.translation || 'otb' }, ref),
  );
  return matches.length === 1 ? matches[0].id : '';
}

const proposalButton = (label, text, action = 'guided-candidate') =>
  `<button type="button" class="button quiet step-candidate" data-action="${action}" data-text="${e(text)}">${e(label)}</button>`;
function options({ topic, category, used, selected = '' }) {
  return stepSuggestions({ topic, category, used })
    .map(
      (choice) =>
        `<button type="button" class="step-choice" data-action="guided-candidate" data-text="${e(choice.text)}" aria-pressed="${selected === choice.text}"><span class="step-option-kind">${kinds[Number(choice.id.slice(-1))]}</span><span>${e(choice.text.replace(/^Mein kleiner Versuch: /, ''))}</span></button>`,
    )
    .join('');
}

/** One shared editor. No new storage key, transaction or persistent data model. */
export function renderStepHelp({
  topic = '',
  category = 'sonstiges',
  used = [],
  field = 'text',
  scope = 'form',
  value = '',
  candidate = '',
  suggestion = '',
  ownText = '',
  heading = true,
} = {}) {
  value = string(value);
  suggestion = string(suggestion);
  ownText = string(ownText);
  if (value !== suggestion) suggestion = '';
  if (!suggestion && !ownText) ownText = value;
  const id = scope === 'seed' ? 'seed-next' : 'f-' + field;
  return `<section class="step-help" data-step-help data-field="${e(field)}" data-scope="${e(scope)}" data-topic="${e(topic)}" data-category="${e(category)}" data-used="${e(JSON.stringify(used))}">
    ${heading ? '<h2>Was möchtest du ausprobieren?</h2>' : ''}
    <div data-guided-options class="step-choices">${options({ topic, category, used, selected: suggestion })}</div>
    <div data-guided-confirm hidden role="group" aria-label="Eigene Worte schützen"><p>Deine eigenen Worte stehen bereits im Feld. Möchtest du diesen Vorschlag stattdessen verwenden? Deine Worte bleiben unter „Weitere Hilfe“ erhalten.</p><div class="actions"><button type="button" class="button quiet" data-action="guided-keep">Meine Worte behalten</button><button type="button" class="button quiet" data-action="guided-replace">Vorschlag verwenden</button></div></div>
    <div class="field${scope === 'seed' ? ' seed-field' : ''}"><label for="${e(id)}">Dein Schritt</label><textarea id="${e(id)}" name="${e(field)}" rows="3" placeholder="Oder schreibe, was du selbst ausprobieren möchtest.">${e(value)}</textarea></div>
    <details class="step-more-help"><summary>${candidate ? 'Weitere Hilfe · frühere Anregung vorhanden' : 'Weitere Hilfe'}</summary>
      <div data-guided-own-saved${ownText && ownText !== value ? '' : ' hidden'}><p>Deine eigenen Worte</p><blockquote data-guided-own-copy>${e(ownText)}</blockquote><button type="button" class="text-button" data-action="guided-restore-own">Meine Worte wiederverwenden</button></div>
      ${candidate ? `<div><p>Frühere Anregung aus deinem Entwurf</p><blockquote>${e(candidate)}</blockquote>${proposalButton('Diese Anregung verwenden', candidate, 'guided-legacy')}</div>` : ''}
      <p>Satzanfänge, wenn du sie brauchst:</p><div class="actions">${SENTENCE_STARTS.map((text) => proposalButton(text, text)).join('')}</div>
      <button type="button" class="text-button" data-action="guided-smaller">Schritt kleiner machen</button>
    </details>
    <input type="hidden" name="stepSuggestion" value="${e(suggestion)}"><input type="hidden" name="stepOwnText" value="${e(ownText)}"><input type="hidden" name="stepCandidate" value="${e(candidate)}">${scope === 'form' ? `<input type="hidden" name="guidedTopic" value="${e(topic)}">` : ''}
  </section>`;
}

const targetFor = (help) => help.querySelector('textarea');
const metadata = (help) =>
  Object.fromEntries(
    draftFields.map((name) => [
      name,
      help.querySelector(`[name="${name}"]`).value,
    ]),
  );
const stateFor = (help) => ({
  text: targetFor(help).value,
  suggestion: metadata(help).stepSuggestion,
  ownText: metadata(help).stepOwnText,
});
function refresh(help) {
  const state = stateFor(help);
  help.querySelector('[data-guided-own-saved]').hidden =
    !state.ownText || state.ownText === state.text;
  help.querySelector('[data-guided-own-copy]').textContent = state.ownText;
  for (const button of help.querySelectorAll('.step-choice'))
    button.setAttribute(
      'aria-pressed',
      String(
        Boolean(state.suggestion) &&
          state.text === state.suggestion &&
          button.dataset.text === state.text,
      ),
    );
}

function focusEditor(target) {
  target.focus({ preventScroll: true });
  // After choosing, the task is editing/saving. Bring that area into view,
  // including on short screens where the suggestions sit above the field.
  target.scrollIntoView({ block: 'center', behavior: 'instant' });
}

/** Run before the existing draft handler. Programmatic selection dispatches the
 * same input event, without pretending somebody typed personal words. */
export function stepHelpInput(target) {
  const help = target.closest('[data-step-help]');
  if (!help || target !== targetFor(help)) return null;
  if (!applying.has(target)) {
    const state = writeOwnStep(stateFor(help), target.value);
    help.querySelector('[name="stepSuggestion"]').value = state.suggestion;
    help.querySelector('[name="stepOwnText"]').value = state.ownText;
    help.querySelector('[data-guided-confirm]').hidden = true;
    delete help.dataset.pending;
  }
  refresh(help);
  return metadata(help);
}

/** Category changes replace suggestions only, never the live editor. */
export function updateStepHelpCategory(help, category) {
  help.dataset.category = category;
  help.dataset.topic = '';
  const savedTopic = help.querySelector('[name="guidedTopic"]');
  if (savedTopic) savedTopic.value = '';
  help.querySelector('[data-guided-options]').innerHTML = options({
    category,
    topic: '',
    used: JSON.parse(help.dataset.used || '[]'),
  });
  help.querySelector('[data-guided-confirm]').hidden = true;
  delete help.dataset.pending;
  refresh(help);
}

export function handleStepHelp(action, button) {
  const help = button.closest('[data-step-help]');
  if (!help) return false;
  const target = targetFor(help),
    confirm = help.querySelector('[data-guided-confirm]');
  if (action === 'guided-keep') {
    confirm.hidden = true;
    delete help.dataset.pending;
    focusEditor(target);
    return true;
  }
  let proposed,
    own = false;
  if (action === 'guided-replace') {
    if (help.dataset.pending === undefined) return false;
    proposed = help.dataset.pending;
    own = help.dataset.pendingOwn === 'true';
  } else if (action === 'guided-restore-own') {
    proposed = stateFor(help).ownText;
    own = true;
  } else if (action === 'guided-legacy') {
    proposed = button.dataset.text;
    own = true;
  } else if (action === 'guided-smaller') proposed = smallerStep(help.dataset);
  else if (action === 'guided-candidate') proposed = button.dataset.text;
  else return false;
  const result = chooseStepText(stateFor(help), proposed, {
    confirmed: action === 'guided-replace',
    own,
  });
  if (result.needsConfirmation) {
    help.dataset.pending = proposed;
    help.dataset.pendingOwn = String(own);
    confirm.hidden = false;
    confirm.querySelector('button').focus();
    return true;
  }
  target.value = result.text;
  help.querySelector('[name="stepSuggestion"]').value = result.suggestion || '';
  help.querySelector('[name="stepOwnText"]').value = result.ownText || '';
  confirm.hidden = true;
  delete help.dataset.pending;
  applying.add(target);
  try {
    target.dispatchEvent(new Event('input', { bubbles: true }));
  } finally {
    applying.delete(target);
  }
  refresh(help);
  focusEditor(target);
  return true;
}
