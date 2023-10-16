// vite.config.ts
import { defineConfig } from "file:///D:/Apps%20and%20files/Files/Th%E1%BB%B1c%20t%E1%BA%ADp/Baitap/QLCP/qlcp-react/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Apps%20and%20files/Files/Th%E1%BB%B1c%20t%E1%BA%ADp/Baitap/QLCP/qlcp-react/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "D:\\Apps and files\\Files\\Th\u1EF1c t\u1EADp\\Baitap\\QLCP\\qlcp-react";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 8e3
  },
  build: {
    commonjsOptions: {
      ignoreTryCatch: (id) => id !== "stream"
    }
  },
  resolve: {
    alias: {
      process: "process/browser",
      "@": path.resolve(__vite_injected_original_dirname, "./src/"),
      "@routes": `${path.resolve(__vite_injected_original_dirname, "./src/routes/")}`,
      "@services": `${path.resolve(__vite_injected_original_dirname, "./src/services/")}`,
      "@components/BasePage": `${path.resolve(__vite_injected_original_dirname, "./src/components/")}`,
      "@assets": `${path.resolve(__vite_injected_original_dirname, "./src/assets/")}`,
      "@pages": `${path.resolve(__vite_injected_original_dirname, "./src/pages/")}`,
      "@utils": `${path.resolve(__vite_injected_original_dirname, "./src/utils/")}`,
      "@columnTitles": `${path.resolve(__vite_injected_original_dirname, "./src/config/columns/entitiesTitle/")}`
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxBcHBzIGFuZCBmaWxlc1xcXFxGaWxlc1xcXFxUaFx1MUVGMWMgdFx1MUVBRHBcXFxcQmFpdGFwXFxcXFFMQ1BcXFxccWxjcC1yZWFjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcQXBwcyBhbmQgZmlsZXNcXFxcRmlsZXNcXFxcVGhcdTFFRjFjIHRcdTFFQURwXFxcXEJhaXRhcFxcXFxRTENQXFxcXHFsY3AtcmVhY3RcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0FwcHMlMjBhbmQlMjBmaWxlcy9GaWxlcy9UaCVFMSVCQiVCMWMlMjB0JUUxJUJBJUFEcC9CYWl0YXAvUUxDUC9xbGNwLXJlYWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDgwMDAsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgY29tbW9uanNPcHRpb25zOiB7XHJcbiAgICAgIGlnbm9yZVRyeUNhdGNoOiBpZCA9PiBpZCAhPT0gJ3N0cmVhbScsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG5cclxuICAgIGFsaWFzOiB7XHJcblxyXG4gICAgICBwcm9jZXNzOiBcInByb2Nlc3MvYnJvd3NlclwiLFxyXG5cclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvXCIpLFxyXG5cclxuICAgICAgXCJAcm91dGVzXCI6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvcm91dGVzL1wiKX1gLFxyXG5cclxuICAgICAgXCJAc2VydmljZXNcIjogYCR7cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9zZXJ2aWNlcy9cIil9YCxcclxuXHJcbiAgICAgIFwiQGNvbXBvbmVudHNcIjogYCR7cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9jb21wb25lbnRzL1wiKX1gLFxyXG5cclxuICAgICAgXCJAYXNzZXRzXCI6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvYXNzZXRzL1wiKX1gLFxyXG5cclxuICAgICAgXCJAcGFnZXNcIjogYCR7cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9wYWdlcy9cIil9YCxcclxuXHJcbiAgICAgIFwiQHV0aWxzXCI6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvdXRpbHMvXCIpfWAsXHJcblxyXG4gICAgICBcIkBjb2x1bW5UaXRsZXNcIjogYCR7cGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9jb25maWcvY29sdW1ucy9lbnRpdGllc1RpdGxlL1wiKX1gLFxyXG5cclxuXHJcbiAgICAgICAgfX1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyWCxTQUFTLG9CQUFvQjtBQUN4WixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsaUJBQWlCO0FBQUEsTUFDZixnQkFBZ0IsUUFBTSxPQUFPO0FBQUEsSUFDL0I7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFFUCxPQUFPO0FBQUEsTUFFTCxTQUFTO0FBQUEsTUFFVCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxRQUFRO0FBQUEsTUFFckMsV0FBVyxHQUFHLEtBQUssUUFBUSxrQ0FBVyxlQUFlLENBQUM7QUFBQSxNQUV0RCxhQUFhLEdBQUcsS0FBSyxRQUFRLGtDQUFXLGlCQUFpQixDQUFDO0FBQUEsTUFFMUQsZUFBZSxHQUFHLEtBQUssUUFBUSxrQ0FBVyxtQkFBbUIsQ0FBQztBQUFBLE1BRTlELFdBQVcsR0FBRyxLQUFLLFFBQVEsa0NBQVcsZUFBZSxDQUFDO0FBQUEsTUFFdEQsVUFBVSxHQUFHLEtBQUssUUFBUSxrQ0FBVyxjQUFjLENBQUM7QUFBQSxNQUVwRCxVQUFVLEdBQUcsS0FBSyxRQUFRLGtDQUFXLGNBQWMsQ0FBQztBQUFBLE1BRXBELGlCQUFpQixHQUFHLEtBQUssUUFBUSxrQ0FBVyxxQ0FBcUMsQ0FBQztBQUFBLElBR2hGO0FBQUEsRUFBQztBQUNULENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
