import shared from "@vuebro/configs/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(shared, {
  languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
});
