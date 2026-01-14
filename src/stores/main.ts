import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";

export const useMainStore = defineStore("skald", () => {
  const apiKey = ref(""),
    leftDrawer = ref(false),
    rightDrawer = ref(false),
    selected = ref("");

  return {
    apiKey,
    leftDrawer,
    rightDrawer,
    selected,
  };
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot));
