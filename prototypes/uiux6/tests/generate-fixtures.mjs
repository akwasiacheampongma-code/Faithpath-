/** Build-time projection of the ACTIVE merged content. Never writes original data. */
import fs from "node:fs";
import {
  SOURCE_FILES,
  createRuntimeModel,
} from "../../../src/runtime-model.js";
const model = createRuntimeModel(
  SOURCE_FILES.map((f) => JSON.parse(fs.readFileSync("data/" + f))),
);
const source = model.stories.get("NS-0297");
const story = {
  ...source,
  questions: source.flow_items.map(
    (item) =>
      model.n.get(item.primary_question_id) ||
      model.fp.get(item.primary_question_id).question,
  ),
};
const catalog = {
  story,
  stories: [
    ...model.flow.stories.map((s) => ({
      id: s.story_id,
      kind: "story",
      title: s.title,
      ref: s.ref,
      desc: "",
    })),
    ...model.units
      .filter((x) => x.kind === "chapter-quiz")
      .map((s) => ({
        id: String(s.id),
        kind: "chapter",
        title: s.title,
        ref: s.ref,
        desc: s.desc,
      })),
  ],
};
fs.writeFileSync(
  "prototypes/uiux6/catalog.js",
  "// Exact public projection of the active runtime model; generated, not imported into the app.\nwindow.FaithPathCatalog = " +
    JSON.stringify(catalog, null, 2) +
    ";\n",
);
