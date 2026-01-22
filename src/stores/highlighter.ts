import mdc from "@shikijs/langs/mdc";
import vue from "@shikijs/langs/vue";
import lightTheme from "@shikijs/themes/github-light-default";
import darkTheme from "@shikijs/themes/nord";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import options from "shiki/wasm";

const engine = createOnigurumaEngine(options),
  markdown = "mdc",
  langAlias = { markdown },
  langs = [vue, mdc],
  themes = [lightTheme, darkTheme];

export default await createHighlighterCore({
  engine,
  langAlias,
  langs,
  themes,
});
