import { a5 as escape_html } from './dev-DoNs_J55.js';
import './renderer-AiFTzwmy.js';

//#region src/lib/components/SlidePreview.svelte
function SlidePreview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { slideType, slideData, theme, label = "Slide preview" } = $$props;
		$$renderer.push(`<div class="preview-wrap svelte-1gocuw9">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<div class="empty svelte-1gocuw9">${escape_html(slideType ? "Rendering…" : "Select a slide to preview")}</div>`);
		$$renderer.push(`<!--]--></div>`);
	});
}

export { SlidePreview as S };
//# sourceMappingURL=SlidePreview-DG_geO0U.js.map
