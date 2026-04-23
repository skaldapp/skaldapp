import { createMemoryHistory, createRouter } from "vue-router";

import { defineRouter } from "#q-app/wrappers";

import routes from "./routes";

const history = createMemoryHistory(process.env.VUE_ROUTER_BASE);

export default defineRouter(() => createRouter({ history, routes }));
