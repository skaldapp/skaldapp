import type { TCredentials, TOpenAI } from "@skaldapp/shared";

import { acceptHMRUpdate, defineStore } from "pinia";

const credentials: Record<string, TCredentials> = {},
  openAI: TOpenAI = { apiKey: "", baseURL: "", endpoint: "", model: "" };
export const useMainStore = defineStore("skald", {
  state: () => ({ credentials, openAI }),
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot));
