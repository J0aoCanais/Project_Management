import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// Para onde o servidor de dev reencaminha os pedidos ao Flask. No Docker Compose,
// API_PROXY_TARGET=http://web:8000 (o nome do serviço); fora do Docker, o Flask local.

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiTarget = env.API_PROXY_TARGET || "http://localhost:8000";
  const toFlask = { target: apiTarget };

  return {
    plugins: [react(), tailwindcss()],

    // Build: Flask serves the files from /static/dist/. Dev: served from the root.
    base: command === "build" ? "/static/dist/" : "/",

    server: {
      host: true,                      // listen on 0.0.0.0 so Docker can publish the port
      port: 5173,
      strictPort: true,
      watch: { usePolling: true },     // file events don't cross Windows bind mounts
      proxy: {
        // O browser só fala com :5173. A API, o login e o token CSRF vão para o Flask,
        // para haver uma só origem (e o cookie da sessão servir para os dois).
        "/api": toFlask,
        "/login": toFlask,
        "/logout": toFlask,
        "/csrf-token": toFlask,
        "/static": toFlask,
      },
    },

    build: {
      outDir: "../app/static/dist",    // Flask's static folder
      emptyOutDir: true,
    }
  };
});
