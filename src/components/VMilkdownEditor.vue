<template lang="pug">
Milkdown
</template>

<script setup lang="ts">
import type { Ctx } from "@milkdown/kit/ctx";
import type { EditorView } from "prosemirror-view";

import { Crepe } from "@milkdown/crepe";
import darkTheme from "@milkdown/crepe/theme/frame-dark.css?inline";
import lightTheme from "@milkdown/crepe/theme/frame.css?inline";
import {
  parserCtx,
  remarkStringifyOptionsCtx,
  serializerCtx,
} from "@milkdown/kit/core";
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
import { split } from "hexo-front-matter";
import { CompletionCopilot } from "monacopilot";
import { storeToRefs } from "pinia";
import { highlight, languages } from "prismjs";
import { debounce, useQuasar } from "quasar";
import { useDataStore } from "stores/data";
import {
  cancel,
  immediate,
  persistent,
  second,
  technologies,
} from "stores/defaults";
import { useIoStore } from "stores/io";
import { useMainStore } from "stores/main";
import { onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";

const $q = useQuasar(),
  blockCaptionPlaceholderText = "Write Image Title",
  dataStore = useDataStore(),
  deco = DecorationSet.empty,
  ioStore = useIoStore(),
  key = new PluginKey("MilkdownCopilot"),
  language = "markdown",
  mainStore = useMainStore(),
  message = "",
  model = "codestral",
  provider = "mistral",
  relatedFiles = undefined,
  urls = new Map(),
  yaml = "---",
  { apiKey, selected } = storeToRefs(mainStore),
  { css } = useStyleTag($q.dark.isActive ? darkTheme : lightTheme),
  { getModel } = dataStore,
  { getObjectBlob, headObject, putObject } = ioStore,
  { t } = useI18n();

let copilot: CompletionCopilot | undefined,
  front = "",
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
    [Crepe.Feature.ImageBlock]: {
      blockCaptionPlaceholderText,
      onUpload,
      proxyDomURL,
    },
  },
  getHint = debounce(async ({ get }: Ctx, view: EditorView) => {
    if (copilot) {
      const column = NaN,
        lineNumber = NaN,
        cursorPosition = { column, lineNumber },
        filename = `${selected.value}.md`,
        {
          dispatch,
          state: {
            schema: { topNodeType },
            tr: {
              doc,
              selection: { from },
            },
          },
        } = view,
        { content: after } = doc.slice(from),
        textAfterCursor = get(serializerCtx)(
          topNodeType.createAndFill(undefined, after) ??
            topNodeType.create(undefined, after),
        ).replace(/^<br \/>|<br \/>$/, ""),
        { content: before } = doc.slice(0, from),
        textBeforeCursor = get(serializerCtx)(
          topNodeType.createAndFill(undefined, before) ??
            topNodeType.create(undefined, before),
        )
          .replace(/^<br \/>|<br \/>$/, "")
          .trim(),
        completionMetadata = {
          cursorPosition,
          filename,
          language,
          relatedFiles,
          technologies,
          textAfterCursor,
          textBeforeCursor,
        },
        body = { completionMetadata },
        { completion } = await copilot.complete({ body });

      if (completion?.replace(/^<br \/>|<br \/>$/, "").trim())
        dispatch(cloneTr(view.state.tr).setMeta(key, completion));
    }
  }, second),
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
      .editor.config((ctx) => {
        ctx.set(remarkStringifyOptionsCtx, {
          handlers: { text: ({ value }) => value },
        });
      })
      .use(emoji)
      .use(
        htmlSchema.extendSchema((prev) => (ctx) => ({
          ...prev(ctx),
          toDOM: (node) => {
            const span = document.createElement("span");
            const attr = {
              ...ctx.get(htmlAttr.key)(node),
              "data-type": "html",
              "data-value": node.attrs.value,
            };
            if (languages.html)
              span.innerHTML = `<pre class="language-html"><code class="language-html">${highlight(node.attrs.value, languages.html, "html")}</code></pre>`;
            else span.textContent = node.attrs.value;
            return ["span", attr, span.firstElementChild];
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
                  if (event.key === "Tab" && message) {
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
                  } else {
                    if (event.key === "Enter" || event.key.length === 1)
                      getHint(ctx, view);
                    else getHint.cancel();
                  }
                },
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
    copilot = value
      ? new CompletionCopilot(value, { model, provider })
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
