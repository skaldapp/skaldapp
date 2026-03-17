<template lang="pug">
Milkdown
</template>

<script setup lang="ts">
import type { Handle } from "mdast-util-to-markdown";

import { Crepe } from "@milkdown/crepe";
import darkTheme from "@milkdown/crepe/theme/frame-dark.css?inline";
import lightTheme from "@milkdown/crepe/theme/frame.css?inline";
import { remarkStringifyOptionsCtx } from "@milkdown/kit/core";
import { htmlSchema } from "@milkdown/kit/preset/commonmark";
import { emoji } from "@milkdown/plugin-emoji";
import { replaceAll } from "@milkdown/utils";
import { Milkdown, useEditor } from "@milkdown/vue";
import { useStyleTag } from "@vueuse/core";
import { split } from "hexo-front-matter";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { copilotPlugin } from "stores/copilotPlugin";
import { useDataStore } from "stores/data";
import { cancel, immediate, persistent } from "stores/defaults";
import { htmlSchemaExtended } from "stores/html";
import { useIoStore } from "stores/io";
import { useMainStore } from "stores/main";
import { onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";

const $q = useQuasar(),
  blockCaptionPlaceholderText = "Write Image Title",
  dataStore = useDataStore(),
  link: Handle = (node, parent, state, info) =>
    ((text) =>
      text === node.url ? node.url : `[${text}](${node.url as string})`)(
      state.containerPhrasing(node, info),
    ),
  text: Handle = ({ value }) => value,
  handlers = { link, text },
  ioStore = useIoStore(),
  mainStore = useMainStore(),
  urls = new Map(),
  yaml = "---",
  { css } = useStyleTag($q.dark.isActive ? darkTheme : lightTheme),
  { getModel } = dataStore,
  { getObjectBlob, headObject, putObject } = ioStore,
  { selected } = storeToRefs(mainStore),
  { t } = useI18n();

let front = "",
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
        ctx.set(remarkStringifyOptionsCtx, { handlers });
      })
      .use(emoji)
      .use(htmlSchemaExtended)
      .use(copilotPlugin);

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

onUnmounted(clearUrls);
</script>

<style scoped lang="scss">
:deep(.milkdown) .ProseMirror {
  @media (max-width: $breakpoint-sm-max) {
    padding-right: 60px;
  }
}
</style>
