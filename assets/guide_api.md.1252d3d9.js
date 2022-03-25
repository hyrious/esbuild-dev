import{_ as n,c as s,o as a,a as e}from"./app.3c72d501.js";const h='{"title":"API Reference","description":"","frontmatter":{},"headers":[{"level":2,"title":"Helper Methods","slug":"helper-methods"},{"level":3,"title":"parse","slug":"parse"},{"level":2,"title":"Requires esbuild","slug":"requires-esbuild"},{"level":3,"title":"importFile","slug":"importfile"},{"level":3,"title":"requireFile","slug":"requirefile"},{"level":3,"title":"external","slug":"external"},{"level":3,"title":"resolveByEsbuild","slug":"resolvebyesbuild"}],"relativePath":"guide/api.md"}',t={},o=e(`<h1 id="api-reference" tabindex="-1">API Reference <a class="header-anchor" href="#api-reference" aria-hidden="true">#</a></h1><h2 id="helper-methods" tabindex="-1">Helper Methods <a class="header-anchor" href="#helper-methods" aria-hidden="true">#</a></h2><h3 id="parse" tabindex="-1"><code>parse</code> <a class="header-anchor" href="#parse" aria-hidden="true">#</a></h3><ul><li><strong>Type:</strong> <code>(args: string[], configs: FlagConfig[]) =&gt; string[]</code></li></ul><div class="language-ts"><pre><code><span class="token keyword">enum</span> EnumFlagType <span class="token punctuation">{</span>
  Truthy<span class="token punctuation">,</span> <span class="token comment">// --bundle</span>
  Boolean<span class="token punctuation">,</span> <span class="token comment">// --tree-shaking=true</span>
  String<span class="token punctuation">,</span> <span class="token comment">// --charset=utf8</span>
  <span class="token builtin">Array</span><span class="token punctuation">,</span> <span class="token comment">// --main-fields=main,module</span>
  List<span class="token punctuation">,</span> <span class="token comment">// --pure:console.log</span>
  Pair<span class="token punctuation">,</span> <span class="token comment">// --define:key=value</span>
  Number<span class="token punctuation">,</span> <span class="token comment">// --log-limit=100</span>
<span class="token punctuation">}</span>

<span class="token keyword">type</span> <span class="token class-name">FlagType</span> <span class="token operator">=</span> EnumFlagType <span class="token operator">|</span> <span class="token number">0</span> <span class="token operator">|</span> <span class="token number">1</span> <span class="token operator">|</span> <span class="token number">2</span> <span class="token operator">|</span> <span class="token number">3</span> <span class="token operator">|</span> <span class="token number">4</span> <span class="token operator">|</span> <span class="token number">5</span> <span class="token operator">|</span> <span class="token number">6</span><span class="token punctuation">;</span>

<span class="token keyword">type</span> <span class="token class-name">FlagConfig</span> <span class="token operator">=</span> <span class="token punctuation">[</span>dash_case<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">,</span> type<span class="token operator">:</span> FlagType<span class="token punctuation">,</span> alias<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
</code></pre></div><p>Parse command line arguments in the esbuild way.</p><div class="language-ts"><pre><code><span class="token keyword">import</span> <span class="token punctuation">{</span> parse<span class="token punctuation">,</span> EsbuildFlags <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@hyrious/esbuild-dev/args&quot;</span><span class="token punctuation">;</span>

<span class="token function">parse</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token string">&quot;--target=es6&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;other args&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span> EsbuildFlags<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// =&gt; { target: &quot;es6&quot;, _: [&quot;other args&quot;] }</span>
</code></pre></div><h2 id="requires-esbuild" tabindex="-1">Requires <code>esbuild</code> <a class="header-anchor" href="#requires-esbuild" aria-hidden="true">#</a></h2><h3 id="importfile" tabindex="-1"><code>importFile</code> <a class="header-anchor" href="#importfile" aria-hidden="true">#</a></h3><ul><li><strong>Type:</strong> <code>(path: string) =&gt; Promise&lt;any&gt;</code></li></ul><p>Imports a file like the built-in <code>import()</code>, except that it can also accept several other file extensions including <code>.ts</code>.</p><div class="language-ts"><pre><code><span class="token keyword">import</span> <span class="token punctuation">{</span> importFile <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@hyrious/esbuild-dev&quot;</span><span class="token punctuation">;</span>

<span class="token keyword">const</span> config <span class="token operator">=</span> <span class="token keyword">await</span> <span class="token function">importFile</span><span class="token punctuation">(</span><span class="token string">&quot;config.ts&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><p>Very suitable for implementing config function like <code>vite.config.ts</code> for vite.</p><h3 id="requirefile" tabindex="-1"><code>requireFile</code> <a class="header-anchor" href="#requirefile" aria-hidden="true">#</a></h3><ul><li><strong>Type:</strong> <code>(path: string) =&gt; Promise&lt;any&gt;</code></li></ul><p>Similar to <code>importFile()</code>, but internally it uses commonjs format.</p><h3 id="external" tabindex="-1"><code>external</code> <a class="header-anchor" href="#external" aria-hidden="true">#</a></h3><ul><li><strong>Type:</strong> <code>(options?: ExternalPluginOptions) =&gt; esbuild.Plugin</code></li></ul><div class="language-ts"><pre><code><span class="token keyword">interface</span> <span class="token class-name">ExternalPluginOptions</span> <span class="token punctuation">{</span>
  <span class="token comment">/**
   * Passed to \`onResolve()\`, mark them as external.
   * @default /^[\\w@][^:]/
   */</span>
  filter<span class="token operator">?</span><span class="token operator">:</span> RegExp<span class="token punctuation">;</span>

  <span class="token comment">/**
   * Called on each external id.
   * @example
   * external({ onResolve(args) { externals.push(args.path) } })
   */</span>
  onResolve<span class="token operator">?</span><span class="token operator">:</span> <span class="token punctuation">(</span>args<span class="token operator">:</span> OnResolveArgs<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">void</span><span class="token punctuation">;</span>

  <span class="token comment">/**
   * Silently exclude some common file extensions.
   * @default true
   */</span>
  exclude<span class="token operator">?</span><span class="token operator">:</span> <span class="token builtin">boolean</span> <span class="token operator">|</span> RegExp<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre></div><p>This is an esbuild plugin that externalizes all names look like <a href="https://github.com/dword-design/package-name-regex" target="_blank" rel="noopener noreferrer"><q>package-name</q></a>.</p><div class="language-ts"><pre><code><span class="token keyword">import</span> <span class="token punctuation">{</span> build <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;esbuild&quot;</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> external <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@hyrious/esbuild-dev&quot;</span><span class="token punctuation">;</span>

<span class="token function">build</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  entryPoints<span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;index.ts&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  bundle<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  plugins<span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token function">external</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      <span class="token function">onResolve</span><span class="token punctuation">(</span>id<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token builtin">console</span><span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">&quot;marked as external:&quot;</span><span class="token punctuation">,</span> id<span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre></div><p>This function is suitable for implementing the pre-bundling optimization of vite. Although they achieved this with <a href="https://github.com/guybedford/es-module-lexer" target="_blank" rel="noopener noreferrer">es-module-lexer</a>.</p><h3 id="resolvebyesbuild" tabindex="-1"><code>resolveByEsbuild</code> <a class="header-anchor" href="#resolvebyesbuild" aria-hidden="true">#</a></h3><ul><li><strong>Type:</strong> <code>(id: string, resolveDir: string) =&gt; Promise&lt;string | undefined&gt;</code></li></ul><p>Use esbuild to resolve a module id from the dir <code>resolveDir</code>.</p><div class="language-ts"><pre><code><span class="token keyword">import</span> <span class="token punctuation">{</span> resolveByEsbuild <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&quot;@hyrious/esbuild-dev&quot;</span><span class="token punctuation">;</span>

<span class="token function">resolveByEsbuild</span><span class="token punctuation">(</span><span class="token string">&quot;./a&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;./src&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// =&gt; &quot;./src/a.ts&quot;</span>
</code></pre></div><p>Because esbuild will parse tsconfig and correctly resolve the file from the bundler side, this function is a cheap(?) way to achieve the well-known <a href="https://github.com/browserify/resolve" target="_blank" rel="noopener noreferrer"><code>resolve</code></a> behavior of other bundlers.</p>`,27),p=[o];function l(c,i,r,u,k,d){return a(),s("div",null,p)}var m=n(t,[["render",l]]);export{h as __pageData,m as default};
