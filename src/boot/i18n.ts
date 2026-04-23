import { Lang } from "quasar";
import ru from "quasar/lang/ru";
import messages from "src/i18n";
import { createI18n } from "vue-i18n";

import { defineBoot } from "#q-app/wrappers";

const legacy = false,
  locale = Lang.getLocale() === "ru-RU" ? "ru-RU" : "en-US";

export default defineBoot(({ app }) => {
  if (locale === "ru-RU") Lang.set(ru);
  app.use(createI18n({ legacy, locale, messages }));
});
