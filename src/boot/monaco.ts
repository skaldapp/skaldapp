import configureMonacoSFC from "@skaldapp/monaco-sfc";
// eslint-disable-next-line import-x/default
import VueWorker from "@skaldapp/monaco-sfc/vue.worker?worker";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { configureMonacoTailwindcss, tailwindcssData } from "monaco-tailwind";
import TailwindWorker from "monaco-tailwind/tailwind.worker?worker";

const dataProviders = { tailwindcssData },
  data = { dataProviders },
  languageSelector = ["markdown"];

window.MonacoEnvironment = {
  getWorker: (workerId: string, label: string) => {
    switch (label) {
      case "tailwindcss":
        return new TailwindWorker();
      case "vue":
        return new VueWorker();
      default:
        return new EditorWorker();
    }
  },
};

monaco.languages.css.cssDefaults.setOptions({ data });

configureMonacoSFC(monaco);
configureMonacoTailwindcss(monaco, { languageSelector });
