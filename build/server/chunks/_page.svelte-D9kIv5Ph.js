import { a7 as head, a5 as escape_html, a1 as ensure_array_like, a3 as attr, a4 as stringify, a2 as attr_class } from './dev-DoNs_J55.js';
import { t } from './i18n-BH3Uvo8w.js';

//#region src/routes/templates/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		head("ubkcxg", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(t("templates.title"))}</title>`);
			});
		});
		$$renderer.push(`<div class="head-band svelte-ubkcxg"><div class="head-index svelte-ubkcxg">§03</div> <div class="head-title svelte-ubkcxg"><div class="meta svelte-ubkcxg">${escape_html(t("templates.items_label"))} ${escape_html(String(data.slideTypes.length).padStart(2, "0"))} ${escape_html(t("themes.items_suffix"))}</div> <h1 class="svelte-ubkcxg">${escape_html(t("templates.headline"))}</h1></div></div> <ul class="list svelte-ubkcxg"><!--[-->`);
		const each_array = ensure_array_like(data.slideTypes);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let st = each_array[$$index];
			$$renderer.push(`<li class="row svelte-ubkcxg"><a${attr("href", `/templates/${stringify(st.id)}`)} class="row-link svelte-ubkcxg"><span class="name svelte-ubkcxg">${escape_html(st.label)}</span> <span class="code svelte-ubkcxg">${escape_html(st.name)}</span></a> <span${attr_class(`scope-badge ${stringify(st.scope)}`, "svelte-ubkcxg")}>${escape_html(st.scope.toUpperCase())}</span></li>`);
		}
		$$renderer.push(`<!--]--></ul>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D9kIv5Ph.js.map
