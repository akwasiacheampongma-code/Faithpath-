/** Recompose the existing form; never interprets values or owns draft state.
 * Submit stays inside its original form and keeps its exact accessible label. */
export function writingDialog(content, header) {
  const submit = content.match(
    /<button class="button primary full" type="submit">[\s\S]*?<\/button>/,
  )?.[0];
  if (!submit) return header + content;
  return content
    .replace(submit, "")
    .replace(
      '<form id="editor-form">',
      `<form id="editor-form">${header.replace('<div class="dialog-header-actions">', `<div class="dialog-header-actions">${submit}`)}`,
    );
}
