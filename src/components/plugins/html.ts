import { htmlAttr, htmlSchema } from "@milkdown/kit/preset/commonmark";
import { highlight, languages } from "prismjs";

export const htmlSchemaExtended = htmlSchema.extendSchema((prev) => (ctx) => ({
  ...prev(ctx),
  toDOM: (node) => {
    const span = document.createElement("span");
    const attr = {
      ...ctx.get(htmlAttr.key)(node),
      "data-type": "html",
      "data-value": node.attrs.value,
    };
    if (languages.html)
      span.innerHTML = `<code class="language-html">${highlight(node.attrs.value, languages.html, "html")}</code>`;
    else span.textContent = node.attrs.value;
    return ["span", attr, span.firstElementChild];
  },
}));
