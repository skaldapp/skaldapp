<template lang="pug">
router-view
</template>

<script setup lang="ts">
import { sharedStore } from "@skaldapp/shared";
import { editor } from "monaco-editor";
import { storeToRefs } from "pinia";
import { cache, writable } from "stores/defaults";
import { ioStore } from "stores/io";
import { useMainStore } from "stores/main";
import { toRef, toRefs, watch } from "vue";

const bucket = toRef(ioStore, "bucket"),
  mainStore = useMainStore(),
  { deleteObject, getObjectText, headObject, putObject } = ioStore,
  { domain } = storeToRefs(mainStore),
  { manifest, putPages } = mainStore,
  { nodes, tree } = toRefs(sharedStore);

watch(nodes, (value) => {
  value.forEach((object) => {
    if (!("contenteditable" in object))
      Object.defineProperty(object, "contenteditable", {
        value: false,
        writable,
      });
  });
});

watch(bucket, async (value) => {
  if (value) {
    const [getIndex, getManifest, getCname] = (
      await Promise.all(
        ["index.json", ".vite/manifest.json", "CNAME"].map((file) =>
          getObjectText(file, cache),
        ),
      )
    ).map((value) => value || undefined);

    const [cname = ""] = getCname?.split("\n", 1) ?? [],
      [localManifest, serverManifest] = (
        [manifest, JSON.parse(getManifest ?? "{}")] as Record<
          string,
          Record<string, string[]> | undefined
        >[]
      ).map(
        (element) =>
          new Set(
            [
              ...Object.values(element).map(({ file } = {}) => file),
              ...(element["index.html"]?.css ?? []),
            ].filter(Boolean) as string[],
          ),
      ),
      files = ["robots.txt", ".nojekyll"];

    tree.value = JSON.parse(getIndex ?? "[{}]");
    domain.value = cname;
    if (localManifest && serverManifest) {
      (
        await Promise.allSettled(files.map((file) => headObject(file, cache)))
      ).forEach(({ status }, index) => {
        if (status === "rejected" && files[index])
          localManifest.add(files[index]);
      });

      [...serverManifest]
        .filter((x) => !localManifest.has(x))
        .forEach((element) => {
          void deleteObject(element);
        });

      await Promise.allSettled(
        [...localManifest.add(".vite/manifest.json")]
          .filter((x) => !serverManifest.has(x))
          .map(async (element) => {
            const body = await (await fetch(`runtime/${element}`)).blob();
            return putObject(
              element,
              new Uint8Array(await body.arrayBuffer()),
              body.type,
            );
          }),
      );

      void putPages();
    }
  } else {
    tree.value.length = 0;

    editor.getModels().forEach((model) => {
      model.dispose();
    });
  }
});
</script>
