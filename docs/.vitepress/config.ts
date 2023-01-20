import { defineConfig } from "vitepress";

export default defineConfig({
  title: "@hyrious/esbuild-dev",
  description: "A simple wrapper of esbuild to run your script file.",
  base: "/esbuild-dev/",
  themeConfig: {
    socialLinks: [{ icon: "github", link: "https://github.com/hyrious/esbuild-dev" }],

    editLink: {
      pattern: "https://github.com/hyrious/esbuild-dev/edit/main/docs/:path",
    },

    nav: [{ text: "Guide", link: "/", activeMatch: "^/$|^/guide/" }],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What it do?", link: "/" },
          { text: "Command Line", link: "/guide/cli" },
        ],
      },
      {
        text: "Advanced",
        items: [{ text: "API Reference", link: "/guide/api" }],
      },
    ],

    outline: "deep",
  },
});
