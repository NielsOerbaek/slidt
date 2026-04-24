import { a7 as head, a5 as escape_html, a3 as attr } from './dev-DoNs_J55.js';
import { t } from './i18n-BH3Uvo8w.js';

//#region src/routes/share/[token]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		head("152is5u", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(data.deck.title)} — slidt</title>`);
			});
		});
		$$renderer.push(`<div class="share-view svelte-152is5u"><div class="share-header svelte-152is5u"><span class="share-title svelte-152is5u">${escape_html(data.deck.title)}</span> <span class="share-badge svelte-152is5u">${escape_html(t("share.view_only"))}</span></div> <div class="deck-wrap svelte-152is5u"><iframe${attr("srcdoc", data.renderedHtml)}${attr("title", data.deck.title)} sandbox="allow-same-origin" class="deck-frame svelte-152is5u"></iframe></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-n-RwzsZv.js.map
