import { defineRouter } from "#q-app/wrappers";
import { createMemoryHistory, createRouter } from "vue-router";

import routes from "./routes";

const history = createMemoryHistory(process.env.VUE_ROUTER_BASE);

export default defineRouter(() => createRouter({ history, routes }));
