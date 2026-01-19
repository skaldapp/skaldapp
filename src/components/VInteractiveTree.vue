<template lang="pug">
q-page-sticky(:offset="[15, 15]", position="bottom-right")
  Transition(
    appear,
    enter-active-class="animated zoomIn",
    leave-active-class="animated zoomOut"
  )
    q-fab(
      v-if="visible",
      v-model="state",
      color="accent",
      direction="up",
      icon="add"
    )
      q-fab-action(color="primary", icon="note", @click="clickAdd")
      q-fab-action(color="primary", icon="delete", @click="clickRemove")
      q-fab-action(color="secondary", icon="chevron_left", @click="clickLeft")
      q-fab-action(
        color="secondary",
        icon="chevron_right",
        @click="clickRight"
      )
      q-fab-action(color="secondary", icon="expand_more", @click="clickDown")
      q-fab-action(color="secondary", icon="expand_less", @click="clickUp")
.scroll.col
  q-tree.q-ma-md(
    v-if="nodes[0]",
    ref="qtree",
    v-model:expanded="expanded",
    dense,
    no-selection-unset,
    node-key="id",
    :nodes="[nodes[0]]",
    :selected
  )
    template(#default-header="prop")
      .row.no-wrap.full-width.items-center(
        v-intersection="onIntersection",
        :data-id="prop.node.id",
        @dblclick="prop.node.contenteditable = true",
        @keypress.stop
      )
        q-input.full-width(
          v-model.trim="prop.node.name",
          :bg-color="prop.node.id === selected ? 'primary' : undefined",
          dense,
          :error="error(prop.node)",
          :error-message="errorMessage(prop.node)",
          hide-bottom-space,
          :input-class="{ 'text-strike': prop.node.frontmatter.hidden }",
          outlined,
          :readonly="!prop.node.contenteditable",
          @click.stop="selected = prop.node.id",
          @keyup.enter="prop.node.contenteditable = false"
        )
          template(#prepend)
            Icon(
              v-if="prop.node.frontmatter.icon",
              :icon="prop.node.frontmatter.icon"
            )
          template(#append)
            q-icon(
              v-if="prop.node.frontmatter.template",
              name="picture_in_picture_alt"
            )
</template>
<script setup lang="ts">
import type { TPage } from "@skaldapp/shared";
import type { QTree } from "quasar";

import { Icon } from "@iconify/vue";
import { sharedStore } from "@skaldapp/shared";
import { storeToRefs } from "pinia";
import { debounce, useQuasar } from "quasar";
import { useDataStore } from "stores/data";
import { cancel, deep, immediate, persistent, second } from "stores/defaults";
import { useIoStore } from "stores/io";
import { useMainStore } from "stores/main";
import { ref, toRefs, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";

const $q = useQuasar(),
  dataStore = useDataStore(),
  ioStore = useIoStore(),
  mainStore = useMainStore(),
  qtree = useTemplateRef<QTree>("qtree"),
  state = ref(false),
  visible = ref(false),
  { add, addChild, down, left, remove, right, up } = sharedStore,
  { deleteObject, putObject } = ioStore,
  { kvNodes, nodes } = toRefs(sharedStore),
  { putPages, putSitemap } = dataStore,
  { selected } = storeToRefs(mainStore),
  { t } = useI18n();

const errors = [
    (propNode: TPage) => !propNode.name,
    (propNode: TPage) =>
      !!nodes.value.find(
        (element) =>
          propNode.path &&
          element.id !== propNode.id &&
          element.path === propNode.path,
      ),
    (propNode: TPage) =>
      ["?", "\\", "#"].some((value) => propNode.name?.includes(value)),
  ],
  expanded = ref([nodes.value[0]?.id]);

const cleaner = (value: TPage[]) => {
    value.forEach((page) => {
      const { children, id } = page;
      if (children.length) cleaner(children as TPage[]);
      if (id) void deleteObject(`docs/${id}.md`);
    });
  },
  clickAdd = () => {
    if (selected.value) {
      const id = kvNodes.value[selected.value]?.parent
        ? add(selected.value)
        : addChild(selected.value);
      if (id) {
        if (kvNodes.value[selected.value]?.children.length)
          qtree.value?.setExpanded(selected.value, true);
        selected.value = id;
      }
    }
    state.value = true;
  },
  clickDown = () => {
    if (selected.value) down(selected.value);
    state.value = true;
  },
  clickLeft = () => {
    if (selected.value) {
      const id = left(selected.value);
      if (id) qtree.value?.setExpanded(id, true);
    }
    state.value = true;
  },
  clickRemove = () => {
    if (kvNodes.value[selected.value]?.parent)
      $q.dialog({
        cancel,
        message: t("Do you really want to delete?"),
        persistent,
        title: t("Confirm"),
      }).onOk(() => {
        if (selected.value) {
          const deleted = kvNodes.value[selected.value],
            id = remove(selected.value);
          if (id) {
            if (deleted) cleaner([deleted]);
            selected.value = id;
          }
        }
      });
    state.value = true;
  },
  clickRight = () => {
    if (selected.value) {
      const id = right(selected.value);
      if (id) qtree.value?.setExpanded(id, true);
    }
    state.value = true;
  },
  clickUp = () => {
    if (selected.value) up(selected.value);
    state.value = true;
  },
  error = (propNode: TPage) =>
    errors
      .map((errFnc) => errFnc(propNode))
      .reduceRight(
        (previousValue, currentValue) => previousValue || currentValue,
      ),
  errorMessage = (propNode: TPage) => {
    switch (true) {
      case errors[0]?.(propNode):
        return t("The name is empty");
      case errors[1]?.(propNode):
        return t("That name is already in use");
      case errors[2]?.(propNode):
        return t("Prohibited characters are used");
      default:
        return undefined;
    }
  },
  onIntersection = (entry: IntersectionObserverEntry) => {
    if (
      entry.target instanceof HTMLElement &&
      entry.target.dataset.id === selected.value
    )
      visible.value = entry.isIntersecting;
    return true;
  };

watch(
  selected,
  (newVal, oldVal) => {
    visible.value = true;
    if (!newVal) {
      const [{ id } = {}] = nodes.value;
      selected.value = id ?? "";
    }
    if (oldVal && kvNodes.value[oldVal])
      Reflect.defineProperty(kvNodes.value[oldVal], "contenteditable", {
        value: false,
      });
  },
  { immediate },
);

watch(
  nodes,
  debounce((value) => {
    void putObject(
      "docs/index.json",
      JSON.stringify([value[0]]),
      "application/json",
    );
    void putSitemap();
    void putPages();
  }, second),
  { deep },
);
</script>

<style scoped>
.min-w-96 {
  min-width: 96px;
}
</style>
