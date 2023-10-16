import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
  },
  build: {
    commonjsOptions: {
      ignoreTryCatch: id => id !== 'stream',
    },
  },
  resolve: {

    alias: {

      process: "process/browser",

      "@": path.resolve(__dirname, "./src/"),

      "@apis": path.resolve(__dirname, "./src/apis"),

      "@routes": `${path.resolve(__dirname, "./src/routes/")}`,

      "@services": `${path.resolve(__dirname, "./src/services/")}`,

      "@components": `${path.resolve(__dirname, "./src/components/")}`,

      "@assets": `${path.resolve(__dirname, "./src/assets/")}`,

      "@pages": `${path.resolve(__dirname, "./src/pages/")}`,

      "@utils": `${path.resolve(__dirname, "./src/utils/")}`,

      "@columnTitles": `${path.resolve(__dirname, "./src/config/columns/entitiesTitle/")}`,


        }}
})
