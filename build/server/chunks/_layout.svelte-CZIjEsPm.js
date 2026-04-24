import { a1 as ensure_array_like, a2 as attr_class, a3 as attr, a5 as escape_html } from './dev-DoNs_J55.js';
import { p as page } from './state-BxnTFTw0.js';
import './client-C1eEEMt-.js';
import './internal-BZdXtTtr.js';
import './chunk-Do6Vi0cX.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

//#region src/routes/docs/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const sections = [
			{
				href: "/docs",
				label: "Overview"
			},
			{
				href: "/docs/agent",
				label: "Agent"
			},
			{
				href: "/docs/templates",
				label: "Templates"
			},
			{
				href: "/docs/themes",
				label: "Themes"
			},
			{
				href: "/docs/cli",
				label: "CLI"
			},
			{
				href: "/docs/api",
				label: "API"
			}
		];
		function isActive(href) {
			if (href === "/docs") return page.url.pathname === "/docs";
			return page.url.pathname.startsWith(href);
		}
		$$renderer.push(`<div class="docs-wrap svelte-1bpnej"><div class="head-band svelte-1bpnej"><div class="head-index svelte-1bpnej">§5</div> <div class="head-title svelte-1bpnej"><div class="meta svelte-1bpnej">SLIDT / DOKUMENTATION</div> <h1 class="svelte-1bpnej">Docs</h1></div></div> <div class="docs-body svelte-1bpnej"><aside class="sidebar svelte-1bpnej"><nav class="sidebar-nav svelte-1bpnej"><!--[-->`);
		const each_array = ensure_array_like(sections);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let s = each_array[$$index];
			$$renderer.push(`<a${attr_class("sidebar-link svelte-1bpnej", void 0, { "active": isActive(s.href) })}${attr("href", s.href)}>${escape_html(s.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></aside> <main class="content svelte-1bpnej">`);
		children($$renderer);
		$$renderer.push(`<!----></main></div></div>`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-CZIjEsPm.js.map
