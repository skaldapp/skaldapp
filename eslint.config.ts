import shared from "@skaldapp/configs/eslint";
import { defineConfig } from "eslint/config";

const tsconfigRootDir = import.meta.dirname,
  parserOptions = { tsconfigRootDir },
  languageOptions = { parserOptions };

export default defineConfig(shared, { languageOptions });
