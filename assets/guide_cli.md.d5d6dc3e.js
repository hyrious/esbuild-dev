import{_ as n,c as a,o as s,a as e}from"./app.7d12be29.js";const m=JSON.parse('{"title":"Command Line","description":"","frontmatter":{},"headers":[{"level":2,"title":"Run File","slug":"run-file"},{"level":3,"title":"Plugin Details","slug":"plugin-details"},{"level":2,"title":"Show External","slug":"show-external"}],"relativePath":"guide/cli.md"}'),l={name:"guide/cli.md"},i=e(`<h1 id="command-line" tabindex="-1">Command Line <a class="header-anchor" href="#command-line" aria-hidden="true">#</a></h1><h2 id="run-file" tabindex="-1">Run File <a class="header-anchor" href="#run-file" aria-hidden="true">#</a></h2><div class="language-bash"><span class="copy"></span><pre><code><span class="line"><span style="color:#A6ACCD;">$ esbuild-dev main.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># build and run main.ts in esm format</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">$ esbuild-dev --cjs main.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># build and run main.ts in cjs format</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">$ esbuild-dev --watch main.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># build and run main.ts, if the file changes, rebuild and run again</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># shorthand: -w</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">$ esbuild-dev -p:./plugin.ts main.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># build and run main.ts, with plugin from file ./plugin.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># longhand: --plugin</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">$ esbuild-dev --loader main.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># run main.ts with esm loader</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># in this mode, --cjs, --watch and --plugin are not supported.</span></span>
<span class="line"></span></code></pre></div><h3 id="plugin-details" tabindex="-1">Plugin Details <a class="header-anchor" href="#plugin-details" aria-hidden="true">#</a></h3><p>The plugin argument in command line shares the same semantic as <a href="https://rollupjs.org/guide/en/#-p-plugin---plugin-plugin" target="_blank" rel="noopener noreferrer">rollup</a>. The first character of the plugin name is used to look up the plugin.</p><ul><li><code>[@a-z0-9-~]</code>: the plugin is from a package.</li><li><code>[./]</code>: the plugin is from a disk path.</li><li><code>{</code>: the plugin is from evaluating the string, this way, you can not write it as a function (which often starts with <code>function</code> or <code>() =&gt;</code>).</li></ul><p>You can pass exactly one argument to the plugin by appending <code>=arg</code> to the plugin name.</p><div class="language-bash"><span class="copy"></span><pre><code><span class="line"><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">-p:pluginName={ answer: 42 }</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"></span></code></pre></div><p>\u2191 It means to use the plugin by calling <code>pluginName({ answer: 42 })</code>.</p><h2 id="show-external" tabindex="-1">Show External <a class="header-anchor" href="#show-external" aria-hidden="true">#</a></h2><div class="language-bash"><span class="copy"></span><pre><code><span class="line"><span style="color:#A6ACCD;">$ esbuild-dev external src/index.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># show external dependencies of src/index.ts</span></span>
<span class="line"></span>
<span class="line"><span style="color:#A6ACCD;">$ esbuild-dev external -b src/index.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># use &quot;bare&quot; format: one name per line</span></span>
<span class="line"></span></code></pre></div><p>See the API <a href="./api.html#external">external</a> for more details.</p>`,12),t=[i];function p(o,c,r,d,u,h){return s(),a("div",null,t)}var f=n(l,[["render",p]]);export{m as __pageData,f as default};
