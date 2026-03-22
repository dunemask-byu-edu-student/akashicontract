import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const { AKC_VITE_BACKEND_URL, AKC_VITE_DEV_PORT } = process.env;
const backendUrl = AKC_VITE_BACKEND_URL ?? "http://localhost:52025";
const vitePort = AKC_VITE_DEV_PORT ?? 52000;

export default () => {
  return defineConfig({
    plugins: [react(), tsconfigPaths()],
    server: {
      allowedHosts: ["host.docker.internal"],
      host: "0.0.0.0",
      port: Number(vitePort),
      proxy: {
        "/api": backendUrl,
        "/socket.io": backendUrl,
        "/healthz": backendUrl,
      },
      hmr: {
        protocol: process.env.AKC_VITE_DEV_PROTOCOL,
      },
    },
    build: {
      outDir: "./build/frontend",
    },
    base: process.env.AKC_VITE_BASE_PATH ?? "/",
  });
};
