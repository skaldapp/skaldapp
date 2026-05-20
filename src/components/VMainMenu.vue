<template lang="pug">
q-btn-dropdown.q-mr-xs(auto-close, dropdown-icon="apps", flat, square, stretch)
  q-list(padding)
    q-item(clickable, @click="$q.dialog({ component: VFaviconDialog })")
      q-item-section(avatar)
        q-avatar(color="primary", icon="image", text-color="white")
      q-item-section
        q-item-label Favicon
    q-item(clickable, @click="clickRobots")
      q-item-section(avatar)
        q-avatar(color="primary", icon="android", text-color="white")
      q-item-section
        q-item-label Robots.txt
    q-item(clickable, @click="clickDomain")
      q-item-section(avatar)
        q-avatar(color="primary", icon="public", text-color="white")
      q-item-section
        q-item-label Domain
    q-item(clickable, @click="clickAI")
      q-item-section(avatar)
        q-avatar(color="primary", icon="smart_toy", text-color="white")
      q-item-section
        q-item-label AI
    q-item(clickable, to="/")
      q-item-section(avatar)
        q-avatar(color="primary", icon="logout", text-color="white")
      q-item-section
        q-item-label Logout
</template>

<script setup lang="ts">
import VAiDialog from "components/dialogs/VAiDialog.vue";
import VFaviconDialog from "components/dialogs/VFaviconDialog.vue";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { useDataStore } from "stores/data";
import { cache, cancel, persistent } from "stores/defaults";
import { useIoStore } from "stores/io";
import { useMainStore } from "stores/main";
import { useI18n } from "vue-i18n";

const $q = useQuasar(),
  dataStore = useDataStore(),
  ioStore = useIoStore(),
  mainStore = useMainStore(),
  { domain } = storeToRefs(dataStore),
  { getObjectText, putObject } = ioStore,
  { putPages, putSitemap } = dataStore,
  { t } = useI18n();

const clickAI = () => {
    $q.dialog({
      component: VAiDialog,
      componentProps: { persistent },
    }).onOk((openAI) => {
      mainStore.openAI = openAI;
    });
  },
  clickDomain = () => {
    $q.dialog({
      cancel,
      message: t("Enter a valid domain name:"),
      persistent,
      prompt: {
        isValid: (val) =>
          !val ||
          /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/.test(
            val,
          ),
        model: domain.value,
      },
      title: t("Domain"),
    }).onOk((value: string) => {
      domain.value = value;
      void putObject("CNAME", domain.value, "text/plain");
      void putSitemap();
      void putPages();
    });
  },
  clickRobots = async () => {
    const title = "robots.txt";
    $q.dialog({
      cancel,
      message: t(
        "Robots.txt is a text file that contains site indexing parameters for the search engine robots",
      ),
      persistent,
      prompt: { model: await getObjectText(title, cache), type: "textarea" },
      title,
    }).onOk((data: string) => {
      void putObject(title, data, "text/plain");
    });
  };
</script>
