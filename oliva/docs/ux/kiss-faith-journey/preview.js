const params = new URLSearchParams(location.search);
const phone = document.querySelector("#phone");
const content = document.querySelector("#content");
const screens = new Map([...content.querySelectorAll("[data-screen]")].map((section) => [section.dataset.screen, section]));
const tabs = [...document.querySelectorAll(".tabs button")];
const noteText = document.querySelector("#note-text");
const linkChoice = document.querySelector("#link-choice");
const sourceLink = document.querySelector("#source-link");
const editorBack = document.querySelector("#editor-back");
const writeAction = document.querySelector("#reflect-write");
const noteCaption = document.querySelector("#note-caption");
const treeImages = [...document.querySelectorAll(".tree-image")];
const themeControls = [...document.querySelectorAll("[data-theme-toggle]")];
const initialSample = "Ein stiller Moment\n\nHeute ist mir das Wort von der Stille geblieben.";
const questions = {
  bible: {
    label: "Zum Bibelabschnitt · Wer ist Jesus?",
    value: "Was bewegt dich an der Frage: „Kümmert es dich nicht?“",
  },
  path: {
    label: "Wer ist Jesus? · Wenn der Sturm still wird",
    value: "Was bewegt dich an der Frage: „Kümmert es dich nicht?“",
  },
  story: {
    label: "Schweig und verstumme · Original-Reflexionsfrage",
    value: "Meister, ist dir egal, dass wir untergehen? Der Schlaf ist nicht Gleichgültigkeit. Wo weckst du ihn — statt still zu werden?",
  },
};
const links = {
  bible: { label: "Markus 4,35–41", target: "reader" },
  daily: { label: "Psalm 23,1", target: "daily" },
  path: { label: "Wer ist Jesus? · Reflexionsfrage", target: "reflection" },
  story: { label: "Schweig und verstumme · Reflexionsfrage", target: "reflection" },
};
const navByView = {
  today: "today", bible: "bible", reader: "bible", daily: "bible", reflection: "bible",
  editor: "collection", notes: "collection", garden: "garden", moment: "garden",
  collection: "collection", paths: "paths",
};
let view = null;
let profile = params.get("profile") === "returning";
let dark = params.get("theme") === "dark";
let reflection = "bible";
let link = "bible";
let exampleNote = { text: initialSample, link: "bible" };
let readerScroll = null;

if (params.has("capture")) document.body.dataset.capture = "";

function updateProfile() {
  const root = screens.get("today");
  phone.dataset.profile = profile ? "returning" : "guest";
  document.querySelector("#profile").setAttribute("aria-pressed", String(profile));
  root.querySelector(".greeting").textContent = profile ? "Schön, dass du wieder da bist, Mara." : "Schön, dass du da bist.";
  root.querySelector("#read-action").textContent = profile ? "In der Bibel weiterlesen" : "Jetzt Bibel lesen";
  root.querySelector("#hero-reference").textContent = profile ? "Markus 4,35–41 · zuletzt Vers 38" : "Markus 4,35–41";
  document.querySelector("#stage-name").textContent = profile ? "Wachsender Olivenbaum" : "Samen";
  for (const img of treeImages) {
    img.src = profile ? "../../../assets/a51/stage-4-384-7fdbd6abfc70.webp" : "../../../assets/a51/stage-1-384-938d65fabbea.webp";
    img.alt = profile ? "Dein Olivenbaum im Stadium Wachsender Olivenbaum" : "Dein Olivenbaum im Stadium Samen";
  }
}

function updateTheme() {
  phone.dataset.theme = dark ? "dark" : "light";
  for (const control of themeControls) control.setAttribute("aria-pressed", String(dark));
}

function updateLink(value) {
  link = value === "none" || links[value] ? value : "none";
  linkChoice.value = link;
  const detail = links[link];
  sourceLink.hidden = !detail;
  if (detail) {
    sourceLink.textContent = detail.label + " →";
    sourceLink.dataset.go = detail.target;
    sourceLink.dataset.context = link;
  }
}

function updateReflection(value) {
  reflection = questions[value] ? value : "bible";
  document.querySelector("#question-context").textContent = questions[reflection].label;
  document.querySelector("#question").textContent = questions[reflection].value;
  writeAction.dataset.link = reflection;
}

function updateNotes() {
  document.querySelector("#note-title").textContent = exampleNote.text.split(/\r?\n/, 1)[0].trim() || "Unbenannte Notiz";
  document.querySelector("#note-details").textContent = links[exampleNote.link]?.label ?? "";
}

function show(target, focus = true) {
  if (!screens.has(target)) target = "today";
  if (view === "reader" && target !== "reader") readerScroll = content.scrollTop;
  const last = view;
  view = target;
  for (const [name, section] of screens) section.hidden = name !== view;
  for (const tab of tabs) {
    if (tab.dataset.go === navByView[view]) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
  const intro = view.startsWith("intro-");
  phone.dataset.intro = String(intro);
  phone.querySelector("button.brand").hidden = intro;
  phone.querySelector(".intro-brand").hidden = !intro;
  if (view === "notes") updateNotes();
  content.scrollTop = 0;
  const heading = screens.get(view).querySelector("h1");
  if (focus) {
    heading.tabIndex = -1;
    if (view === "editor") noteText.focus({ preventScroll: true });
    else heading.focus({ preventScroll: true });
  }
  if (view === "reader") {
    if (last === "reflection" && readerScroll !== null) content.scrollTop = readerScroll;
    else if (last === "today" && profile) document.querySelector("#verse-in-view").scrollIntoView({ block: "start" });
  }
}

document.addEventListener("click", (event) => {
  const control = event.target.closest("button[data-go]");
  if (!control) return;
  const target = control.dataset.go;
  if (target === "editor") {
    const readPrevious = control.dataset.sample === "true";
    noteText.value = readPrevious ? exampleNote.text : "";
    noteCaption.textContent = readPrevious ? "Beispielnotiz in dieser Vorschau." : "Die erste Zeile wird zum Titel.";
    editorBack.dataset.go = view ?? "notes";
    updateLink(readPrevious ? exampleNote.link : control.dataset.link ?? "bible");
  }
  if (target === "reflection" && control.dataset.context) updateReflection(control.dataset.context);
  else if (target === "reflection" && view === "reader") updateReflection("bible");
  show(target);
});
document.querySelector("#profile").addEventListener("click", () => {
  profile = !profile;
  updateProfile();
});
for (const control of themeControls) {
  control.addEventListener("click", () => {
    dark = !dark;
    updateTheme();
  });
}
noteText.addEventListener("input", () => {
  if (noteText.value.trim()) exampleNote = { text: noteText.value, link };
  noteCaption.textContent = "Beispielnotiz in diesem Browserfenster.";
});
linkChoice.addEventListener("change", () => {
  updateLink(linkChoice.value);
  if (noteText.value.trim()) exampleNote = { text: noteText.value, link };
});
updateProfile();
updateTheme();
updateReflection("bible");
updateLink("bible");
show(params.get("view") ?? "today", false);
