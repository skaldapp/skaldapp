import type { TCredential } from "@skaldapp/shared";

import { acceptHMRUpdate, defineStore } from "pinia";

export const useMainStore = defineStore("skald", {
  state: () => ({
    apiKey: "",
    credential: {} as Record<string, TCredential>,
    leftDrawer: false,
    rightDrawer: false,
    selected: "",
  }),
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot));
