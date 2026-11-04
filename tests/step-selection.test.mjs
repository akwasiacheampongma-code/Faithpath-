import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseStepText, writeOwnStep } from '../src/step-selection.js';

const first = 'Heute zuerst zuhören.',
  second = 'Eine Frage stellen.';
test('a proposal fills an empty editor directly and another proposal replaces only the untouched proposal', () => {
  const a = chooseStepText({ text: '' }, first);
  assert.equal(a.text, first);
  assert.equal(a.needsConfirmation, false);
  const b = chooseStepText(a, second);
  assert.equal(b.text, second);
  assert.equal(b.needsConfirmation, false);
});
test('personal words remain untouched until replacement is expressly confirmed and remain recoverable afterwards', () => {
  const original = {
    text: 'Meine eigenen Worte. Jedes Wort bleibt.',
    suggestion: '',
    ownText: '',
  };
  const pending = chooseStepText(original, first);
  assert.equal(pending.needsConfirmation, true);
  assert.equal(pending.text, original.text);
  const accepted = chooseStepText(original, first, { confirmed: true });
  assert.equal(accepted.text, first);
  assert.equal(accepted.ownText, original.text);
  const changed = chooseStepText(accepted, second);
  assert.equal(changed.needsConfirmation, false);
  assert.equal(changed.ownText, original.text);
  const restored = chooseStepText(changed, changed.ownText, { own: true });
  assert.equal(restored.text, original.text);
  assert.equal(restored.suggestion, '');
  assert.equal(chooseStepText(restored, first).needsConfirmation, true);
});
test('typing exactly a catalog phrase is still personal input and does not authorize automatic replacement', () => {
  const state = writeOwnStep(chooseStepText({ text: '' }, first), first);
  assert.equal(state.suggestion, '');
  assert.equal(state.ownText, first);
  assert.equal(chooseStepText(state, second).needsConfirmation, true);
});
test('editing a suggestion protects the latest personal wording across repeated proposal changes', () => {
  const edited = writeOwnStep(
    chooseStepText({ text: '' }, first),
    'Morgen höre ich meiner Schwester zu.',
  );
  const a = chooseStepText(edited, second, { confirmed: true }),
    b = chooseStepText(a, first);
  assert.equal(a.ownText, 'Morgen höre ich meiner Schwester zu.');
  assert.equal(b.ownText, a.ownText);
});
test('choosing identical text is a no-op and does not relabel personal wording as a proposal', () => {
  const state = writeOwnStep({ text: '' }, first),
    next = chooseStepText(state, first);
  assert.equal(next.needsConfirmation, false);
  assert.equal(next.suggestion, '');
  assert.equal(chooseStepText(next, second).needsConfirmation, true);
});
test('recovering a legacy personal candidate retains the current personal words for restoration', () => {
  const own = {
    text: 'Meine bisherigen Worte.',
    suggestion: '',
    ownText: 'Meine bisherigen Worte.',
  };
  const recovered = chooseStepText(own, 'Mein früherer bearbeiteter Entwurf.', {
    confirmed: true,
    own: true,
  });
  assert.equal(recovered.text, 'Mein früherer bearbeiteter Entwurf.');
  assert.equal(recovered.suggestion, '');
  assert.equal(recovered.ownText, 'Meine bisherigen Worte.');
});
