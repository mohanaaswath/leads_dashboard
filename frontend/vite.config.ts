import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/leads_dashboard/",
  plugins: [react()],
});
