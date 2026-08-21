import { Lang } from "quasar";
import ru from "quasar/lang/ru";
import { createI18n } from "vue-i18n";

import { defineBoot } from "#q-app";
import messages from "@/i18n";

const legacy = false,
  locale = Lang.getLocale() === "ru-RU" ? "ru-RU" : "en-US";

export default defineBoot(({ app }) => {
  // @ts-expect-error Argument of type 'QuasarLanguage' is not assignable to parameter of type '{ isoName: string; nativeName: string; rtl?: boolean; label: { clear: string; ok: string; cancel: string; close: string; set: string; select: string; reset: string; remove: string; update: string; create: string; ... 9 more ...; collapse: (label?: string | undefined) => string; }; ... 6 more ...; tree: { ...; }; }' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
  if (locale === "ru-RU") Lang.set(ru);
  app.use(createI18n({ legacy, locale, messages }));
});
