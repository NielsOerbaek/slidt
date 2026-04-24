import { a7 as head, a5 as escape_html, a3 as attr, X as derived } from './dev-DoNs_J55.js';
import { t } from './i18n-BH3Uvo8w.js';
import './client-C1eEEMt-.js';
import { S as STBtn } from './STBtn-BPebr5gc.js';
import { S as SlidePreview } from './SlidePreview-DG_geO0U.js';
import { b as buildDummyData } from './field-defaults-DwF33Zkm.js';
import './internal-BZdXtTtr.js';
import './chunk-Do6Vi0cX.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import './renderer-AiFTzwmy.js';
import './validate-CiBKPHUw.js';
import 'handlebars';
import 'postcss';

//#region src/lib/utils/fields-json.ts
function parseFieldsJson(json) {
	if (!json.trim()) return null;
	try {
		const parsed = JSON.parse(json);
		if (!Array.isArray(parsed)) return null;
		return parsed;
	} catch {
		return null;
	}
}
//#endregion
//#region src/routes/templates/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let label = data.slideType.label;
		let fieldsJson = JSON.stringify(data.slideType.fields, null, 2);
		let htmlTemplate = data.slideType.htmlTemplate;
		let css = data.slideType.css;
		const previewTheme = {
			};
		let parsedFields = derived(() => parseFieldsJson(fieldsJson));
		let previewSlideType = derived(() => parsedFields() ? {
			name: data.slideType.name,
			label,
			fields: parsedFields(),
			htmlTemplate,
			css
		} : null);
		let previewData = derived(() => parsedFields() ? buildDummyData(parsedFields()) : {});
		head("18d5kws", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(data.slideType.label)} — Templates — slidt</title>`);
			});
		});
		$$renderer.push(`<div class="page svelte-18d5kws"><div class="breadcrumb svelte-18d5kws"><a href="/templates" class="svelte-18d5kws">${escape_html(t("template_edit.crumb"))}</a> / ${escape_html(data.slideType.name)}</div> <div class="layout svelte-18d5kws"><form method="POST" action="?/save" class="editor-form"><div class="form-toolbar svelte-18d5kws"><input class="label-input svelte-18d5kws" type="text" name="label"${attr("value", label)}/> <span class="type-name svelte-18d5kws">${escape_html(data.slideType.name)}</span> `);
		STBtn($$renderer, {
			type: "submit",
			variant: "accent",
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(t("theme_edit.save"))}`);
			}});
		$$renderer.push(`<!----></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="error svelte-18d5kws">${escape_html(form.error)}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="editors svelte-18d5kws"><div class="editor-section svelte-18d5kws"><label class="editor-label svelte-18d5kws">${escape_html(t("template_edit.fields_label"))}</label> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <textarea class="code-editor svelte-18d5kws" rows="12" spellcheck="false">`);
		const $$body = escape_html(fieldsJson);
		if ($$body) $$renderer.push(`${$$body}`);
		$$renderer.push(`</textarea></div> <div class="editor-section svelte-18d5kws"><label class="editor-label svelte-18d5kws">${escape_html(t("template_edit.template_label"))}</label> <textarea class="code-editor svelte-18d5kws" rows="12" spellcheck="false">`);
		const $$body_1 = escape_html(htmlTemplate);
		if ($$body_1) $$renderer.push(`${$$body_1}`);
		$$renderer.push(`</textarea></div> <div class="editor-section svelte-18d5kws"><label class="editor-label svelte-18d5kws">${escape_html(t("template_edit.css_label", { name: data.slideType.name }))}</label> <textarea class="code-editor svelte-18d5kws" rows="10" spellcheck="false">`);
		const $$body_2 = escape_html(css);
		if ($$body_2) $$renderer.push(`${$$body_2}`);
		$$renderer.push(`</textarea></div></div></form> <div class="preview-col svelte-18d5kws"><p class="preview-label svelte-18d5kws">${escape_html(t("template_edit.preview_label"))}</p> `);
		SlidePreview($$renderer, {
			slideType: previewSlideType(),
			slideData: previewData(),
			theme: previewTheme
		});
		$$renderer.push(`<!----></div></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Bydgcro4.js.map
