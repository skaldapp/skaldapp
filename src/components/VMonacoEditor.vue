<template lang="pug">
.full-width.full-height(ref="monacoRef")
</template>

<script setup lang="ts">
import type { TOpenAI } from "@skaldapp/shared";
import type {
  CompletionRegistration,
  CompletionRequestBody,
} from "monacopilot";

import { registerBracketMatcher } from "@nuxtlabs/monarch-mdc";
import { createCompletionCopilot } from "@skaldapp/milkdown-copilot";
import { split } from "hexo-front-matter";
import * as monaco from "monaco-editor";
import { registerCompletion } from "monacopilot";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { useDataStore } from "stores/data";
import { deep, enabled, immediate, technologies } from "stores/defaults";
import { useMainStore } from "stores/main";
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from "vue";

let bracketMatcherDisposable: monaco.IDisposable | null = null,
  completion: CompletionRegistration | null = null,
  editor: monaco.editor.IStandaloneCodeEditor | null = null,
  textModel: monaco.editor.ITextModel | null = null;

const $q = useQuasar(),
  ambiguousCharacters = false,
  automaticLayout = true,
  bracketPairColorization = { enabled },
  dataStore = useDataStore(),
  detectIndentation = false,
  endColumn = 1,
  fixedOverflowWidgets = true,
  formatOnPaste = true,
  formatOnType = true,
  mainStore = useMainStore(),
  monacoRef = useTemplateRef<HTMLElement>("monacoRef"),
  onError = console.error,
  scrollBeyondLastLine = false,
  severity = monaco.MarkerSeverity.Error,
  startColumn = 1,
  startLineNumber = 2,
  tabSize = 2,
  unicodeHighlight = { ambiguousCharacters },
  wordWrap = "on",
  { getModel } = dataStore,
  { message } = storeToRefs(dataStore),
  { openAI, selected } = storeToRefs(mainStore);

const frontmatter = (message: string) => {
    if (message && textModel) {
      const { data, prefixSeparator, separator } = split(textModel.getValue());
      if (data && separator === "---" && prefixSeparator)
        monaco.editor.setModelMarkers(textModel, "frontmatter", [
          {
            endColumn,
            endLineNumber: data.split("\n").length + 2,
            message,
            severity,
            startColumn,
            startLineNumber,
          },
        ]);
    } else monaco.editor.removeAllMarkers("frontmatter");
  },
  monacopilot = ({ apiKey, baseURL, endpoint, model }: TOpenAI) => {
    completion?.deregister();
    completion = null;
    if (apiKey && baseURL && model && editor && textModel) {
      const copilot = createCompletionCopilot({
          apiKey,
          baseURL,
          endpoint: endpoint ?? "",
          model,
        }),
        language = textModel.getLanguageId(),
        requestHandler = ({ body }: { body: CompletionRequestBody }) =>
          copilot.complete({ body }),
        {
          uri: { path: filename },
        } = textModel;

      completion = registerCompletion(monaco, editor, {
        filename,
        language,
        onError,
        requestHandler,
        technologies,
      });
    }
  };

watch(openAI, monacopilot, { deep });
watch(message, frontmatter);

watch(
  () => $q.dark.isActive,
  (val) => {
    monaco.editor.setTheme(val ? "vs-dark" : "vs");
  },
  { immediate },
);

onMounted(() => {
  watch(
    selected,
    async (value) => {
      textModel = await getModel(value);
      if (editor) editor.setModel(textModel);
      else {
        editor =
          monacoRef.value &&
          monaco.editor.create(monacoRef.value, {
            automaticLayout,
            bracketPairColorization,
            detectIndentation,
            fixedOverflowWidgets,
            formatOnPaste,
            formatOnType,
            model: textModel,
            scrollBeyondLastLine,
            tabSize,
            unicodeHighlight,
            wordWrap,
          });
        bracketMatcherDisposable = registerBracketMatcher(editor);
        monacopilot(openAI.value);
        frontmatter(message.value);
      }
      editor?.focus();
    },
    { immediate },
  );
});

onBeforeUnmount(() => {
  completion?.deregister();
  completion = null;
  bracketMatcherDisposable?.dispose();
  editor?.dispose();
  editor = null;
});
</script>
