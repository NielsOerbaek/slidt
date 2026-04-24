import { a7 as head, a5 as escape_html } from './dev-DoNs_J55.js';
import { S as STFace } from './STFace-Ds-aLye0.js';
import { t } from './i18n-BH3Uvo8w.js';
import './client-C1eEEMt-.js';
import { S as STBtn } from './STBtn-BPebr5gc.js';
import './internal-BZdXtTtr.js';
import './chunk-Do6Vi0cX.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

//#region src/lib/components/st/STMetaBar.svelte
function STMetaBar($$renderer, $$props) {
	let { index = "00", children, right } = $$props;
	$$renderer.push(`<div class="st-meta svelte-c6zf6x"><div class="cell index svelte-c6zf6x">${escape_html(index)}</div> <div class="cell middle svelte-c6zf6x">`);
	children($$renderer);
	$$renderer.push(`<!----></div> <div class="cell right svelte-c6zf6x">`);
	if (right) {
		$$renderer.push("<!--[0-->");
		right($$renderer);
		$$renderer.push(`<!---->`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--></div></div>`);
}
//#endregion
//#region src/routes/login/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { form } = $$props;
		head("1x05zx6", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(t("login.title"))}</title>`);
			});
		});
		$$renderer.push(`<div class="login svelte-1x05zx6">`);
		{
			function right($$renderer) {
				$$renderer.push(`<span>${escape_html(t("meta.cph"))}</span>`);
			}
			STMetaBar($$renderer, {
				index: "00",
				right,
				children: ($$renderer) => {
					$$renderer.push(`<span>${escape_html(t("meta.product"))}</span> <span class="dim svelte-1x05zx6">·</span> <span class="dim svelte-1x05zx6">${escape_html(t("meta.internal"))}</span> <span class="dim svelte-1x05zx6">·</span> <span class="dim svelte-1x05zx6">${escape_html(t("meta.version"))}</span>`);
				}});
		}
		$$renderer.push(`<!----> <div class="body svelte-1x05zx6"><aside class="gutter svelte-1x05zx6"><span>A</span> <span>B</span> <span>C</span> <span class="spacer svelte-1x05zx6"></span> <span>—</span></aside> <section class="hero svelte-1x05zx6"><div class="tag svelte-1x05zx6">${escape_html(t("login.tag"))}</div> <div class="word svelte-1x05zx6">slidt</div> <div class="mark svelte-1x05zx6">-_-</div></section> <aside class="form-side svelte-1x05zx6"><div class="form-tag svelte-1x05zx6">${escape_html(t("login.form_tag"))}</div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="error svelte-1x05zx6" role="alert">${escape_html(form.error)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <form method="POST"><label class="field svelte-1x05zx6"><span class="label svelte-1x05zx6">${escape_html(t("login.email_label"))}</span> <span class="value svelte-1x05zx6"><input type="email" name="email" required="" autocomplete="email" class="svelte-1x05zx6"/></span></label> <label class="field svelte-1x05zx6"><span class="label svelte-1x05zx6">${escape_html(t("login.password_label"))}</span> <span class="value svelte-1x05zx6"><input type="password" name="password" required="" autocomplete="current-password" class="svelte-1x05zx6"/></span></label> `);
		STBtn($$renderer, {
			type: "submit",
			variant: "accent",
			size: "lg",
			block: true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${escape_html(t("login.submit"))}`);
			}});
		$$renderer.push(`<!----></form> <div class="agent-row svelte-1x05zx6">`);
		STFace($$renderer, {
			size: 22,
			color: "var(--st-cobalt)"
		});
		$$renderer.push(`<!----> <span class="agent-line svelte-1x05zx6">${escape_html(t("login.agent_ready"))}</span></div> <div class="footer svelte-1x05zx6">${escape_html(t("login.help"))}</div></aside></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-mMiNHx3Z.js.map
