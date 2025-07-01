import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "src/api/hooks/api.ts",
      "src/api/models/**",
      "src/api/client.ts",
    ],
  },
  {
    rules: {
      "jsx-a11y/alt-text": "off",
    },
  },
];

export default eslintConfig;
