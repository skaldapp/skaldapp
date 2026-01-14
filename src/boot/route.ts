import { defineBoot } from "#q-app/wrappers";
import { sharedStore } from "@skaldapp/shared";
import { storeToRefs } from "pinia";
import routes from "src/router/routes";
import { useIoStore } from "stores/io";
import { useMainStore } from "stores/main";
import { toRefs } from "vue";

const [route] = routes,
  ioStore = useIoStore(),
  mainStore = useMainStore(),
  { reset } = ioStore,
  { selected } = storeToRefs(mainStore),
  { tree } = toRefs(sharedStore);

export default defineBoot(({ router }) => {
  router.beforeEach(({ path }, _from, next) => {
    if (["/", "/main"].includes(path)) next();
    else next("/");
    if (path === "/" && route) {
      reset();
      selected.value = "";
      tree.value.length = 0;
      router.clearRoutes();
      router.addRoute(route);
    }
  });
});
