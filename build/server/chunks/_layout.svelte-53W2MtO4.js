import { a1 as ensure_array_like, a2 as attr_class, a3 as attr, a4 as stringify, a5 as escape_html } from './dev-DoNs_J55.js';
import { p as page } from './state-BxnTFTw0.js';
import { S as STFace } from './STFace-Ds-aLye0.js';
import { t } from './i18n-BH3Uvo8w.js';
import './client-C1eEEMt-.js';
import './internal-BZdXtTtr.js';
import './chunk-Do6Vi0cX.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

//#region src/lib/components/st/STNav.svelte
function STNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { active, user } = $$props;
		const items = [
			{
				id: "decks",
				key: "nav.decks"
			},
			{
				id: "themes",
				key: "nav.themes"
			},
			{
				id: "templates",
				key: "nav.templates"
			}
		];
		let menuOpen = false;
		let moreOpen = false;
		const moreActive = active === "docs" || active === "admin" || active === "settings";
		$$renderer.push(`<nav class="st-nav svelte-1jrljd0"><div class="cell index svelte-1jrljd0">01</div> <div class="cell brand-row svelte-1jrljd0"><a class="brand svelte-1jrljd0" href="/decks">`);
		STFace($$renderer, { size: 18 });
		$$renderer.push(`<!----> <span class="word svelte-1jrljd0">slidt</span></a> <!--[-->`);
		const each_array = ensure_array_like(items);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];
			$$renderer.push(`<a${attr_class("tab svelte-1jrljd0", void 0, { "active": active === item.id })}${attr("href", `/${stringify(item.id)}`)}><span class="tab-num svelte-1jrljd0">0${escape_html(i + 2)}</span> <span>${escape_html(t(item.key))}</span> `);
			if (active === item.id) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="dot svelte-1jrljd0" aria-hidden="true"></span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></a>`);
		}
		$$renderer.push(`<!--]--> <div class="more-wrap svelte-1jrljd0"><button${attr_class("tab more-btn svelte-1jrljd0", void 0, { "active": moreActive })} type="button"${attr("aria-expanded", moreOpen)} aria-haspopup="true"><span>${escape_html(t("nav.more"))}</span> `);
		if (moreActive) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="dot svelte-1jrljd0" aria-hidden="true"></span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <span${attr_class("more-arrow svelte-1jrljd0", void 0, { "open": moreOpen })}>▾</span></button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> <div class="cell right svelte-1jrljd0"><span class="user svelte-1jrljd0"><span class="user-prefix svelte-1jrljd0">${escape_html(t("nav.user_prefix"))}</span> <span class="user-name svelte-1jrljd0">${escape_html((user.name ?? "").toUpperCase())}</span></span> <form method="POST" action="/logout" class="logout-form svelte-1jrljd0"><button type="submit" class="logout svelte-1jrljd0">${escape_html(t("nav.logout"))}</button></form> <button class="mob-burger svelte-1jrljd0" type="button" aria-label="Menu"${attr("aria-expanded", menuOpen)}><span${attr_class("burger-line svelte-1jrljd0", void 0, { "open": menuOpen })}></span> <span${attr_class("burger-line mid svelte-1jrljd0", void 0, { "open": menuOpen })}></span> <span${attr_class("burger-line svelte-1jrljd0", void 0, { "open": menuOpen })}></span></button></div></nav> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		function activeFromPath(pathname) {
			if (pathname.startsWith("/decks")) return "decks";
			if (pathname.startsWith("/themes")) return "themes";
			if (pathname.startsWith("/templates")) return "templates";
			if (pathname.startsWith("/docs")) return "docs";
			if (pathname.startsWith("/admin")) return "admin";
			if (pathname.startsWith("/settings")) return "settings";
			return null;
		}
		if (data.user) {
			$$renderer.push("<!--[0-->");
			STNav($$renderer, {
				active: activeFromPath(page.url.pathname),
				user: data.user
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-53W2MtO4.js.map
