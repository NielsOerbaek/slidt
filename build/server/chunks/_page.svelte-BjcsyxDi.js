import { a7 as head, a5 as escape_html, a1 as ensure_array_like, a3 as attr, a2 as attr_class, a4 as stringify } from './dev-DoNs_J55.js';
import { t } from './i18n-BH3Uvo8w.js';
import './client-C1eEEMt-.js';
import './internal-BZdXtTtr.js';
import './chunk-Do6Vi0cX.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

//#region src/routes/admin/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let resetTarget = null;
		head("1jef3w8", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(t("admin.title"))}</title>`);
			});
		});
		$$renderer.push(`<div class="head-band svelte-1jef3w8"><div class="head-index svelte-1jef3w8">ADM</div> <div class="head-title svelte-1jef3w8"><div class="meta svelte-1jef3w8">${escape_html(t("admin.meta", { n: String(data.users.length) }))}</div> <h1 class="svelte-1jef3w8">${escape_html(t("admin.headline"))}</h1></div> <div class="head-cta svelte-1jef3w8"><button class="btn-accent svelte-1jef3w8">${escape_html(t("admin.new_user"))}</button></div></div> `);
		if (form?.error) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flash error svelte-1jef3w8">${escape_html(form.error)}</div>`);
		} else if (form?.success) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="flash ok svelte-1jef3w8">${escape_html(t("admin.action_success"))}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <table class="user-table svelte-1jef3w8"><thead class="svelte-1jef3w8"><tr class="svelte-1jef3w8"><th class="svelte-1jef3w8">${escape_html(t("admin.col_name"))}</th><th class="svelte-1jef3w8">${escape_html(t("admin.col_email"))}</th><th class="svelte-1jef3w8">${escape_html(t("admin.col_role"))}</th><th class="svelte-1jef3w8">${escape_html(t("admin.col_last_seen"))}</th><th class="svelte-1jef3w8">${escape_html(t("admin.col_actions"))}</th></tr></thead><tbody class="svelte-1jef3w8"><!--[-->`);
		const each_array = ensure_array_like(data.users);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let user = each_array[$$index];
			$$renderer.push(`<tr class="svelte-1jef3w8"><td class="name svelte-1jef3w8">${escape_html(user.name)}</td><td class="email svelte-1jef3w8">${escape_html(user.email)}</td><td class="role svelte-1jef3w8">`);
			if (user.isAdmin) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="badge admin svelte-1jef3w8">${escape_html(t("admin.badge_admin"))}</span>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<span class="badge user svelte-1jef3w8">${escape_html(t("admin.badge_user"))}</span>`);
			}
			$$renderer.push(`<!--]--></td><td class="last-seen svelte-1jef3w8">${escape_html(user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleDateString("da-DK") : "—")}</td><td class="actions svelte-1jef3w8"><form method="POST" action="?/setAdmin" class="inline-form svelte-1jef3w8"><input type="hidden" name="id"${attr("value", user.id)}/> <input type="hidden" name="isAdmin"${attr("value", user.isAdmin ? "false" : "true")}/> <button type="submit" class="btn-sm svelte-1jef3w8">${escape_html(user.isAdmin ? t("admin.remove_admin") : t("admin.make_admin"))}</button></form> `);
			if (resetTarget === user.id) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<form method="POST" action="?/resetPassword" class="inline-form svelte-1jef3w8"><input type="hidden" name="id"${attr("value", user.id)}/> <input type="password" name="password"${attr("placeholder", t("admin.pw_new_placeholder"))} minlength="8" class="inline-pw svelte-1jef3w8" required=""/> <button type="submit" class="btn-sm warn svelte-1jef3w8">${escape_html(t("admin.pw_set"))}</button> <button type="button" class="btn-sm svelte-1jef3w8">✕</button></form>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<button class="btn-sm svelte-1jef3w8">${escape_html(t("admin.reset_pw"))}</button>`);
			}
			$$renderer.push(`<!--]--> <form method="POST" action="?/deleteUser" class="inline-form svelte-1jef3w8"><input type="hidden" name="id"${attr("value", user.id)}/> <button type="submit" class="btn-sm danger svelte-1jef3w8">${escape_html(t("admin.delete"))}</button></form></td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table> <div class="section-head svelte-1jef3w8"><span class="section-label svelte-1jef3w8">${escape_html(t("admin.issues"))}</span> <span class="section-count svelte-1jef3w8">${escape_html(t("admin.issues_count", {
			total: String(data.issues.length),
			open: String(data.issues.filter((i) => i.status === "open").length)
		}))}</span></div> `);
		if (data.issues.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="empty svelte-1jef3w8">${escape_html(t("admin.issues_empty"))}</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--[-->`);
			const each_array_1 = ensure_array_like(data.issues);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let issue = each_array_1[$$index_1];
				$$renderer.push(`<div${attr_class("issue-row svelte-1jef3w8", void 0, { "resolved": issue.status === "resolved" })}><div class="issue-meta svelte-1jef3w8"><span${attr_class(`issue-sev sev-${stringify(issue.severity)}`, "svelte-1jef3w8")}>${escape_html(issue.severity.toUpperCase())}</span> <span class="issue-status svelte-1jef3w8">${escape_html(issue.status === "open" ? t("admin.issue_status_open") : t("admin.issue_status_resolved"))}</span> <span class="issue-date svelte-1jef3w8">${escape_html(new Date(issue.createdAt).toLocaleDateString("da-DK"))}</span> `);
				if (issue.deckId) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<a class="issue-deck svelte-1jef3w8"${attr("href", `/decks/${stringify(issue.deckId)}`)} target="_blank">${escape_html(t("admin.issue_deck_link"))}</a>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> <div class="issue-title svelte-1jef3w8">${escape_html(issue.title)}</div> `);
				if (issue.body) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="issue-body svelte-1jef3w8">${escape_html(issue.body)}</div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <div class="issue-actions svelte-1jef3w8">`);
				if (issue.status === "open") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<form method="POST" action="?/resolveIssue" class="inline-form svelte-1jef3w8"><input type="hidden" name="id"${attr("value", issue.id)}/> <button type="submit" class="btn-sm svelte-1jef3w8">${escape_html(t("admin.resolve"))}</button></form>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> <form method="POST" action="?/deleteIssue" class="inline-form svelte-1jef3w8"><input type="hidden" name="id"${attr("value", issue.id)}/> <button type="submit" class="btn-sm danger svelte-1jef3w8">${escape_html(t("admin.delete"))}</button></form></div></div>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]-->`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BjcsyxDi.js.map
