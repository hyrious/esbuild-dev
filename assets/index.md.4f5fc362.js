import{_ as e,c as t,o as s,a}from"./app.e8060b6a.js";const m=JSON.parse('{"title":"What it do?","description":"","frontmatter":{},"headers":[{"level":2,"title":"Motivation","slug":"motivation","link":"#motivation","children":[]},{"level":2,"title":"Alternatives","slug":"alternatives","link":"#alternatives","children":[]}],"relativePath":"index.md"}'),n={name:"index.md"},o=a(`<h1 id="what-it-do" tabindex="-1">What it do? <a class="header-anchor" href="#what-it-do" aria-hidden="true">#</a></h1><p>A simple wrapper of esbuild to run your script file.</p><h2 id="motivation" tabindex="-1">Motivation <a class="header-anchor" href="#motivation" aria-hidden="true">#</a></h2><p>Writing TypeScript is fun, but executing them is not. <code>tsc</code> itself is just a transpiler, it does not support bundling nor executing.</p><p>Now <code>ts-node</code> comes in, it wraps TypeScript compiler and makes use of Node&#39;s <a href="https://nodejs.org/api/modules.html#requireextensions" target="_blank" rel="noreferrer"><code>require.extensions</code></a> to run files, it works fine but does not fully support pure ESM (they will). Besides, invoking type system is also a waste of time when your files become more. Even if you turn-ed off type checking, reading files in node&#39;s single thread is also slow.</p><p>Now, with <a href="https://esbuild.github.io" target="_blank" rel="noreferrer">esbuild</a>, you can bundle your script into one file and run it much faster.</p><div class="language-bash"><button class="copy"></button><span class="lang">bash</span><pre><code><span class="line"><span style="color:#A6ACCD;">$ esbuild-dev script.ts</span></span>
<span class="line"><span style="color:#676E95;"># esbuild --bundle script.ts --outfile=node_modules/.esbuild-dev/script.ts.js</span></span>
<span class="line"><span style="color:#676E95;"># node node_modules/.esbuild-dev/script.ts.js</span></span>
<span class="line"></span></code></pre></div><p>That&#39;s it. Simple and naive.</p><p>Originally, I developed this tool to achieve <q>zero <code>*.js</code></q> in some projects.</p><h2 id="alternatives" tabindex="-1">Alternatives <a class="header-anchor" href="#alternatives" aria-hidden="true">#</a></h2><ul><li><a href="https://github.com/antfu/esno" target="_blank" rel="noreferrer"><samp>esno</samp> / <samp>esmo</samp></a> \u2014 <a href="https://github.com/antfu" target="_blank" rel="noreferrer">Anthony Fu</a><br> It uses Node&#39;s native <a href="https://nodejs.org/api/modules.html#requireextensions" target="_blank" rel="noreferrer"><code>require.extensions</code></a> for commonjs and <a href="https://nodejs.org/api/esm.html#loaders" target="_blank" rel="noreferrer">loaders</a> for es modules to achieve similar behavior.</li></ul>`,11),i=[o];function r(l,d,p,c,u,h){return s(),t("div",null,i)}const _=e(n,[["render",r]]);export{m as __pageData,_ as default};
