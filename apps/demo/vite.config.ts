import { defineConfig, type Plugin } from "vite";
import { resolve } from "path";

/** Library build skips root HTML; HMS page lives in public/ → dist. Redirect `/` in dev. */
function redirectRootToIndex(): Plugin {
  return {
    name: "demo-root-to-index",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (url === "/") {
          res.statusCode = 302;
          res.setHeader("Location", "/index.html");
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [redirectRootToIndex()],
  build: {
    lib: {
      entry: resolve(__dirname, "embed.ts"),
      name: "EchoWidget",
      fileName: "widget",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
  server: {
    port: 3003,
    open: "/",
  },
});
