import { defineBoot } from "#q-app/wrappers";
import { sharedStore } from "@skaldapp/shared";
import routes from "src/router/routes";
import { ioStore } from "stores/io";
import { useMainStore } from "stores/main";
import { toRef } from "vue";

const [route] = routes,
  mainStore = useMainStore(),
  tree = toRef(sharedStore, "tree");

export default defineBoot(({ router }) => {
  router.beforeEach(({ path }, _from, next) => {
    if (["/", "/main"].includes(path)) next();
    else next("/");
    if (path === "/" && route) {
      ioStore.bucket = "";
      mainStore.selected = "";
      tree.value.length = 0;
      router.clearRoutes();
      router.addRoute(route);
    }
  });
});
