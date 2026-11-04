/** Pure editor transitions. Draft strings, never path/progress data. */
export function writeOwnStep(state, text) {
  return {
    ...state,
    text,
    suggestion: '',
    ownText: text,
    needsConfirmation: false,
  };
}
export function chooseStepText(
  state,
  proposed,
  { confirmed = false, own = false } = {},
) {
  const { text = '', suggestion = '', ownText = '' } = state;
  if (text === proposed) return { ...state, needsConfirmation: false };
  const personal = Boolean(text.trim() && text !== suggestion);
  if (personal && !confirmed) return { ...state, needsConfirmation: true };
  return {
    text: proposed,
    suggestion: own ? '' : proposed,
    ownText: personal ? text : ownText || (own ? proposed : ''),
    needsConfirmation: false,
  };
}
