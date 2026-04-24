import { a2 as attr_class, a4 as stringify, a3 as attr } from './dev-DoNs_J55.js';

//#region src/lib/components/st/STBtn.svelte
function STBtn($$renderer, $$props) {
	let { variant = "ghost", href, type = "button", disabled = false, onclick, children, block = false, size = "md", title } = $$props;
	if (href) {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<a${attr_class(`st-btn st-btn-${stringify(variant)} st-btn-${stringify(size)}`, "svelte-dzdnn7", { "block": block })}${attr("href", href)}${attr("title", title)}>`);
		children($$renderer);
		$$renderer.push(`<!----></a>`);
	} else {
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<button${attr_class(`st-btn st-btn-${stringify(variant)} st-btn-${stringify(size)}`, "svelte-dzdnn7", { "block": block })}${attr("type", type)}${attr("disabled", disabled, true)}${attr("title", title)}>`);
		children($$renderer);
		$$renderer.push(`<!----></button>`);
	}
	$$renderer.push(`<!--]-->`);
}

export { STBtn as S };
//# sourceMappingURL=STBtn-BPebr5gc.js.map
