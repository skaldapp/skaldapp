import mdc from "@shikijs/langs/mdc";
import vue from "@shikijs/langs/vue";
import lightTheme from "@shikijs/themes/github-light-default";
import darkTheme from "@shikijs/themes/nord";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import options from "shiki/wasm";

export default await createHighlighterCore({
  engine: createOnigurumaEngine(options),
  langs: [vue, mdc],
  themes: [lightTheme, darkTheme],
});
