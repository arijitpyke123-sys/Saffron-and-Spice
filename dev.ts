import { startServer } from "./server.js";
import { createServer as createViteServer } from "vite";

async function runDevServer() {
  const app = await startServer();
  
  console.log("Initializing Vite middleware for local development...");
  
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  
  app.use(vite.middlewares);
  
  console.log("Vite middleware attached.");
}

runDevServer().catch(err => {
  console.error("Failed to start dev server:", err);
});
