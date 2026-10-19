import {KEYS} from './store.js';
import {chapterQuizNavigation} from './chapter-questions.js';
import {journeyView} from './experience-view.js';

/** Existing hash grammar. Decode each path component, never the query as a path.
 * @param {string} hash window.location.hash
 * @returns {{route:string,name:string,query:string,parts:string[],kind:string,key:string|undefined}}
 */
export function parseHashRoute(hash='') {
    const route = hash.slice(1) || "today",
      [name, query = ""] = route.split("?"),
      parts = name.split("/").map(decodeURIComponent),
      [kind, key] = parts;
  return {route,name,query,parts,kind,key};
}

/** Own route dispatch and post-route focus, never persistent data.
 * `views` are the existing app adapters; `getState` is read-only.
 * The only ui mutations are route/token, quiz navigation and return-focus state.
 * Inject platform objects to test route races without starting the whole PWA.
 * @param {{ui:object,getState:Function,views:Object<string,Function>,helpers:object,
 * canonicalStoryForLegacy:Function,go:Function,storage:Storage,
 * document:Document,window:Window,location:Location}} dependencies
 * @returns {() => Promise<void>}
 */
export function createAppRouter({ui,getState,views,helpers,canonicalStoryForLegacy,go,storage,document,window,location}) {
 const {shell,heading,back,button}=helpers;
 const $=selector=>document.querySelector(selector),$$=selector=>[...document.querySelectorAll(selector)];
 return async function render() {
  const token = ++ui.token;
  try {
    const {route,name,query,parts,kind,key}=parseHashRoute(location.hash);
    const previousRoute = ui.route;
    ui.route = route;
    if (kind === "first-seed") await views.firstSeed();
    else if (kind === "merged-story") views.mergedStory(key);
    else if (kind === "question") views.sourceQuestion(key);
    else if (kind === "today") views.home();
    else if (kind === "guidance") views.guidance();
    else if (kind === "topic") views.topic(key);
    else if (kind === "bible") views.bible();
    else if (kind === "bible-journey") {
      const view=journeyView(getState(),ui.books,key);if(!view)return views.notFound();shell(`${back(key?"Deine Bibelreise":"Bibel",key?"bible-journey":"bible")}${heading("Bibelreise",view.title)}${view.body}`,"bible","journey-page editorial-page depth-page");if(!key)views.fillJourneyScripture($("#main"));
    }
    else if (kind === "chapters") views.chapters(key);
    else if (kind === "chapter-quizzes") views.chapterCollection(key);
    else if (kind === "read") {
      shell(
        `${heading("Bibel", "Der Text wird geöffnet.")}<p role="status">Ein Moment …</p>`,
        "bible",
        "reader-page",
      );
      await views.reader(parts, new URLSearchParams(query), token);
    } else if (kind === "marks") views.marks();
    else if (kind === "mark") views.markDetail(key);
    else if (kind === "discover") views.discover();
    else if (kind === "story") views.story(key);
    else if (kind === "quizzes") views.quizIndex();
    else if (kind === "quiz") {
      const x = ui.stories.find((x) => String(x.id) === key);
      if (!x) return views.notFound();
      const canonical=canonicalStoryForLegacy(x);
      if(canonical){go("question/"+canonical.flow_items[0].primary_question_id);return;}
      const params = new URLSearchParams(query), returnRoute = params.get("return") || "";
      if (!ui.quiz || String(ui.quiz.story.id) !== key || previousRoute.split("?")[0] !== name || ui.quiz.returnRoute !== returnRoute)
        ui.quiz = {story:x, index:0, answer:null, returnRoute};
      ui.quiz.navigation = chapterQuizNavigation(x, ui.books, getState().translation, returnRoute);
      if (params.get("complete") === "1" && getState().quiz[x.id]?.done) views.chapterQuizComplete(x, ui.quiz.navigation);
      else views.quiz();
    } else if (kind === "paths") views.paths();
    else if (kind === "path") views.path(key);
    else if (kind === "tree") views.tree();
    else if (kind === "plans") views.plans();
    else if (kind === "plan" || kind === "guide") views.plan(kind, key);
    else if (kind === "journal") views.journal();
    else if (["entry", "reflection", "review"].includes(kind)) views.entry(key, kind);
    else if (kind === "history") views.history();
    else if (kind === "reviews") views.reviews();
    else if (kind === "more") views.more();
    else if (kind === "content-status") views.contentStatus();
    else if (kind === "licenses") views.licenses();
    else if (kind === "compose") {
      views.journal();
      let draft;
      try {
        draft = JSON.parse(storage.getItem(KEYS.draft));
      } catch {}
      if (draft?.type && draft.values)
        views.openForm(draft.type, draft.args, draft.values);
      else views.openForm("entry");
    } else views.notFound();
    if (token !== ui.token) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    $("h1")?.focus({ preventScroll: true });
    if(kind==="journal"&&ui.journalReturn){const previous=ui.journalReturn;ui.journalReturn=null;const target=$$("[data-journal-id]").find(el=>el.dataset.journalId===previous.id)?.querySelector("h3 a");if(target){target.focus({preventScroll:true});window.scrollTo({top:previous.scroll,behavior:"instant"});}}
    if(kind==="path"&&new URLSearchParams(query).has("step")){
      const stepId=new URLSearchParams(query).get("step"),input=$$(".path-step input").find(el=>el.dataset.id===stepId);
      if(input){const disclosure=input.closest("details");if(disclosure)disclosure.open=true;input.focus();input.scrollIntoView({block:"center",behavior:"instant"});}
    }
    if(kind==="path"&&new URLSearchParams(query).get("section")==="story"){
      const story=$(".path-story");if(story){story.focus();story.scrollIntoView({block:"start",behavior:"instant"});}
    }
    if(kind==="merged-story"&&new URLSearchParams(query).get("reflection")==="1"){
      const invitation=$(".reflection-invite");if(invitation){invitation.tabIndex=-1;invitation.focus();invitation.scrollIntoView({block:"start",behavior:"instant"});}
    }
  } catch (err) {
    if (token === ui.token)
      shell(
        `${back("Heute", "today")}${heading("Das hat nicht geklappt", "Dieser Inhalt ist gerade nicht verfügbar.", err.message)}${button("Erneut versuchen", "retry", {}, "button primary")}`,
      );
  }
}
}
