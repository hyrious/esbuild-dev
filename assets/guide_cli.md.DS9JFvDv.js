import{_ as s,o as i,c as a,R as e}from"./chunks/framework.lN0IFf_r.js";const u=JSON.parse('{"title":"Command Line","description":"","frontmatter":{},"headers":[],"relativePath":"guide/cli.md","filePath":"guide/cli.md"}'),n={name:"guide/cli.md"},t=e(`<h1 id="command-line" tabindex="-1">Command Line <a class="header-anchor" href="#command-line" aria-label="Permalink to &quot;Command Line&quot;">​</a></h1><h2 id="run-file" tabindex="-1">Run File <a class="header-anchor" href="#run-file" aria-label="Permalink to &quot;Run File&quot;">​</a></h2><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> esbuild-dev</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main.ts</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># build and run main.ts in esm format</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> esbuild-dev</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --cjs</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main.ts</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># build and run main.ts in cjs format</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> esbuild-dev</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --watch</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main.ts</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># build and run main.ts, if the file changes, rebuild and run again</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># shorthand: -w</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> esbuild-dev</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p:./plugin.ts</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main.ts</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># build and run main.ts, with plugin from file ./plugin.ts</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># longhand: --plugin</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> esbuild-dev</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --loader</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main.ts</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># run main.ts with esm loader</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># in this mode, --cjs, --watch and --plugin are not supported.</span></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">How <code>esbuild-dev</code> handle flags</p><p>To make it easy to understand and use, <code>esbuild-dev</code> related arguments should be put <strong>before</strong> the entry file name. The full grammar is as follows:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> esbuild-dev</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [ </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">esbuild-dev</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> flags</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> esbuild</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> flags</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> args</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ]</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> entry.ts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [ </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">args</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ]</span></span></code></pre></div></div><div class="tip custom-block"><p class="custom-block-title">Include a third-party library if it does not work natively</p><p>In rare cases you can see error when you do <code>esbuild-dev --cjs main.ts</code> and you&#39;re importing an ESM only package through <code>require()</code>. There&#39;re 2 ways to handle it:</p><ul><li><p>Use ESM format to import it, i.e. <code>import()</code>.</p></li><li><p>Use <code>--include:pkg</code> flag in esbuild-dev, e.g.</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> esbuild-dev</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --include:has</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --include:function-bind</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> test/include.ts</span></span></code></pre></div></li></ul></div><h3 id="plugin-details" tabindex="-1">Plugin Details <a class="header-anchor" href="#plugin-details" aria-label="Permalink to &quot;Plugin Details&quot;">​</a></h3><p>The plugin argument in command line shares the same semantic as <a href="https://rollupjs.org/guide/en/#-p-plugin---plugin-plugin" target="_blank" rel="noreferrer">rollup</a>. The first character of the plugin name is used to look up the plugin.</p><ul><li><p><code>[@a-z0-9-~]</code>: the plugin is from a package.</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">&quot;-p:esbuild-plugin-style&quot;</span></span></code></pre></div></li><li><p><code>[./]</code>: the plugin is from a disk path.</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">&quot;-p:./plugin.ts&quot;</span></span></code></pre></div></li><li><p><code>{</code>: the plugin is from evaluating the string, this way, you can not write it as a function (which often starts with <code>function</code> or <code>() =&gt;</code>).</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">&quot;-p:{ let a = 1; return a }&quot;</span></span></code></pre></div></li></ul><p>You can pass exactly one argument to the plugin by appending <code>=arg</code> to the plugin name.</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">&quot;-p:pluginName={ answer: 42 }&quot;</span></span></code></pre></div><p>↑ It means to use the plugin by calling <code>pluginName({ answer: 42 })</code>.</p><h2 id="show-external" tabindex="-1">Show External <a class="header-anchor" href="#show-external" aria-label="Permalink to &quot;Show External&quot;">​</a></h2><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> esbuild-dev</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> external</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> src/index.ts</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># show external dependencies of src/index.ts</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> esbuild-dev</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> external</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -b</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> src/index.ts</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># use &quot;bare&quot; format: one name per line</span></span></code></pre></div><p>See the API <a href="./api.html#external">external</a> for more details.</p><h2 id="debug" tabindex="-1">Debug <a class="header-anchor" href="#debug" aria-label="Permalink to &quot;Debug&quot;">​</a></h2><p>Anyway, when you get a syntax/runtime error, you can look at the <code>node_modules/.esbuild-dev</code> folder to see bundled scripts.</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> esbuild-dev</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> temp</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># print full path to the &#39;.esbuild-dev&#39; folder from current place</span></span></code></pre></div>`,17),l=[t];function p(h,d,o,k,r,c){return i(),a("div",null,l)}const F=s(n,[["render",p]]);export{u as __pageData,F as default};
