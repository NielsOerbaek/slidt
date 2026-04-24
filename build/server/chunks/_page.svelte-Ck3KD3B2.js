import { a7 as head, a5 as escape_html, a3 as attr, a1 as ensure_array_like, X as derived } from './dev-DoNs_J55.js';
import { t } from './i18n-BH3Uvo8w.js';
import './client-C1eEEMt-.js';
import { S as STBtn } from './STBtn-BPebr5gc.js';
import { S as SlidePreview } from './SlidePreview-DG_geO0U.js';
import './internal-BZdXtTtr.js';
import './chunk-Do6Vi0cX.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import './renderer-AiFTzwmy.js';
import './validate-CiBKPHUw.js';
import 'handlebars';
import 'postcss';

//#region src/lib/utils/token-utils.ts
/** Returns true if the CSS value looks like a hex color (#RGB or #RRGGBB). */
function isColorToken(value) {
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}
//#endregion
//#region src/slide-types/content.ts
var content = {
	};
//#endregion
//#region src/routes/themes/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let tokens = { ...data.theme.tokens };
		let name = data.theme.name;
		let systemPrompt = data.theme.systemPrompt ?? "";
		let previewTheme = derived(() => ({
			name,
			tokens
		}));
		const previewSlideType = content;
		const previewSlideData = {
			};
		head("35xqnj", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(data.theme.name)} — Themes — slidt</title>`);
			});
		});
		$$renderer.push(`<div class="page svelte-35xqnj"><div class="breadcrumb svelte-35xqnj"><a href="/themes" class="svelte-35xqnj">${escape_html(t("theme_edit.crumb"))}</a> / ${escape_html(data.theme.name)}</div> <div class="layout svelte-35xqnj"><form method="POST" action="?/save" class="token-form"><div class="form-header svelte-35xqnj"><input class="name-input svelte-35xqnj" type="text" name="name"${attr("value", name)}/> `);
		STBtn($$renderer, {
			type: "submit",
			variant: "accent",
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(t("theme_edit.save"))}`);
			}});
		$$renderer.push(`<!----></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="error svelte-35xqnj">${escape_html(form.error)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="prompt-section svelte-35xqnj"><label class="prompt-label svelte-35xqnj" for="systemPrompt">${escape_html(t("theme_edit.system_prompt_label"))}</label> <p class="prompt-help svelte-35xqnj">${escape_html(t("theme_edit.system_prompt_help"))}</p> <textarea id="systemPrompt" name="systemPrompt"${attr("placeholder", t("theme_edit.system_prompt_placeholder"))} rows="6" class="prompt-textarea svelte-35xqnj">`);
		const $$body = escape_html(systemPrompt);
		if ($$body) $$renderer.push(`${$$body}`);
		$$renderer.push(`</textarea></div> <div class="token-list svelte-35xqnj"><!--[-->`);
		const each_array = ensure_array_like(Object.entries(tokens));
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [key, val] = each_array[$$index];
			$$renderer.push(`<div class="token-row svelte-35xqnj"><code class="token-key svelte-35xqnj">${escape_html(key)}</code> `);
			if (isColorToken(val)) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<input type="color"${attr("value", val)} class="svelte-35xqnj"/> <input type="text" class="token-text svelte-35xqnj"${attr("value", val)}/>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<input type="text" class="token-text full svelte-35xqnj"${attr("value", val)}/>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div></form> <div class="preview-col svelte-35xqnj"><p class="preview-label svelte-35xqnj">${escape_html(t("theme_edit.preview_label"))}</p> `);
		SlidePreview($$renderer, {
			slideType: previewSlideType,
			slideData: previewSlideData,
			theme: previewTheme()
		});
		$$renderer.push(`<!----></div></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Ck3KD3B2.js.map
