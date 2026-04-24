import { a7 as head, a5 as escape_html, a8 as html, a1 as ensure_array_like, a3 as attr, a4 as stringify, X as derived } from './dev-DoNs_J55.js';
import { S as STFace } from './STFace-Ds-aLye0.js';
import { t, d as decksHeadline } from './i18n-BH3Uvo8w.js';
import './client-C1eEEMt-.js';
import { S as STBtn } from './STBtn-BPebr5gc.js';
import './internal-BZdXtTtr.js';
import './chunk-Do6Vi0cX.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

//#region src/lib/utils/date-utils.ts
function formatRelativeDate(date) {
	const d = date instanceof Date ? date : new Date(date);
	const diffMs = Date.now() - d.getTime();
	const diffSec = Math.floor(diffMs / 1e3);
	const diffMin = Math.floor(diffSec / 60);
	const diffHr = Math.floor(diffMin / 60);
	const diffDays = Math.floor(diffHr / 24);
	if (diffSec < 30) return "just now";
	if (diffMin < 60) return `${diffMin} min ago`;
	if (diffHr < 24) return `${diffHr} hr ago`;
	if (diffDays < 30) return `${diffDays} days ago`;
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
}
//#endregion
//#region src/routes/decks/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let creating = false;
		let newTitle = "";
		const empty = derived(() => data.decks.length === 0 && !creating && !(data.sharedDecks?.length > 0));
		const headline = derived(() => decksHeadline(data.decks.length));
		head("6r719p", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(t("decks.title"))}</title>`);
			});
		});
		if (empty()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="empty-shell svelte-6r719p"><aside class="gutter svelte-6r719p"><span>§0</span></aside> <section class="empty-hero svelte-6r719p"><div class="tag svelte-6r719p">${escape_html(t("empty.tag"))}</div> <div class="headline svelte-6r719p">${html(t("empty.headline").replace(/\n/g, "<br />"))}</div> <p class="empty-copy svelte-6r719p">${escape_html(t("empty.copy"))}</p> <div class="empty-cta svelte-6r719p">`);
			STBtn($$renderer, {
				variant: "accent",
				onclick: () => {
					creating = true;
				},
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t("decks.new"))}`);
				}});
			$$renderer.push(`<!----> `);
			STBtn($$renderer, {
				href: "/templates",
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t("empty.from_template"))}`);
				}});
			$$renderer.push(`<!----> `);
			STBtn($$renderer, {
				disabled: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t("empty.draft_with_agent"))}`);
				}});
			$$renderer.push(`<!----></div></section> <aside class="empty-aside svelte-6r719p">`);
			STFace($$renderer, {
				size: 200,
				mood: "sleep"
			});
			$$renderer.push(`<!----> <div class="off-duty svelte-6r719p">${escape_html(t("empty.off_duty"))}</div></aside></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="decks svelte-6r719p"><div class="head-band svelte-6r719p"><div class="head-index svelte-6r719p">§02</div> <div class="head-title svelte-6r719p"><div class="meta svelte-6r719p">${escape_html(t("decks.workspace"))} ${escape_html((data.user?.name ?? "").toUpperCase())}</div> <h1 class="svelte-6r719p">${escape_html(headline())}</h1></div> <div class="head-stat svelte-6r719p"><div class="stat-label svelte-6r719p">${escape_html(t("decks.last_week"))}</div> <div class="stat-num svelte-6r719p">${escape_html(data.agentEditsLastWeek)}</div> <div class="stat-label svelte-6r719p">${escape_html(t("decks.agent_edits"))}</div> <div class="stat-cta svelte-6r719p">`);
			STBtn($$renderer, {
				variant: "accent",
				onclick: () => {
					creating = true;
				},
				children: ($$renderer) => {
					$$renderer.push(`<!---->${escape_html(t("decks.new"))}`);
				}});
			$$renderer.push(`<!----></div></div></div> `);
			if (creating) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<form method="POST" action="?/create" class="create-form svelte-6r719p"><div class="create-row svelte-6r719p"><span class="create-label svelte-6r719p">${escape_html(t("decks.new_label"))}</span> <input type="text" name="title"${attr("value", newTitle)} required=""${attr("placeholder", t("decks.new_placeholder"))} autofocus="" class="svelte-6r719p"/> `);
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
						newTitle = "";
					},
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(t("decks.cancel"))}`);
					}});
				$$renderer.push(`<!----></div></form>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (form?.error) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="error svelte-6r719p">${escape_html(form.error)}</div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="table svelte-6r719p"><div class="table-head svelte-6r719p"><div class="th n svelte-6r719p">${escape_html(t("decks.col_n"))}</div> <div class="th title svelte-6r719p">${escape_html(t("decks.col_title"))}</div> <div class="th slides svelte-6r719p">${escape_html(t("decks.col_slides"))}</div> <div class="th upd svelte-6r719p">${escape_html(t("decks.col_updated"))}</div> <div class="th actions svelte-6r719p">${escape_html(t("decks.col_actions"))}</div> <div class="th arrow svelte-6r719p"></div></div> <!--[-->`);
			const each_array = ensure_array_like(data.decks);
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let deck = each_array[i];
				$$renderer.push(`<a class="row svelte-6r719p"${attr("href", `/decks/${stringify(deck.id)}`)}><div class="cell n svelte-6r719p">${escape_html(String(i + 1).padStart(2, "0"))}</div> <div class="cell title svelte-6r719p">`);
				if (i === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="dot svelte-6r719p" aria-hidden="true"></span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <span class="t svelte-6r719p">${escape_html(deck.title)}</span></div> <div class="cell slides svelte-6r719p">${escape_html(String(deck.slideOrder.length).padStart(2, "0"))}</div> <div class="cell upd svelte-6r719p">${escape_html(formatRelativeDate(deck.updatedAt).toUpperCase())}</div> <div class="cell actions svelte-6r719p"><span class="chip svelte-6r719p">${escape_html(t("decks.action_open"))}</span> <span class="chip svelte-6r719p">${escape_html(t("decks.action_pdf"))}</span> <form method="POST" action="?/duplicate"><input type="hidden" name="id"${attr("value", deck.id)}/> <button type="submit" class="chip svelte-6r719p">${escape_html(t("decks.action_dup"))}</button></form></div> <div class="cell arrow svelte-6r719p">→</div></a>`);
			}
			$$renderer.push(`<!--]--></div> `);
			if (data.sharedDecks?.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<h2 class="section-label svelte-6r719p">${escape_html(t("decks.shared_with_me"))}</h2> <div class="table svelte-6r719p"><div class="table-head svelte-6r719p"><div class="th n svelte-6r719p">${escape_html(t("decks.col_n"))}</div> <div class="th title svelte-6r719p">${escape_html(t("decks.col_title"))}</div> <div class="th slides svelte-6r719p">${escape_html(t("decks.col_slides"))}</div> <div class="th upd svelte-6r719p">${escape_html(t("decks.col_updated"))}</div> <div class="th actions svelte-6r719p">${escape_html(t("decks.col_actions"))}</div> <div class="th arrow svelte-6r719p"></div></div> <!--[-->`);
				const each_array_1 = ensure_array_like(data.sharedDecks);
				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let deck = each_array_1[i];
					$$renderer.push(`<a class="row svelte-6r719p"${attr("href", `/decks/${stringify(deck.id)}`)}><div class="cell n svelte-6r719p">${escape_html(String(i + 1).padStart(2, "0"))}</div> <div class="cell title svelte-6r719p"><span class="t svelte-6r719p">${escape_html(deck.title)}</span></div> <div class="cell slides svelte-6r719p">${escape_html(String(deck.slideOrder.length).padStart(2, "0"))}</div> <div class="cell upd svelte-6r719p">${escape_html(formatRelativeDate(deck.updatedAt).toUpperCase())}</div> <div class="cell actions svelte-6r719p"><span class="chip svelte-6r719p">${escape_html(t("decks.action_open"))}</span> <span class="chip svelte-6r719p">SHARED</span></div> <div class="cell arrow svelte-6r719p">→</div></a>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-B2uzewEC.js.map
