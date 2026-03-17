import type { Ctx } from "@milkdown/kit/ctx";
import type { EditorView } from "@milkdown/kit/prose/view";

import { parserCtx, serializerCtx } from "@milkdown/kit/core";
import { cloneTr } from "@milkdown/kit/prose";
import { DOMParser, DOMSerializer } from "@milkdown/kit/prose/model";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import { $prose } from "@milkdown/kit/utils";
import { CompletionCopilot } from "monacopilot";
import { storeToRefs } from "pinia";
import { debounce } from "quasar";
import { immediate, second, technologies } from "stores/defaults";
import { useMainStore } from "stores/main";
import { watch } from "vue";

let copilot: CompletionCopilot | undefined;

const column = NaN,
  lineNumber = NaN,
  cursorPosition = { column, lineNumber },
  deco = DecorationSet.empty,
  key = new PluginKey("MilkdownCopilot"),
  language = "markdown",
  message = "",
  model = "codestral",
  provider = "mistral",
  relatedFiles = undefined;
const init = () => ({ deco, message });

export const copilotPlugin = $prose((ctx) => {
  const mainStore = useMainStore(),
    { apiKey, selected } = storeToRefs(mainStore);
  const getHint = debounce(async ({ get }: Ctx, view: EditorView) => {
    if (copilot) {
      const filename = `${selected.value}.md`,
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
  }, second);

  watch(
    apiKey,
    (value) => {
      copilot = value
        ? new CompletionCopilot(value, { model, provider })
        : undefined;
    },
    { immediate },
  );

  return new Plugin({
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
                DOMSerializer.fromSchema(schema).serializeFragment(content),
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
                      DOMSerializer.fromSchema(schema).serializeFragment(
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
  });
});
