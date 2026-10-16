import {navigationGroups} from './navigation-model.js';
const toggle = () => document.getElementById("menu-toggle");
const drawer = () => document.getElementById("main-menu");
let locked = [];
export function closeMenu(restoreFocus = true) {
  const panel = drawer();
  if (!panel || panel.hidden) return;
  panel.hidden = true;
  document.getElementById("menu-overlay").hidden = true;
  toggle()?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  for (const [element, inert] of locked) element.inert = inert;
  locked = [];
  if (restoreFocus) toggle()?.focus({ preventScroll: true });
}
function openMenu() {
  const panel = drawer();
  if (!panel) return;
  panel.hidden = false;
  document.getElementById("menu-overlay").hidden = false;
  toggle().setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
  locked = [...document.querySelectorAll(".page,.primary-nav,.topbar,.skip-link")]
    .map(element => [element, element.inert]);
  for (const [element] of locked) element.inert = true;
  panel.querySelector("button").focus({ preventScroll: true });
}
export function menuMarkup(route) {
  return `<div id="menu-overlay" class="menu-overlay" hidden aria-hidden="true"></div>
    <section id="main-menu" class="menu-drawer navigation-phase4" role="dialog" aria-modal="true" aria-labelledby="menu-title" hidden>
      <div class="menu-heading"><h2 id="menu-title">Menü</h2><button type="button" class="icon-button" data-menu-close aria-label="Menü schließen">×</button></div>
      <nav aria-label="Alle Bereiche">${navigationGroups(route).map(group=>`<div class="menu-task-group"><span class="overline menu-group-label">${group.label}</span>${group.items.map(item=>`<a href="#${item.route}"${item.current?' aria-current="page"':''}>${item.label}</a>`).join('')}</div>`).join('')}</nav>
    </section>`;
}
document.addEventListener("click", event => {
  if (event.target.closest("#menu-toggle")) {
    drawer()?.hidden ? openMenu() : closeMenu();
  } else if (event.target.closest("[data-menu-close],#menu-overlay,#main-menu a")) {
    const anchor=event.target.closest('#main-menu a');
    closeMenu(!anchor);
    if(anchor&&(anchor.hash===location.hash||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey))document.querySelector('main h1')?.focus({preventScroll:true});
  }
});
document.addEventListener("keydown", event => {
  if (!drawer() || drawer().hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu();
  } else if (event.key === "Tab") {
    const controls = [...drawer().querySelectorAll("button,a")];
    const index = controls.indexOf(document.activeElement);
    if (event.shiftKey && index <= 0) {
      event.preventDefault(); controls.at(-1).focus();
    } else if (!event.shiftKey && (index < 0 || index === controls.length - 1)) {
      event.preventDefault(); controls[0].focus();
    }
  }
});
window.addEventListener("hashchange", () => closeMenu(false));
