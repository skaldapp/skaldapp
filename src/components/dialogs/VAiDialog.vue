<template lang="pug">
q-dialog(ref="dialogRef", @hide="onDialogHide")
  q-card.q-dialog-plugin
    q-card-section.q-dialog__title Generic OpenAI
    q-card-section.q-dialog__message Connect to any OpenAI-compatible service via a custom configuration
    q-card-section
      q-banner.text-white.bg-warning(rounded)
        template(#avatar)
          q-icon(color="white", name="warning_amber")
        | {{ t(`Leave the FIM Endpoint field blank if the LLM doesn't support Fill-in-the-Middle`) }}
    q-card-section.q-gutter-y-md
      .q-gutter-x-sm.row
        q-input.col-grow(
          ref="refBaseURL",
          v-model.trim="baseURL",
          dense,
          :hint="hint[0]",
          label="Base URL",
          :rules="[(val) => !!val || (hint[0] ?? '')]"
        )
        q-input(
          v-model.trim="endpoint",
          dense,
          hint="eg: completions",
          label="FIM Endpoint"
        )
          template(#before) /
      q-input(
        ref="refModel",
        v-model.trim="model",
        :hint="hint[1]",
        label="Chat Model Name",
        :rules="[(val) => !!val || (hint[1] ?? '')]"
      )
        template(#prepend)
          q-icon(name="precision_manufacturing")
      q-input(
        ref="refApiKey",
        v-model.trim="apiKey",
        :hint="hint[2]",
        label="API Key",
        :rules="[(val) => !!val || (hint[2] ?? '')]",
        :type="isPwd ? 'password' : 'text'"
      )
        template(#prepend)
          q-icon(name="key")
        template(#append)
          q-icon.cursor-pointer(
            :name="isPwd ? 'visibility_off' : 'visibility'",
            @click="isPwd = !isPwd"
          )
    q-card-actions(align="right")
      q-btn(color="primary", flat, label="Cancel", @click="onDialogCancel")
      q-btn(
        color="primary",
        flat,
        label="Ok",
        @click="onDialogOK({ apiKey, model, baseURL, endpoint })"
      )
</template>

<script setup lang="ts">
import type { QInput } from "quasar";

import { useDialogPluginComponent } from "quasar";
import { useMainStore } from "stores/main";
import { ref, useTemplateRef, watchEffect } from "vue";
import { useI18n } from "vue-i18n";

const mainStore = useMainStore(),
  apiKey = ref(mainStore.openAI.apiKey),
  baseURL = ref(mainStore.openAI.baseURL),
  endpoint = ref(mainStore.openAI.endpoint),
  { t } = useI18n(),
  hint = [
    "eg: https://api.openai.com/v1",
    t("Model id used for chat requests"),
    t("Paste API Key only on a trusted computer"),
  ],
  isPwd = ref(true),
  model = ref(mainStore.openAI.model),
  refApiKey = useTemplateRef<QInput>("refApiKey"),
  refBaseURL = useTemplateRef<QInput>("refBaseURL"),
  refModel = useTemplateRef<QInput>("refModel"),
  { dialogRef, onDialogCancel, onDialogHide, onDialogOK } =
    useDialogPluginComponent();

watchEffect(() => {
  void Promise.all([
    refApiKey.value?.validate(),
    refBaseURL.value?.validate(),
    refModel.value?.validate(),
  ]);
});

defineEmits(useDialogPluginComponent.emits);
</script>
