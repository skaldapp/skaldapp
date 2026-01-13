import { defineStore } from "#q-app/wrappers";
import { Base64, Utf8 } from "crypto-es";
import { createPinia } from "pinia";
import { storePlugin } from "pinia-plugin-store";

const decrypt = (value: string): string => Base64.parse(value).toString(Utf8),
  encrypt = (value: string): string => Base64.stringify(Utf8.parse(value));

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module "pinia" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface PiniaCustomProperties {
    // add your custom properties here, if any
  }
}

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia();
  pinia.use(storePlugin({ decrypt, encrypt, stores: ["main"] }));
  return pinia;
});
