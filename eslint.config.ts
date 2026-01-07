import shared from "@skaldapp/configs/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(shared, {
  languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
});
