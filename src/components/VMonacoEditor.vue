<template lang="pug">
.full-width.full-height(ref="monacoRef")
</template>

<script setup lang="ts">
import type {
  CompletionRegistration,
  CompletionRequestBody,
} from "monacopilot";

import { split } from "hexo-front-matter";
import * as monaco from "monaco-editor";
import { CompletionCopilot, registerCompletion } from "monacopilot";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { useDataStore } from "stores/data";
import { enabled, immediate } from "stores/defaults";
import { useMainStore } from "stores/main";
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from "vue";

let completion: CompletionRegistration | null = null,
  editor: monaco.editor.IStandaloneCodeEditor | null = null,
  model: monaco.editor.ITextModel | null = null;

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
  provider = "mistral",
  scrollBeyondLastLine = false,
  severity = monaco.MarkerSeverity.Error,
  startColumn = 1,
  startLineNumber = 2,
  tabSize = 2,
  technologies = ["vue", "tailwindcss", "mdc (MarkDown Components)"],
  unicodeHighlight = { ambiguousCharacters },
  { apiKey, selected } = storeToRefs(mainStore),
  { getModel } = dataStore,
  { message } = storeToRefs(dataStore);

const frontmatter = (message: string) => {
    if (message && model) {
      const { data, prefixSeparator, separator } = split(model.getValue());
      if (data && separator === "---" && prefixSeparator)
        monaco.editor.setModelMarkers(model, "frontmatter", [
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
  monacopilot = (value: string) => {
    completion?.deregister();
    completion = null;
    if (value && editor && model) {
      const copilot = new CompletionCopilot(value, {
          model: "codestral",
          provider,
        }),
        language = model.getLanguageId(),
        requestHandler = ({ body }: { body: CompletionRequestBody }) =>
          copilot.complete({ body }),
        {
          uri: { path: filename },
        } = model;

      completion = registerCompletion(monaco, editor, {
        filename,
        language,
        onError,
        requestHandler,
        technologies,
      });
    }
  };

watch(apiKey, monacopilot);
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
      model = await getModel(value);
      if (editor) editor.setModel(model);
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
            model,
            scrollBeyondLastLine,
            tabSize,
            unicodeHighlight,
          });
        monacopilot(apiKey.value);
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
  editor?.dispose();
  editor = null;
});
</script>
