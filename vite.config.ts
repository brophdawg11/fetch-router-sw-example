import type { UserConfig } from "vite";

export default {
  build: {
    outDir: "dist",
    assetsDir: "./",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: "index.html",
        sw: "src/sw.tsx",
      },
      output: [
        {
          entryFileNames: ({ name }) =>
            name === "sw" ? "[name].js" : "[name]-[hash].js",
        },
      ],
    },
  },
  server: {
    proxy: {
      "/sw.js": {
        target: "http://localhost:5173/dist/sw.js",
        rewrite: () => "http://localhost:5173/dist/sw.js",
      },
    },
  },
} satisfies UserConfig;
