import{_ as s,c as a,o as n,a as l}from"./app.d274be3d.js";const h=JSON.parse('{"title":"Command Line","description":"","frontmatter":{},"headers":[{"level":2,"title":"Run File","slug":"run-file","link":"#run-file","children":[{"level":3,"title":"Plugin Details","slug":"plugin-details","link":"#plugin-details","children":[]}]},{"level":2,"title":"Show External","slug":"show-external","link":"#show-external","children":[]},{"level":2,"title":"Debug","slug":"debug","link":"#debug","children":[]}],"relativePath":"guide/cli.md"}'),e={name:"guide/cli.md"},o=l(`<h1 id="command-line" tabindex="-1">Command Line <a class="header-anchor" href="#command-line" aria-hidden="true">#</a></h1><h2 id="run-file" tabindex="-1">Run File <a class="header-anchor" href="#run-file" aria-hidden="true">#</a></h2><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#FFCB6B;">$</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">esbuild-dev</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">main.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># build and run main.ts in esm format</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">$</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">esbuild-dev</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--cjs</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">main.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># build and run main.ts in cjs format</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">$</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">esbuild-dev</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--watch</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">main.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># build and run main.ts, if the file changes, rebuild and run again</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># shorthand: -w</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">$</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">esbuild-dev</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">-p:./plugin.ts</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">main.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># build and run main.ts, with plugin from file ./plugin.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># longhand: --plugin</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">$</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">esbuild-dev</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--loader</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">main.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># run main.ts with esm loader</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># in this mode, --cjs, --watch and --plugin are not supported.</span></span>
<span class="line"></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">How <code>esbuild-dev</code> handle flags</p><p>To make it easy to understand and use, <code>esbuild-dev</code> related arguments should be put <strong>before</strong> the entry file name. The full grammar is as follows:</p><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#FFCB6B;">$</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">esbuild-dev</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> esbuild-dev flags </span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> esbuild flags </span><span style="color:#89DDFF;">|</span><span style="color:#A6ACCD;"> args </span><span style="color:#89DDFF;">]</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">entry.ts</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">[</span><span style="color:#A6ACCD;"> args </span><span style="color:#89DDFF;">]</span></span>
<span class="line"></span></code></pre></div></div><div class="tip custom-block"><p class="custom-block-title">Include a third-party library if it does not work natively</p><p>In rare cases you can see error when you do <code>esbuild-dev --cjs main.ts</code> and you&#39;re importing an ESM only package through <code>require()</code>. There&#39;re 2 ways to handle it:</p><ul><li><p>Use ESM format to import it, i.e. <code>import()</code>.</p></li><li><p>Use <code>--include:pkg</code> flag in esbuild-dev, e.g.</p><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#FFCB6B;">$</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">esbuild-dev</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--include:has</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">--include:function-bind</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">test/include.ts</span></span>
<span class="line"></span></code></pre></div></li></ul></div><h3 id="plugin-details" tabindex="-1">Plugin Details <a class="header-anchor" href="#plugin-details" aria-hidden="true">#</a></h3><p>The plugin argument in command line shares the same semantic as <a href="https://rollupjs.org/guide/en/#-p-plugin---plugin-plugin" target="_blank" rel="noreferrer">rollup</a>. The first character of the plugin name is used to look up the plugin.</p><ul><li><p><code>[@a-z0-9-~]</code>: the plugin is from a package.</p><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">-p:esbuild-plugin-style</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"></span></code></pre></div></li><li><p><code>[./]</code>: the plugin is from a disk path.</p><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">-p:./plugin.ts</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"></span></code></pre></div></li><li><p><code>{</code>: the plugin is from evaluating the string, this way, you can not write it as a function (which often starts with <code>function</code> or <code>() =&gt;</code>).</p><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">-p:{ let a = 1; return a }</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"></span></code></pre></div></li></ul><p>You can pass exactly one argument to the plugin by appending <code>=arg</code> to the plugin name.</p><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#89DDFF;">&quot;</span><span style="color:#C3E88D;">-p:pluginName={ answer: 42 }</span><span style="color:#89DDFF;">&quot;</span></span>
<span class="line"></span></code></pre></div><p>↑ It means to use the plugin by calling <code>pluginName({ answer: 42 })</code>.</p><h2 id="show-external" tabindex="-1">Show External <a class="header-anchor" href="#show-external" aria-hidden="true">#</a></h2><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-palenight"><code><span class="line"><span style="color:#FFCB6B;">$</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">esbuild-dev</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">external</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">src/index.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># show external dependencies of src/index.ts</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFCB6B;">$</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">esbuild-dev</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">external</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">-b</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">src/index.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># use &quot;bare&quot; format: one name per line</span></span>
<span class="line"></span></code></pre></div><p>See the API <a href="./api.html#external">external</a> for more details.</p><h2 id="debug" tabindex="-1">Debug <a class="header-anchor" href="#debug" aria-hidden="true">#</a></h2><p>Anyway, when you get a syntax/runtime error, you can look at the <code>node_modules/.esbuild-dev</code> folder to see bundled scripts.</p>`,16),p=[o];function t(i,c,r,d,u,y){return n(),a("div",null,p)}const g=s(e,[["render",t]]);export{h as __pageData,g as default};
