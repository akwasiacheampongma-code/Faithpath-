/** Transient visual preferences only. Never reads/writes personal storage.
 * The authoritative app still owns route, verse actions, drafts and saving. */
let scale = 1;
function setReadingFocus(on) {
  document.body.classList.toggle("verbunden-reading-focus", on);
  document.querySelectorAll("[data-verbunden-action=focus]").forEach(button =>
    button.setAttribute("aria-pressed", String(on)));
  // The focus action lives inside closed details. Return to its visible summary,
  // never to a hidden descendant or the document body.
  document.querySelector(on ? ".reading-focus-exit button" : ".reading-settings summary")
    ?.focus({preventScroll: true});
  window.dispatchEvent(new Event("faithpath-reader-layout"));
}

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-verbunden-action]");
  if (!control) return;
  const action = control.dataset.verbundenAction;
  const settings = document.querySelector(".reading-settings");
  if (settings) settings.open = false;
  if (action === "focus") {
    setReadingFocus(!document.body.classList.contains("verbunden-reading-focus"));
  } else if (action === "larger" || action === "smaller") {
    scale = Math.max(
      0.9,
      Math.min(
        1.6,
        Math.round((scale + (action === "larger" ? 0.1 : -0.1)) * 10) / 10,
      ),
    );
    document.documentElement.style.setProperty("--reader-scale", scale);
    settings?.querySelector("summary")?.focus({ preventScroll: true });
    window.dispatchEvent(new Event("faithpath-reader-layout"));
  }
});
document.addEventListener("keydown", (event) => {
  if (
    event.target.matches(".verse[role=button]") &&
    ["Enter", " "].includes(event.key)
  ) {
    event.preventDefault();
    event.target.click();
  }
  if (
    event.key === "Escape" &&
    !document.querySelector("dialog")?.open &&
    document.body.classList.contains("verbunden-reading-focus")
  ) {
    setReadingFocus(false);
  }
});
window.addEventListener("hashchange", () =>
  document.body.classList.remove("verbunden-reading-focus"),
);

export function prepareWritingArea(root = document) {
  const field = root.querySelector(
    ".writing-dialog textarea[name=text],textarea[name=text]",
  );
  if (!field || !field.closest(".writing-dialog")) return;
  const dialog = field.closest("dialog");
  const header = dialog.querySelector(".dialog-top");
  const headerBottom = header.getBoundingClientRect().bottom;
  dialog.style.scrollPaddingTop = Math.ceil(
    headerBottom - dialog.getBoundingClientRect().top + 16,
  ) + "px";
  // Let the native textarea keep a long draft's caret visible. An unbounded
  // auto-height field can grow beyond 19,000px and hide its last line behind the
  // sticky header when the viewport is short or text is enlarged.
  const line = parseFloat(getComputedStyle(field).lineHeight);
  const available = Math.max(line * 2, Math.min(600, innerHeight - headerBottom - 24));
  field.style.minHeight = Math.min(180, available) + "px";
  field.style.height = "auto";
  field.style.height = Math.min(Math.max(180, field.scrollHeight + 2), available) + "px";
  if (document.activeElement === field)
    field.scrollIntoView({block: "nearest", behavior: "instant"});
}
document.addEventListener("input", (event) => {
  if (event.target.matches(".writing-dialog textarea[name=text]"))
    prepareWritingArea(event.target.closest("dialog"));
});
