import type { TCredential, TOpenAI } from "@skaldapp/shared";

import { acceptHMRUpdate, defineStore } from "pinia";

const apiKey = "",
  credential: Record<string, TCredential> = {},
  leftDrawer = false,
  openAI: TOpenAI = { apiKey: "", baseURL: "", endpoint: "", model: "" },
  rightDrawer = false,
  selected = "";
export const useMainStore = defineStore("skald", {
  state: () => ({
    apiKey,
    credential,
    leftDrawer,
    openAI,
    rightDrawer,
    selected,
  }),
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot));
