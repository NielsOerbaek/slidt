import { a7 as head, a5 as escape_html, a3 as attr, a1 as ensure_array_like, a4 as stringify } from './dev-DoNs_J55.js';
import { t } from './i18n-BH3Uvo8w.js';
import './client-C1eEEMt-.js';
import './internal-BZdXtTtr.js';
import './chunk-Do6Vi0cX.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';

//#region src/routes/settings/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let newToken = form?.token ?? null;
		head("1i19ct2", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(t("settings.title"))}</title>`);
			});
		});
		$$renderer.push(`<div class="head-band svelte-1i19ct2"><div class="head-index svelte-1i19ct2">SET</div> <div class="head-title svelte-1i19ct2"><div class="meta svelte-1i19ct2">${escape_html(t("settings.meta"))}</div> <h1 class="svelte-1i19ct2">${escape_html(t("settings.headline"))}</h1></div></div> <section class="section svelte-1i19ct2"><div class="section-label svelte-1i19ct2">${escape_html(t("settings.profile"))}</div> <div class="section-body svelte-1i19ct2"><form method="POST" action="?/updateProfile" class="form-row svelte-1i19ct2"><label class="field-label svelte-1i19ct2" for="profile-name">${escape_html(t("settings.display_name"))}</label> <input id="profile-name" type="text" name="name"${attr("value", data.user.name)} required="" class="svelte-1i19ct2"/> <button type="submit" class="btn-accent svelte-1i19ct2">${escape_html(t("settings.save"))}</button> `);
		if (form?.profileSuccess) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="ok svelte-1i19ct2">${escape_html(t("settings.saved"))}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.profileError) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="err svelte-1i19ct2">${escape_html(form.profileError)}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></form> <div class="divider svelte-1i19ct2"></div> <form method="POST" action="?/changePassword" class="form-stack svelte-1i19ct2"><div class="form-row svelte-1i19ct2"><label class="field-label svelte-1i19ct2" for="pw-current">${escape_html(t("settings.current_password"))}</label> <input id="pw-current" type="password" name="current" autocomplete="current-password" required="" class="svelte-1i19ct2"/></div> <div class="form-row svelte-1i19ct2"><label class="field-label svelte-1i19ct2" for="pw-next">${escape_html(t("settings.new_password"))}</label> <input id="pw-next" type="password" name="next" autocomplete="new-password" minlength="8" required="" class="svelte-1i19ct2"/></div> <div class="form-row svelte-1i19ct2"><label class="field-label svelte-1i19ct2" for="pw-confirm">${escape_html(t("settings.confirm_password"))}</label> <input id="pw-confirm" type="password" name="confirm" autocomplete="new-password" required="" class="svelte-1i19ct2"/></div> <div class="form-row svelte-1i19ct2"><span class="field-label svelte-1i19ct2"></span> <button type="submit" class="btn-accent svelte-1i19ct2">${escape_html(t("settings.change_password"))}</button> `);
		if (form?.pwSuccess) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="ok svelte-1i19ct2">${escape_html(t("settings.password_changed"))}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (form?.pwError) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="err svelte-1i19ct2">${escape_html(form.pwError)}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></form></div></section> <section class="section svelte-1i19ct2"><div class="section-label svelte-1i19ct2">${escape_html(t("settings.preferences"))}</div> <div class="section-body svelte-1i19ct2"><form method="POST" action="?/updatePreferences" class="form-stack svelte-1i19ct2"><div class="pref-row svelte-1i19ct2"><div class="pref-info svelte-1i19ct2"><span class="pref-name svelte-1i19ct2">${escape_html(t("settings.vim_name"))}</span> <span class="pref-desc svelte-1i19ct2">${escape_html(t("settings.vim_desc"))}</span></div> <label class="toggle svelte-1i19ct2"><input type="checkbox" name="vim" role="switch"${attr("checked", data.user.preferences?.vim ?? false, true)} class="svelte-1i19ct2"/> <span class="toggle-track svelte-1i19ct2"><span class="toggle-thumb svelte-1i19ct2"></span></span></label></div> <div class="pref-row svelte-1i19ct2"><div class="pref-info svelte-1i19ct2"><span class="pref-name svelte-1i19ct2">${escape_html(t("settings.language_name"))}</span> <span class="pref-desc svelte-1i19ct2">${escape_html(t("settings.language_desc"))}</span></div> <select name="locale" class="svelte-1i19ct2">`);
		$$renderer.option({
			value: "da",
			selected: !data.user.preferences?.locale || data.user.preferences.locale === "da"
		}, ($$renderer) => {
			$$renderer.push(`Dansk`);
		});
		$$renderer.option({
			value: "en",
			selected: data.user.preferences?.locale === "en"
		}, ($$renderer) => {
			$$renderer.push(`English`);
		});
		$$renderer.push(`</select></div> <div class="pref-row svelte-1i19ct2"><div class="pref-info svelte-1i19ct2"><span class="pref-name svelte-1i19ct2">${escape_html(t("settings.agent_model_name"))}</span> <span class="pref-desc svelte-1i19ct2">${escape_html(t("settings.agent_model_desc"))}</span> `);
		if (data.ollamaModels.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="pref-desc svelte-1i19ct2">${escape_html(t("settings.agent_model_unavailable"))}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <select name="aiModel" class="svelte-1i19ct2">`);
		$$renderer.option({
			value: "claude",
			selected: !data.user.preferences?.aiModel || data.user.preferences.aiModel === "claude"
		}, ($$renderer) => {
			$$renderer.push(`Claude (Sonnet 4.6)`);
		});
		$$renderer.push(`<!--[-->`);
		const each_array = ensure_array_like(data.ollamaModels);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let model = each_array[$$index];
			$$renderer.option({
				value: `ollama:${stringify(model)}`,
				selected: data.user.preferences?.aiModel === `ollama:${model}`
			}, ($$renderer) => {
				$$renderer.push(`${escape_html(model)}`);
			});
		}
		$$renderer.push(`<!--]--></select></div> <div class="form-row pref-save svelte-1i19ct2"><button type="submit" class="btn-accent svelte-1i19ct2">${escape_html(t("settings.save_prefs"))}</button> `);
		if (form?.prefsSuccess) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="ok svelte-1i19ct2">${escape_html(t("settings.saved"))}</span>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></form></div></section> <section class="section svelte-1i19ct2"><div class="section-label svelte-1i19ct2">${escape_html(t("settings.api_keys"))}</div> <div class="section-body svelte-1i19ct2">`);
		if (newToken) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="token-reveal svelte-1i19ct2"><div class="token-label svelte-1i19ct2">${escape_html(t("settings.key_new_label"))}</div> <code class="token-value svelte-1i19ct2">${escape_html(newToken)}</code> <div class="token-hint svelte-1i19ct2">Set as: <code class="svelte-1i19ct2">SLIDT_API_KEY=${escape_html(newToken)}</code></div> <button class="btn svelte-1i19ct2">${escape_html(t("settings.key_dismiss"))}</button></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<div class="keys-toolbar svelte-1i19ct2"><button class="btn-accent svelte-1i19ct2">${escape_html(t("settings.key_create"))}</button></div>`);
		$$renderer.push(`<!--]--> `);
		if (data.keys.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="empty svelte-1i19ct2">${escape_html(t("settings.key_empty"))}</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<table class="key-table svelte-1i19ct2"><thead class="svelte-1i19ct2"><tr class="svelte-1i19ct2"><th class="svelte-1i19ct2">${escape_html(t("settings.col_name"))}</th><th class="svelte-1i19ct2">${escape_html(t("settings.col_created"))}</th><th class="svelte-1i19ct2">${escape_html(t("settings.col_last_used"))}</th><th class="svelte-1i19ct2"></th></tr></thead><tbody class="svelte-1i19ct2"><!--[-->`);
			const each_array_1 = ensure_array_like(data.keys);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let key = each_array_1[$$index_1];
				$$renderer.push(`<tr class="svelte-1i19ct2"><td class="key-name svelte-1i19ct2">${escape_html(key.name)}</td><td class="meta-cell svelte-1i19ct2">${escape_html(new Date(key.createdAt).toLocaleDateString("da-DK"))}</td><td class="meta-cell svelte-1i19ct2">${escape_html(key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString("da-DK") : "—")}</td><td class="svelte-1i19ct2"><form method="POST" action="?/revokeKey"><input type="hidden" name="id"${attr("value", key.id)}/> <button type="submit" class="btn-sm danger svelte-1i19ct2">${escape_html(t("settings.key_revoke"))}</button></form></td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table>`);
		}
		$$renderer.push(`<!--]--></div></section>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-1RLT8hTc.js.map
