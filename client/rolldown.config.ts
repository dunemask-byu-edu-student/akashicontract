import { defineConfig } from "rolldown";

export default defineConfig({
  input: "build/client/main.js",
  output: { format: "cjs", file: `build/client.bundle.cjs`, minify: true },
  tsconfig: "./tsconfig.json",
  logLevel: "silent",
  platform: "node",
});
