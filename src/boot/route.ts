import { sharedStore } from "@skaldapp/shared";
import { storeToRefs } from "pinia";
import routes from "src/router/routes";
import { useDataStore } from "stores/data";
import { useIoStore } from "stores/io";
import { toRefs } from "vue";

import { defineBoot } from "#q-app/wrappers";

const [route] = routes,
  dataStore = useDataStore(),
  ioStore = useIoStore(),
  { reset } = ioStore,
  { selected } = storeToRefs(dataStore),
  { tree } = toRefs(sharedStore);

export default defineBoot(({ router }) => {
  router.beforeEach(({ path }) => {
    if (path === "/" && route) {
      reset();
      selected.value = "";
      tree.value.length = 0;
      router.clearRoutes();
      router.addRoute(route);
    }
    if (["/", "/main"].includes(path)) return undefined;
    else return "/";
  });
});
