<template lang="pug">
.scroll.q-pa-md.col.self-stretch
  q-chat-message(
    v-for="({ parts, role, id }, index) in messages",
    :key="id",
    ref="chatMessages",
    :sent="role === 'user'"
  )
    q-markdown(
      v-for="part in parts.filter((part) => part.type === 'text')",
      :key="part.type",
      content-class="line-height-2 min-h-16 no-scroll select-text",
      no-heading-anchor-links,
      no-line-numbers,
      :plugins,
      show-copy,
      :src="part.text"
    )
    template(#stamp)
      q-spinner-dots(
        v-if="index === messages.length - 1 && ['submitted', 'streaming'].includes(status)",
        size="md"
      )
  q-banner.text-white.bg-red(
    v-if="error",
    ref="errorBanner",
    dense,
    inline-actions,
    rounded
  ) {{ error?.message }}
    template(#action)
      q-btn(color="white", flat, icon="replay", @click="regenerate()")
q-input.q-ma-md(
  ref="input",
  v-model="message",
  autofocus,
  autogrow,
  class="max-h-1/3",
  :disable="['submitted', 'streaming'].includes(status)",
  input-class="max-h-full",
  :label="t('How can I help you today?')",
  @keydown.enter="!$event.shiftKey && ($event.preventDefault(), send())"
)
  template(#after)
    q-btn(
      v-if="!['submitted', 'streaming'].includes(status)",
      dense,
      flat,
      icon="send",
      round,
      @click="send"
    )
    q-btn(v-else, dense, flat, icon="stop_circle", round, @click="stop")
</template>
<script setup lang="ts">
import type { ChatTransport, LanguageModel, UIMessage } from "ai";
import type { QInput } from "quasar";
import type { ComponentPublicInstance } from "vue";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { useChat } from "@ai-sdk/vue";
import { whenever } from "@vueuse/core";
import { convertToModelMessages, streamText, toUIMessageStream } from "ai";
import abbreviation from "markdown-it-abbr";
import deflist from "markdown-it-deflist";
import { full as emoji } from "markdown-it-emoji";
import footnote from "markdown-it-footnote";
import insert from "markdown-it-ins";
import mark from "markdown-it-mark";
import subscript from "markdown-it-sub";
import superscript from "markdown-it-sup";
import taskLists from "markdown-it-task-lists";
import { storeToRefs } from "pinia";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";

import { useDataStore } from "@/stores/data";
import { deep, immediate } from "@/stores/defaults";
import { useMainStore } from "@/stores/main";

class CustomChatTransport implements ChatTransport<UIMessage> {
  private model: LanguageModel | undefined;
  constructor(model?: LanguageModel) {
    this.model = model;
  }
  reconnectToStream() {
    return Promise.resolve(null);
  }
  async sendMessages({
    messages,
  }: Parameters<ChatTransport<UIMessage>["sendMessages"]>[0]) {
    if (this.model)
      return toUIMessageStream(
        streamText({
          messages: await convertToModelMessages(messages),
          model: this.model,
        }),
      );
    else throw new Error("The model is not defined.");
  }
  updateModel(model: LanguageModel | undefined) {
    this.model = model;
  }
}

const block = "end",
  chatMessages = useTemplateRef<ComponentPublicInstance[]>("chatMessages"),
  dataStore = useDataStore(),
  errorBanner = useTemplateRef<ComponentPublicInstance>("errorBanner"),
  input = useTemplateRef<QInput>("input"),
  mainStore = useMainStore(),
  message = ref(""),
  name = "chat",
  plugins = [
    abbreviation,
    deflist,
    emoji,
    footnote,
    insert,
    mark,
    subscript,
    superscript,
    taskLists,
  ],
  transport = new CustomChatTransport(),
  { error, messages, regenerate, sendMessage, status, stop } = useChat({
    transport,
  }),
  { openAI } = storeToRefs(mainStore),
  { rightDrawer } = storeToRefs(dataStore),
  { t } = useI18n();

const lastMessage = computed(() => messages.value[messages.value.length - 1]),
  send = () => {
    if (["error", "ready"].includes(status.value)) {
      void sendMessage({ text: message.value });
      message.value = "";
    }
  };

watch(
  openAI,
  ({ apiKey, baseURL, model }) => {
    transport.updateModel(
      apiKey && baseURL && model
        ? createOpenAICompatible({ apiKey, baseURL, name })(model)
        : undefined,
    );
  },
  { deep, immediate },
);

watch(lastMessage, async () => {
  await nextTick();
  chatMessages.value?.[chatMessages.value.length - 1]?.$el.scrollIntoView({
    block,
  });
});

watch(error, async (value) => {
  if (value) {
    await nextTick();
    errorBanner.value?.$el.scrollIntoView({
      block,
    });
  }
});

whenever(rightDrawer, () => {
  input.value?.focus();
});
</script>

<style scoped>
:deep(.q-message-container) > div {
  width: 100%;
}
:deep(.line-height-2) {
  line-height: 2;
}
:deep(.min-h-16) {
  min-height: 4rem;
}
:deep(.select-text) {
  user-select: text;
}
</style>
