import type { TCredential } from "@skaldapp/shared";

import { acceptHMRUpdate, defineStore } from "pinia";

const apiKey = "",
  credential: Record<string, TCredential> = {},
  leftDrawer = false,
  rightDrawer = false,
  selected = "";
export const useMainStore = defineStore("skald", {
  state: () => ({ apiKey, credential, leftDrawer, rightDrawer, selected }),
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot));
