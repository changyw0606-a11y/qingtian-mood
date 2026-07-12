import { defineConfig } from "vite";import react from "@vitejs/plugin-react";
export default defineConfig({root:__dirname,base:"./",plugins:[react()],build:{outDir:"../pwa-dist",emptyOutDir:true}});
