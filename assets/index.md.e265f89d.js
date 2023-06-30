import{_ as e,o as t,c as s,O as o}from"./chunks/framework.c1524e25.js";const f=JSON.parse('{"title":"What it do?","description":"","frontmatter":{},"headers":[],"relativePath":"index.md","filePath":"index.md"}'),a={name:"index.md"},i=o(`<h1 id="what-it-do" tabindex="-1">What it do? <a class="header-anchor" href="#what-it-do" aria-label="Permalink to &quot;What it do?&quot;">​</a></h1><p>A simple wrapper of esbuild to run your script file.</p><h2 id="motivation" tabindex="-1">Motivation <a class="header-anchor" href="#motivation" aria-label="Permalink to &quot;Motivation&quot;">​</a></h2><p>Writing TypeScript is fun, but executing them is not. <code>tsc</code> itself is just a transpiler, it does not support bundling nor executing.</p><p>Now <code>ts-node</code> comes in, it wraps TypeScript compiler and makes use of Node&#39;s <a href="https://nodejs.org/api/modules.html#requireextensions" target="_blank" rel="noreferrer"><code>require.extensions</code></a> to run files, it works fine but does not fully support pure ESM (they will). Besides, invoking type system is also a waste of time when your files become more. Even if you turn-ed off type checking, reading files in node&#39;s single thread is also slow.</p><p>Now, with <a href="https://esbuild.github.io" target="_blank" rel="noreferrer">esbuild</a>, you can bundle your script into one file and run it much faster.</p><div class="language-bash"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#FFCB6B;">$</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">esbuild-dev</span><span style="color:#A6ACCD;"> </span><span style="color:#C3E88D;">script.ts</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># esbuild --bundle script.ts --outfile=node_modules/.esbuild-dev/script.ts.js</span></span>
<span class="line"><span style="color:#676E95;font-style:italic;"># node node_modules/.esbuild-dev/script.ts.js</span></span></code></pre></div><p>That&#39;s it. Simple and naive.</p><p>Originally, I developed this tool to achieve <q>zero <code>*.js</code></q> in some projects.</p><h2 id="alternatives" tabindex="-1">Alternatives <a class="header-anchor" href="#alternatives" aria-label="Permalink to &quot;Alternatives&quot;">​</a></h2><h3 id="tsx" tabindex="-1"><a href="https://github.com/esbuild-kit/tsx" target="_blank" rel="noreferrer"><samp>tsx</samp></a> <a class="header-anchor" href="#tsx" aria-label="Permalink to &quot;[&lt;samp&gt;tsx&lt;/samp&gt;](https://github.com/esbuild-kit/tsx)&quot;">​</a></h3><p>It uses Node&#39;s native <a href="https://nodejs.org/api/modules.html#requireextensions" target="_blank" rel="noreferrer"><code>require.extensions</code></a> for commonjs and <a href="https://nodejs.org/api/esm.html#loaders" target="_blank" rel="noreferrer">loaders</a> for es modules to achieve similar behavior. There are pros and cons in compare it with mine:</p><p>First of all, we&#39;re using different functions in esbuild to transform your ts files to js. <code>tsx</code> uses <code>transform</code>, while I use <code>build</code> with bundle enabled.</p><table><thead><tr><th></th><th><code>tsx</code> (transform)</th><th><code>@hyrious/esbuild-dev</code> (build)</th></tr></thead><tbody><tr><td>Pros</td><td><ul><li>Transforming is lighter than bundling, it may be faster</li><li>Can totally run in memory, cache files are just for further speed up</li></ul></td><td><ul><li>Can use every esbuild build-only features, for example plugins</li><li>Easy to debug because you can find the bundled js file in your disk</li></ul></td></tr><tr><td>Cons</td><td><ul><li>Hard to debug because cache files are minified and named in hash</li><li>Cannot use plugins, but you can chain other node loaders to do similar</li></ul></td><td><ul><li>Cannot totally run in memory, it has to write the result to your disk</li><li>Bundling can be slower when you have lots of files or slow plugins</li></ul></td></tr></tbody></table><p>Note that I also have a loader mode which is a simpler implementation in that it doesn&#39;t hack <code>require.extensions</code> and in most of the cases it is enough to do e.g. unit test with coverage report.</p>`,15),n=[i];function r(l,d,u,c,p,h){return t(),s("div",null,n)}const b=e(a,[["render",r]]);export{f as __pageData,b as default};
