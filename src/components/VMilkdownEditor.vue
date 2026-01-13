<template lang="pug">
Milkdown
</template>

<script setup lang="ts">
import type { Ctx } from "@milkdown/kit/ctx";
import type { LanguageModel } from "ai";
import type { EditorView } from "prosemirror-view";

import { createMistral } from "@ai-sdk/mistral";
import { Crepe } from "@milkdown/crepe";
import darkTheme from "@milkdown/crepe/theme/frame-dark.css?inline";
import lightTheme from "@milkdown/crepe/theme/frame.css?inline";
import { parserCtx, serializerCtx } from "@milkdown/kit/core";
import { htmlAttr, htmlSchema } from "@milkdown/kit/preset/commonmark";
import { cloneTr } from "@milkdown/kit/prose";
import { DOMParser, DOMSerializer } from "@milkdown/kit/prose/model";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import { $prose } from "@milkdown/kit/utils";
import { emoji } from "@milkdown/plugin-emoji";
import { replaceAll } from "@milkdown/utils";
import { Milkdown, useEditor } from "@milkdown/vue";
import { useStyleTag } from "@vueuse/core";
import { generateText } from "ai";
import { split } from "hexo-front-matter";
import { storeToRefs } from "pinia";
import { debounce, Lang, useQuasar } from "quasar";
import { cancel, immediate, persistent, second } from "stores/defaults";
import { ioStore } from "stores/io";
import { highlighter, useMainStore } from "stores/main";
import { onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";

const $q = useQuasar(),
  dark = "nord",
  deco = DecorationSet.empty,
  key = new PluginKey("MilkdownCopilot"),
  lang = "mdc",
  light = "github-light-default",
  mainStore = useMainStore(),
  message = "",
  system =
    // "You are an intelligent autocomplete engine. If given a partial phrase, return a smart suggestion that completes it meaningfully; otherwise, if the given phrase ends with sentence-ending punctuation (., !, ?), start a new one. Output only the raw text to be inserted at the cursor location without any additional text, comments, or content before or after the cursor.",
    `
**Role:** You are an advanced language model specializing in coherent text generation and contextual completion.

**Task:**
1. If provided with an incomplete sentence, complete it logically, grammatically, and contextually while maintaining the original tone and style.
2. If no text is provided or a new sentence is requested, generate an original, contextually appropriate sentence that flows naturally from the conversation or topic.

**Instructions:**
- Analyze the context, tone, and style of any provided text fragment
- Maintain the same language as the input text unless otherwise specified
- In case the language cannot be determined, use the '${Lang.getLocale() ?? "en-US"}' locale
- Ensure grammatical correctness and semantic coherence in all completions
- Maintain consistency with the established voice and register
- For new sentence generation, consider the broader context of the conversation or subject matter
- Avoid introducing irrelevant information or abrupt topic changes
- Prioritize clarity, precision, and natural language flow
- Adapt to formal or informal tone based on input context

**Output Format:**
- For completions: Provide only the completed sentence without additional commentary
- For new sentences: Generate a single, well-formed sentence that advances the discourse appropriately

**Constraints:**
- Do not alter the core meaning of incomplete sentences
- Maintain factual accuracy where applicable
- Respect stylistic preferences of the original text
- Avoid repetitive or redundant phrasing

**Example Usage:**
Input (completion): "The research methodology employed "
Output: "a mixed-methods approach combining quantitative surveys with qualitative interviews."

Input (new sentence): [empty or explicit request for new sentence]
Output: "This approach yielded statistically significant results across all experimental conditions."
`,
  themes = { dark, light },
  urls = new Map(),
  yaml = "---",
  { apiKey, selected } = storeToRefs(mainStore),
  { css } = useStyleTag($q.dark.isActive ? darkTheme : lightTheme),
  { getModel } = mainStore,
  { getObjectBlob, headObject, putObject } = ioStore,
  { t } = useI18n();

let front = "",
  model: LanguageModel | undefined,
  textModel = await getModel(selected.value);

const clearUrls = () => {
    [...urls.values()].forEach((url) => {
      URL.revokeObjectURL(url);
    });
    urls.clear();
  },
  onUpload = async (file: File) => {
    const { name, type } = file;
    const filePath = `uploads/${name}`,
      message = t("The file is already exist, do you want to replace it?"),
      title = t("Confirm");

    try {
      await headObject(filePath);
      await new Promise((resolve, reject) => {
        $q.dialog({ cancel, message, persistent, title })
          .onOk(() => {
            reject(new Error());
          })
          .onCancel(() => {
            resolve(undefined);
          });
      });
      urls.set(filePath, URL.createObjectURL(await getObjectBlob(filePath)));
    } catch {
      void putObject(filePath, new Uint8Array(await file.arrayBuffer()), type);
      urls.set(filePath, URL.createObjectURL(file));
    }
    return filePath;
  },
  proxyDomURL = async (url: string) => {
    if (!urls.has(url) && !URL.canParse(url)) {
      const image = await getObjectBlob(url);
      if (image.size) urls.set(url, URL.createObjectURL(image));
    }
    return urls.get(url) ?? url;
  },
  featureConfigs = {
    [Crepe.Feature.ImageBlock]: { onUpload, proxyDomURL },
  },
  getHint = async ({ get }: Ctx, view: EditorView) => {
    const {
      dispatch,
      state: {
        schema: { topNodeType },
        tr: {
          doc,
          selection: { from },
        },
      },
    } = view;
    const { content } = doc.slice(0, from);
    const node = topNodeType.createAndFill(undefined, content);
    if (node && model) {
      const prompt = get(serializerCtx)(node);
      const { text } = await generateText({ model, prompt, system });
      dispatch(cloneTr(view.state.tr).setMeta(key, text));
    }
  },
  getValue = () => {
    const value = textModel.getValue(),
      { content, data, prefixSeparator, separator } = split(value);
    if (data && separator === yaml && prefixSeparator) {
      front = data;
      return content;
    } else {
      front = "";
      return value;
    }
  },
  init = () => ({ deco, message }),
  { get } = useEditor((root) => {
    const defaultValue = getValue(),
      crepe = new Crepe({ defaultValue, featureConfigs, root });

    void crepe.editor.remove(htmlSchema);

    crepe
      .on((api) => {
        api.markdownUpdated((ctx, markdown) => {
          textModel.setValue(
            front
              ? `${yaml}
${front}
${yaml}

${markdown}`
              : markdown,
          );
        });
      })
      .editor.use(emoji)
      .use(
        htmlSchema.extendSchema((prev) => (ctx) => ({
          ...prev(ctx),
          toDOM: (node) => {
            const div = document.createElement("div");
            div.innerHTML = highlighter.codeToHtml(node.attrs.value, {
              lang,
              themes,
            });
            div.classList = "rounded-borders q-card--bordered";
            return [
              "span",
              {
                ...ctx.get(htmlAttr.key)(node),
                "data-type": "html",
                "data-value": node.attrs.value,
              },
              div,
            ];
          },
        })),
      )
      .use(
        $prose(
          (ctx) =>
            new Plugin({
              key,
              props: {
                decorations: (state) => key.getState(state).deco,
                handleKeyDown(view, event) {
                  const { dispatch, state } = view,
                    { message } = key.getState(state),
                    { schema, tr } = state;
                  const { content } = ctx.get(parserCtx)(message);

                  dispatch(tr.setMeta(key, ""));
                  switch (event.key) {
                    case "Enter":
                      void getHint(ctx, view);
                      break;
                    case "Tab":
                      event.preventDefault();
                      dispatch(
                        tr.replaceSelection(
                          DOMParser.fromSchema(schema).parseSlice(
                            DOMSerializer.fromSchema(schema).serializeFragment(
                              content,
                            ),
                          ),
                        ),
                      );
                      return true;
                  }
                },
                handleTextInput: debounce((view, from, to, text) => {
                  if (text === " ") void getHint(ctx, view);
                }, second),
              },
              state: {
                apply(tr, value, prevState, { doc, schema }) {
                  const message = tr.getMeta(key),
                    { content } = ctx.get(parserCtx)(message),
                    {
                      selection: {
                        $anchor: { parentOffset },
                        to,
                      },
                    } = tr;
                  return typeof message === "string"
                    ? {
                        deco: message.length
                          ? DecorationSet.create(doc, [
                              Decoration.widget(
                                to + Number(!parentOffset),
                                DOMSerializer.fromSchema(
                                  schema,
                                ).serializeFragment(
                                  content,
                                  {},
                                  document.createElement("pre"),
                                ),
                              ),
                            ])
                          : DecorationSet.empty,
                        message,
                      }
                    : value;
                },
                init,
              },
            }),
        ),
      );

    return crepe;
  });

watch(selected, async (value) => {
  textModel = await getModel(value);
  clearUrls();
  get()?.action(replaceAll(getValue(), true));
});

watch(
  () => $q.dark.isActive,
  (value) => {
    css.value = value ? darkTheme : lightTheme;
  },
  { immediate },
);

watch(
  apiKey,
  (value) => {
    model = value
      ? createMistral({ apiKey: value })("mistral-large-latest")
      : undefined;
  },
  { immediate },
);

onUnmounted(clearUrls);
</script>

<style scoped lang="scss">
:deep(.milkdown) .ProseMirror {
  @media (max-width: $breakpoint-sm-max) {
    padding-right: 60px;
  }
}
</style>
