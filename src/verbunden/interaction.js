/** Transient visual preferences only. Never reads/writes personal storage.
 * The authoritative app still owns route, verse actions, drafts and saving. */
let scale = 1;
document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-verbunden-action]");
  if (!control) return;
  const action = control.dataset.verbundenAction;
  const settings = document.querySelector(".reading-settings");
  if (settings) settings.open = false;
  if (action === "focus") {
    const on = document.body.classList.toggle("verbunden-reading-focus");
    document
      .querySelectorAll("[data-verbunden-action=focus]")
      .forEach((b) => b.setAttribute("aria-pressed", String(on)));
    document
      .querySelector(
        on
          ? ".reading-focus-exit button"
          : ".reading-tools [data-verbunden-action=focus]",
      )
      ?.focus({ preventScroll: true });
    window.dispatchEvent(new Event("faithpath-reader-layout"));
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
    document.body.classList.remove("verbunden-reading-focus");
    const button = document.querySelector(
      ".reading-tools [data-verbunden-action=focus]",
    );
    button?.setAttribute("aria-pressed", "false");
    button?.focus({ preventScroll: true });
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
  field.style.height = "auto";
  field.style.height = Math.max(300, field.scrollHeight + 2) + "px";
}
document.addEventListener("input", (event) => {
  if (event.target.matches(".writing-dialog textarea[name=text]"))
    prepareWritingArea(event.target.closest("dialog"));
});
