import type { TPage } from "@skaldapp/shared";

import { sharedStore } from "@skaldapp/shared";
import { InferSeoMetaPlugin } from "@unhead/addons";
import { createHead, renderSSRHead } from "@unhead/vue/server";
import { useFetch } from "@vueuse/core";
import { parse } from "hexo-front-matter";
import { editor, Uri } from "monaco-editor";
import { acceptHMRUpdate, defineStore } from "pinia";
import { debounce } from "quasar";
import { cache, second } from "stores/defaults";
import { useIoStore } from "stores/io";
import {
  AliasSortingPlugin,
  CanonicalPlugin,
  TemplateParamsPlugin,
} from "unhead/plugins";
import { ref, toRefs } from "vue";

export type TAppPage = TPage & {
  contenteditable: boolean;
};

export const useDataStore = defineStore("data", () => {
  const domain = ref(""),
    ioStore = useIoStore(),
    message = ref(""),
    oldPages: string[] = [],
    { data: body } = useFetch(`runtime/index.html`).text(),
    { deleteObject, getObjectText, putObject, removeEmptyDirectories } =
      ioStore,
    { kvNodes, nodes } = toRefs(sharedStore);

  const parseFrontmatter = (id: string) => {
    const model = editor.getModel(Uri.parse(`file:///${id}.md`));
    if (model && kvNodes.value[id])
      try {
        const frontmatter = parse(model.getValue());
        delete frontmatter._content;
        if (
          JSON.stringify(kvNodes.value[id].frontmatter) !==
          JSON.stringify(frontmatter)
        )
          kvNodes.value[id].frontmatter = frontmatter;
      } catch (error) {
        const { message } = error as Error;
        if (
          JSON.stringify(kvNodes.value[id].frontmatter) !== JSON.stringify({})
        )
          kvNodes.value[id].frontmatter = {};
        return message;
      }
    return "";
  };

  const getModel = async (id: string) => {
      const uri = Uri.parse(`file:///${id}.md`);
      let model = editor.getModel(uri);
      const putObjectDebounced = debounce(() => {
        if (model)
          void putObject(`docs/${id}.md`, model.getValue(), "text/markdown");
      }, second);
      if (!model) {
        const value = await getObjectText(`docs/${id}.md`, cache);
        model = editor.createModel(
          value ||
            `---
title: Title
meta:
  - name: description
    content: Description
attrs:
  un-cloak: true
  class:
    - container
    - mx-auto
    - prose
hidden: false
template: false
icon: twemoji:page-facing-up
---
`,
          "mdc",
          uri,
        );
        model.onDidChangeContent(() => {
          message.value = parseFrontmatter(id);
          putObjectDebounced();
        });
        message.value = parseFrontmatter(id);
        if (!value) putObjectDebounced();
      }
      return model;
    },
    putPages = async () => {
      const promises: Promise<void>[] = [];
      oldPages.forEach((url) => {
        if (!(nodes.value as TAppPage[]).find(({ path }) => path === url))
          promises.push(deleteObject(url ? `${url}/index.html` : "index.html"));
      });
      await Promise.allSettled(promises);
      await removeEmptyDirectories();
      oldPages.length = 0;
      (nodes.value as TAppPage[]).forEach(({ branch, path }) => {
        if (path !== undefined) {
          oldPages.push(path);
          const vueHeadClient = createHead({
            plugins: [
              TemplateParamsPlugin,
              AliasSortingPlugin,
              ...(domain.value
                ? [
                    CanonicalPlugin({
                      canonicalHost: `https://${domain.value}`,
                    }),
                  ]
                : []),
              InferSeoMetaPlugin(),
            ],
          });
          branch.forEach(({ frontmatter }, index) => {
            if (branch.length - 1 === index)
              vueHeadClient.push({
                ...frontmatter,
                base: {
                  href:
                    Array(branch.length - 1)
                      .fill("..")
                      .join("/") || "./",
                },
              });
            else if (frontmatter.template && !frontmatter.hidden)
              vueHeadClient.push(frontmatter);
          });
          void (async () => {
            if (body.value)
              try {
                const { headTags } = await renderSSRHead(vueHeadClient);
                await putObject(
                  path ? `${path}/index.html` : "index.html",
                  body.value.replace(
                    "<head>",
                    `<head>
${headTags}
`,
                  ),
                  "text/html",
                );
              } catch (error) {
                console.error(error);
              }
          })();
        }
      });
    },
    putSitemap = async () => {
      await putObject(
        "sitemap.txt",
        nodes.value
          .map(({ frontmatter: { hidden }, to }) =>
            domain.value && to && !hidden
              ? `https://${domain.value}${to === "/" ? "" : encodeURI(to)}`
              : undefined,
          )
          .filter(Boolean)
          .join("\n"),
        "text/plain",
      );
    };

  return {
    domain,
    getModel,
    message,
    putPages,
    putSitemap,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot));
