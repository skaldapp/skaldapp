import { createMemoryHistory, createRouter } from "vue-router";

import { defineRouter } from "#q-app";

import routes from "./routes";

const history = createMemoryHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE);

export default defineRouter(() => createRouter({ history, routes }));
