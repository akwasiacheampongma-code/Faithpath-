// Unit execution in a Node DOM emulator, NOT a browser, visual, device,
// navigation-history, layout, keyboard or screenreader verification.
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
const modulePath = process.env.OLIVA_DOM_PACKAGE ?? "/tmp/oliva-story-dom-qa/node_modules/linkedom/esm/index.js";
const { parseHTML } = await import(pathToFileURL(modulePath));
const catalog = JSON.parse(await fs.readFile(new URL("./sample-data.json", import.meta.url), "utf8"));
const { window, document } = parseHTML(await fs.readFile(new URL("./index.html", import.meta.url), "utf8"));
let fragment = "#bibliothek";
const location = {};
Object.defineProperty(location, "hash", {
  get: () => fragment,
  set: (value) => { fragment = value; window.dispatchEvent(new window.Event("hashchange")); },
});
window.location = location;
window.scrollTo = () => {};
for (const name of ["focus", "scrollIntoView"]) window.HTMLElement.prototype[name] = function () {};
// linkedom intentionally provides a read-only select.value; the browser has
// a native setter. Model that property for unit execution, not keyboard/layout.
Object.defineProperty(window.HTMLSelectElement.prototype, "value", {
  get() { return [...this.querySelectorAll("option")].find((o) => o.hasAttribute("selected"))?.getAttribute("value") ?? ""; },
  set(value) {
    for (const option of this.querySelectorAll("option")) {
      if (option.getAttribute("value") === String(value)) option.setAttribute("selected", "");
      else option.removeAttribute("selected");
    }
  },
});
window.HTMLElement.prototype.showModal = function () { this.setAttribute("open", ""); };
window.HTMLElement.prototype.close = function () { this.removeAttribute("open"); this.dispatchEvent(new window.Event("close")); };
Object.assign(globalThis, { window, document, location, Node: window.Node, matchMedia: () => ({ matches: false }) });
const fetches = [];
globalThis.fetch = async (url) => {
  fetches.push(url);
  assert.equal(url, "./sample-data.json");
  return { ok: true, json: async () => structuredClone(catalog) };
};
const actions = [];
const click = (element) => {
  assert.ok(element, "Expected an actual UI control");
  element.dispatchEvent(new window.Event("click", { bubbles: true }));
};
const button = (text) => [...document.querySelectorAll("button")].find((node) => node.textContent === text);
await import(new URL("./app.mjs", import.meta.url));
assert.equal(document.querySelector("h1").textContent, "Ein Text.Ein neuer Blick.");
assert.equal(document.querySelectorAll('main a[href^="#geschichte/"]').length, 7);
actions.push("Library renders seven actual source units");
click(button("Psalmen & Briefe"));
assert.equal(document.querySelectorAll(".list-link").length, 1);
assert.equal(document.querySelector(".list-link h3").textContent, "Der HERR ist mein Hirte");
actions.push("Image-free filter changes the displayed real result");
location.hash = "#geschichte/NS-0241/lesen";
assert.equal(document.querySelector("h1").textContent, "In der Krippe");
assert.ok(document.querySelector("figure img").getAttribute("src").endsWith("nativity-large.webp"));
const reader = [...document.querySelectorAll("a")].find((node) => node.textContent.startsWith("Im OLIVA-Bibelreader lesen"));
assert.equal(new URL(reader.href).pathname, "/lesen/LUK");
assert.equal(new URL(reader.href).searchParams.get("to"), "20");
actions.push("Illustrated unit opens the real existing shared-reader URL");
click(button("02Verstehen"));
let radios = [...document.querySelectorAll('input[type="radio"]')];
const question = catalog.stories.find((s) => s.id === "NS-0241").questions[0];
assert.deepEqual(radios.map((node) => node.parentElement.textContent), question.options);
const wrong = (question.correctIndex + 1) % 4;
radios[wrong].checked = true;
radios[wrong].dispatchEvent(new window.Event("change", { bubbles: true }));
assert.equal(button("Antwort ansehen").disabled, false);
click(button("Antwort ansehen"));
assert.equal(document.querySelector(".feedback strong").textContent, "Schau noch einmal in den Text.");
assert.equal(document.querySelector(".feedback .answer").textContent, question.options[question.correctIndex]);
assert.ok(document.querySelector("details").textContent.includes(question.evidence[0].verses[0].text));
actions.push("Original question order, wrong-answer feedback and verbatim Bible evidence work");
click(button("Antwort ändern"));
radios = [...document.querySelectorAll('input[type="radio"]')];
radios[question.correctIndex].checked = true;
radios[question.correctIndex].dispatchEvent(new window.Event("change", { bubbles: true }));
click(button("Antwort ansehen"));
assert.equal(document.querySelector(".feedback strong").textContent, "Ja, das steht im Text.");
actions.push("A preview answer can be changed without changing the source");
click(button("03Gedanken"));
const story = catalog.stories.find((s) => s.id === "NS-0241");
assert.equal(document.querySelector(".reflection-prompt").textContent, story.reflection);
const field = document.querySelector("textarea");
field.value = "  Mein eigener Gedanke.\nDie zweite Zeile bleibt.  ";
field.dispatchEvent(new window.Event("input", { bubbles: true }));
click(button("Gedanken in der Vorschau behalten"));
assert.ok(document.querySelector(".status").textContent.startsWith("Dein Gedanke bleibt"));
assert.equal([...document.querySelectorAll("button")].filter((node) => node.textContent === "Diesen Moment abschließen").length, 1);
location.hash = "#bibliothek";
assert.ok(document.querySelector(".resume"));
location.hash = "#geschichte/NS-0241/gedanken";
assert.equal(document.querySelector("textarea").value, "  Mein eigener Gedanke.\nDie zweite Zeile bleibt.  ");
assert.equal([...document.querySelectorAll("button")].filter((node) => node.textContent === "Diesen Moment abschließen").length, 1);
actions.push("Original reflection and exact temporary words survive preview navigation without duplicate completion controls");
location.hash = "#geschichte/NS-0073/lesen";
assert.equal(document.querySelectorAll("main img").length, 0);
assert.equal(document.querySelector(".type-hero blockquote").textContent, catalog.stories.find((s) => s.id === "NS-0073").verses[0].text);
actions.push("Psalm uses canonical typography without a missing-image placeholder");
click(document.querySelector('[aria-label="Dunklen Modus aktivieren"]'));
assert.equal(document.documentElement.dataset.theme, "dark");
click(document.getElementById("preview-info"));
assert.ok(document.querySelector("dialog").hasAttribute("open"));
assert.equal(document.querySelectorAll(".dialog-links a").length, 3);
actions.push("Theme and the three-view chooser have actual handlers");
assert.deepEqual(fetches, ["./sample-data.json"]);
assert.equal(catalog.stories.find((s) => s.id === "NS-0241").questions[0].correctIndex, question.correctIndex);
const report = {
  passed: true, checkedAt: new Date().toISOString(), actions,
  unitEnvironment: "linkedom Node DOM emulator with explicit no-op focus/scroll, dialog shims and select.value property shim",
  requestsObserved: fetches, actualBrowser: false, actualLayout: false, actualScreenreader: false,
  physicalDevice: false, simulator: false, applicationDataStoreImported: false,
};
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
