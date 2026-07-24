<template lang="pug">
q-drawer(
  v-model="rightDrawer",
  behavior="desktop",
  overlay,
  side="right",
  :width="rightDrawerWidth"
)
  .column.fit.no-wrap(v-if="openAI.apiKey && openAI.baseURL && openAI.model")
    v-ai-chat
  .column.justify-center.text-center.full-height.q-mx-sm.items-center(v-else)
    q-btn(color="primary", label="Generic OpenAI", push, @click="clickAI")
    .q-mt-md {{ t("You need an AI key to use this feature") }}
  q-separator.absolute-left(
    v-touch-pan.prevent.mouse.horizontal="resizeRightDrawer",
    :class="{ 'cursor-ew-resize': $q.screen.gt.sm }",
    vertical
  )
q-drawer(
  v-model="leftDrawer",
  show-if-above,
  side="left",
  :width="leftDrawerWidth"
)
  .column.fit.no-wrap(v-if="tree && the")
    v-interactive-tree
  q-separator.absolute-right(
    v-touch-pan.prevent.mouse.horizontal="resizeLeftDrawer",
    :class="{ 'cursor-ew-resize': $q.screen.gt.sm }",
    vertical
  )
q-page.column.full-height(v-if="the")
  q-tabs(
    v-model="tab",
    active-color="primary",
    align="justify",
    dense,
    indicator-color="primary",
    narrow-indicator
  )
    q-tab(label="wysiwyg", name="wysiwyg")
    q-tab(label="markdown", name="md")
  q-tab-panels.full-width.col(v-if="selected", v-model="tab")
    q-tab-panel.q-px-none(name="wysiwyg")
      Suspense
        milkdown-provider
          v-milkdown-editor.full-height.scroll
        template(#fallback)
          q-inner-loading(showing)
            q-spinner-hourglass
    q-tab-panel(name="md")
      Suspense
        v-monaco-editor.full-height.full-width
          template(#fallback)
            q-inner-loading(showing)
              q-spinner-hourglass
q-page.column.full-height.bg-light(v-else)
  q-inner-loading(showing)
    q-spinner-hourglass
q-footer
  .row.no-wrap
    .col-12.col-sm-8.col-md-6.col-lg-4.row.no-wrap
      q-chip.max-w-third(icon="folder", :ripple="false", size="sm", square)
        template(#default)
          .ellipsis.text-left.rtl {{ bucket }}
      q-chip.col(icon="article", :ripple="false", size="sm", square)
        template(#default)
          .ellipsis.text-left.rtl {{ kvNodes[selected]?.frontmatter.title || kvNodes[selected]?.name }}
      q-chip.col(icon="save", :ripple="false", size="sm", square)
        template(#default)
          .ellipsis.text-left.rtl {{ kvNodes[selected]?.id && `docs/${kvNodes[selected]?.id}.md` }}
    q-tabs.gt-xs(
      dense,
      mobile-arrows,
      narrow-indicator,
      outside-arrows,
      :shrink="true",
      stretch
    )
      q-chip(
        v-for="key in [...new Set(getKeywords(selected))]",
        :key,
        icon="tag",
        :outline="true",
        :ripple="false",
        :selected="selectedKeywords.includes(key)",
        size="sm",
        square,
        @update:selected="(state) => (state ? selectedKeywords.push(key) : selectedKeywords.splice(selectedKeywords.indexOf(key), 1))"
      ) {{ key }}
</template>
<script setup lang="ts">
import type { TouchPanValue } from "quasar";

import { MilkdownProvider } from "@milkdown/vue";
import { sharedStore } from "@skaldapp/shared";
import { useWindowSize } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { computed, ref, toRefs, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";

import type { TAppPage } from "@/stores/data";

import VAiDialog from "@/components/dialogs/VAiDialog.vue";
import VAiChat from "@/components/VAiChat.vue";
import VInteractiveTree from "@/components/VInteractiveTree.vue";
import VMilkdownEditor from "@/components/VMilkdownEditor.vue";
import VMonacoEditor from "@/components/VMonacoEditor.vue";
import { useDataStore } from "@/stores/data";
import { persistent, writable } from "@/stores/defaults";
import { useIoStore } from "@/stores/io";
import { useMainStore } from "@/stores/main";

const $q = useQuasar(),
  dataStore = useDataStore(),
  ioStore = useIoStore(),
  mainStore = useMainStore(),
  tab = ref("wysiwyg"),
  { bucket } = toRefs(ioStore),
  { getKeywords } = dataStore,
  { keywords, leftDrawer, rightDrawer, selected, selectedKeywords } =
    storeToRefs(dataStore),
  { kvNodes, nodes, tree } = toRefs(sharedStore),
  { openAI } = storeToRefs(mainStore),
  { t } = useI18n(),
  { width } = useWindowSize();

let initialLeftDrawerWidth = 300,
  initialRightDrawerWidth = width.value / 2;

const leftDrawerWidth = ref(initialLeftDrawerWidth),
  rightDrawerWidth = ref(initialRightDrawerWidth);

const clickAI = () => {
    $q.dialog({
      component: VAiDialog,
      componentProps: { persistent },
    }).onOk((openAI) => {
      mainStore.openAI = openAI;
    });
  },
  resizeLeftDrawer: TouchPanValue = ({ isFirst, offset: { x } = {} }) => {
    if ($q.screen.gt.sm) {
      if (isFirst) initialLeftDrawerWidth = leftDrawerWidth.value;
      if (x) {
        const drawerWidth = initialLeftDrawerWidth + x;
        if (drawerWidth > 130 && drawerWidth < width.value / 3)
          leftDrawerWidth.value = drawerWidth;
      }
    }
  },
  resizeRightDrawer: TouchPanValue = ({ isFirst, offset: { x } = {} }) => {
    if ($q.screen.gt.sm) {
      if (isFirst) initialRightDrawerWidth = rightDrawerWidth.value;
      if (x) {
        const drawerWidth = initialRightDrawerWidth - x;
        if (drawerWidth > 130 && drawerWidth < width.value / 2)
          rightDrawerWidth.value = drawerWidth;
      }
    }
  },
  the = computed(
    () =>
      (kvNodes.value[selected.value] ?? nodes.value[0]) as TAppPage | undefined,
  );

watchEffect(() => {
  if (
    leftDrawer.value &&
    $q.screen.gt.sm &&
    leftDrawerWidth.value > width.value / 3
  )
    leftDrawerWidth.value = width.value / 3;
  else if ($q.screen.lt.sm) leftDrawerWidth.value = (3 * width.value) / 4;
  if (
    rightDrawer.value &&
    $q.screen.gt.md &&
    rightDrawerWidth.value > width.value / 2
  )
    rightDrawerWidth.value = width.value / 2;
  else if ($q.screen.lt.md) rightDrawerWidth.value = width.value;
});

watch(keywords, (value) => {
  selectedKeywords.value = selectedKeywords.value.filter((keyword) =>
    value.includes(keyword),
  );
});

watch(nodes, (value) => {
  value.forEach((object) => {
    if (!("contenteditable" in object))
      Object.defineProperty(object, "contenteditable", {
        value: false,
        writable,
      });
  });
});

rightDrawer.value = false;
</script>

<style scoped>
.q-textarea :deep(.q-field__control) {
  height: 100% !important;
}
.cursor-ew-resize {
  cursor: ew-resize;
}
.q-footer :deep(.q-tabs__arrow) {
  font-size: 80%;
}
.q-tabs :deep(.q-chip) {
  max-width: unset;
  margin: unset;
}
.q-tabs :deep(.q-chip--outline) {
  border: unset;
}
.max-w-third {
  max-width: calc(100% / 3);
}

.rtl {
  direction: rtl;
}
</style>
