const guideSidebar = [
  {
    text: "Introduction",
    children: [
      { text: "What it do?", link: "/" },
      { text: "Command Line", link: "/guide/cli" },
    ],
  },
  {
    text: "Advanced",
    children: [{ text: "API Reference", link: "/guide/api" }],
  },
];

export default {
  title: "@hyrious/esbuild-dev",
  description: "A simple wrapper of esbuild to run your script file.",
  base: "/esbuild-dev/",
  themeConfig: {
    repo: "hyrious/esbuild-dev",
    docsDir: "docs",
    editLinks: true,
    lastUpdated: true,

    nav: [{ text: "Guide", link: "/", activeMatch: "^/$|^/guide/" }],

    sidebar: {
      "/guide/": guideSidebar,
      "/": guideSidebar,
    },
  },
};
