import { a7 as head, a5 as escape_html, a1 as ensure_array_like, a3 as attr, a4 as stringify, a6 as attr_style } from './dev-DoNs_J55.js';
import { t } from './i18n-BH3Uvo8w.js';
import './client-C1eEEMt-.js';
import { S as STBtn } from './STBtn-BPebr5gc.js';
import './internal-BZdXtTtr.js';
import './chunk-Do6Vi0cX.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

//#region src/routes/themes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let creating = false;
		head("l06e47", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(t("themes.title"))}</title>`);
			});
		});
		$$renderer.push(`<div class="head-band svelte-l06e47"><div class="head-index svelte-l06e47">§02</div> <div class="head-title svelte-l06e47"><div class="meta svelte-l06e47">${escape_html(t("themes.workspace"))} ${escape_html(String(data.themes.length).padStart(2, "0"))} ${escape_html(t("themes.items_suffix"))}</div> <h1 class="svelte-l06e47">${escape_html(t("themes.headline"))}</h1></div> <div class="head-cta svelte-l06e47">`);
		STBtn($$renderer, {
			variant: "accent",
			onclick: () => {
				creating = !creating;
			},
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(t("themes.new"))}`);
			}});
		$$renderer.push(`<!----></div></div> `);
		if (creating) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<form method="POST" action="?/create" class="create-form svelte-l06e47"><span class="create-label svelte-l06e47">${escape_html(t("themes.new_label"))}</span> <input type="text" name="name"${attr("placeholder", t("themes.placeholder_name"))} required="" autofocus="" class="svelte-l06e47"/> `);
			STBtn($$renderer, {
				type: "submit",
				variant: "accent",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t("decks.create"))}`);
				}});
			$$renderer.push(`<!----> `);
			STBtn($$renderer, {
				onclick: () => {
					creating = false;
				},
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t("decks.cancel"))}`);
				}});
			$$renderer.push(`<!----></form>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="error svelte-l06e47">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <ul class="list svelte-l06e47"><!--[-->`);
		const each_array = ensure_array_like(data.themes);
		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let theme = each_array[$$index_1];
			$$renderer.push(`<li class="row svelte-l06e47"><a${attr("href", `/themes/${stringify(theme.id)}`)} class="row-link svelte-l06e47"><span class="name svelte-l06e47">${escape_html(theme.name)}</span> <span class="row-meta svelte-l06e47">${escape_html(theme.isPreset ? t("themes.preset") : "")}${escape_html(theme.scope.toUpperCase())}</span></a> <div class="swatches svelte-l06e47"><!--[-->`);
			const each_array_1 = ensure_array_like(Object.values(theme.tokens).slice(0, 8));
			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let color = each_array_1[$$index];
				if (color.startsWith("#")) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="sw svelte-l06e47"${attr_style(`background:${stringify(color)};`)}${attr("title", color)}></span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div></li>`);
		}
		$$renderer.push(`<!--]--></ul>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DdO6lyLX.js.map
