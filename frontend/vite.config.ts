import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Where the dev server forwards /api calls. In Docker Compose set
// API_PROXY_TARGET=http://web:8000 (the Flask service name).

export default defineConfig(({ command, mode }) => {
  const apiTarget = "http://web:8000";

  return {
    plugins: [react()],

    // Build: Flask serves the files from /static/dist/. Dev: served from the root.
    base: command === "build" ? "/static/dist/" : "/",

    server: {
      host: true,                      // listen on 0.0.0.0 so Docker can publish the port
      port: 5173,
      strictPort: true,
      watch: { usePolling: true },     // file events don't cross Windows bind mounts
      proxy: {
        // The browser only ever talks to :5173; /api goes to Flask, so there is one origin.
        "/api": { target: apiTarget },
      },
    },

    build: {
      outDir: "../app/static/dist",    // Flask's static folder
      emptyOutDir: true,
    }
  };
});