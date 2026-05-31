import type { TCredential, TOpenAI } from "@skaldapp/shared";

import { acceptHMRUpdate, defineStore } from "pinia";

const credential: Record<string, TCredential> = {},
  openAI: TOpenAI = { apiKey: "", baseURL: "", endpoint: "", model: "" };
export const useMainStore = defineStore("skald", {
  state: () => ({ credential, openAI }),
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot));
