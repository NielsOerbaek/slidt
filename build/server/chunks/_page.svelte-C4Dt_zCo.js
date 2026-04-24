import { a7 as head, a5 as escape_html, a2 as attr_class, a3 as attr, a4 as stringify, a1 as ensure_array_like, X as derived, a9 as bind_props } from './dev-DoNs_J55.js';
import { S as STFace } from './STFace-Ds-aLye0.js';
import { t } from './i18n-BH3Uvo8w.js';
import './client-C1eEEMt-.js';
import { S as SlidePreview } from './SlidePreview-DG_geO0U.js';
import './internal-BZdXtTtr.js';
import './chunk-Do6Vi0cX.js';
import '@sveltejs/kit/internal';
import '@sveltejs/kit/internal/server';
import './renderer-AiFTzwmy.js';
import './validate-CiBKPHUw.js';
import 'handlebars';
import 'postcss';

//#region src/lib/components/FieldEditor.svelte
function FieldEditor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, value, onchange } = $$props;
		if (field.type === "text" || field.type === "image") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<input type="text"${attr("value", value ?? "")}${attr("placeholder", field.type === "image" ? "/api/assets/..." : "")} class="svelte-eevir9"/>`);
		} else if (field.type === "richtext" || field.type === "markdown") {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<textarea${attr("rows", field.type === "markdown" ? 6 : 3)} class="svelte-eevir9">`);
			const $$body = escape_html(value ?? "");
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea>`);
		} else if (field.type === "bool") {
			$$renderer.push("<!--[2-->");
			$$renderer.push(`<label class="bool-label svelte-eevir9"><input type="checkbox"${attr("checked", value ?? false, true)}/> <span>${escape_html(field.label ?? field.name)}</span></label>`);
		} else if (field.type === "select" && field.options) {
			$$renderer.push("<!--[3-->");
			$$renderer.select({
				value: value ?? "",
				onchange: (e) => onchange(e.target.value),
				class: ""
			}, ($$renderer) => {
				$$renderer.option({ value: "" }, ($$renderer) => {
					$$renderer.push(`${escape_html(t("field.select_default"))}`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array = ensure_array_like(field.options);
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let opt = each_array[$$index];
					$$renderer.option({ value: opt }, ($$renderer) => {
						$$renderer.push(`${escape_html(opt)}`);
					});
				}
				$$renderer.push(`<!--]-->`);
			}, "svelte-eevir9");
		} else if (field.type === "list" && field.items) {
			$$renderer.push("<!--[4-->");
			const items = Array.isArray(value) ? value : [];
			$$renderer.push(`<div class="list-field svelte-eevir9"><!--[-->`);
			const each_array_1 = ensure_array_like(items);
			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let item = each_array_1[i];
				$$renderer.push(`<div class="list-row svelte-eevir9">`);
				FieldEditor($$renderer, {
					field: field.items,
					value: item,
					onchange: (v) => {
						const next = [...items];
						next[i] = v;
						onchange(next);
					}
				});
				$$renderer.push(`<!----> <button type="button" class="remove-btn svelte-eevir9"${attr("aria-label", t("field.remove"))}>×</button></div>`);
			}
			$$renderer.push(`<!--]--> <button type="button" class="add-item-btn svelte-eevir9">${escape_html(t("field.add_item", { label: field.items.label ?? field.items.name ?? "item" }))}</button></div>`);
		} else if (field.type === "group" && field.fields) {
			$$renderer.push("<!--[5-->");
			const grp = typeof value === "object" && value !== null ? value : {};
			$$renderer.push(`<div class="group-field svelte-eevir9"><!--[-->`);
			const each_array_2 = ensure_array_like(field.fields);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let subField = each_array_2[$$index_2];
				$$renderer.push(`<div class="group-row svelte-eevir9"><label class="sub-label svelte-eevir9">${escape_html(subField.label ?? subField.name)}</label> `);
				FieldEditor($$renderer, {
					field: subField,
					value: grp[subField.name],
					onchange: (v) => onchange({
						...grp,
						[subField.name]: v
					})
				});
				$$renderer.push(`<!----></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/components/st/STField.svelte
function STField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { n, label, value = "", big = false, multi = false, mono = false, placeholder = "", type = "text", disabled = false, autocomplete, name, children, oninput } = $$props;
		$$renderer.push(`<label${attr_class("st-field svelte-1eu12f7", void 0, { "has-num": Boolean(n) })}>`);
		if (n) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="num svelte-1eu12f7">${escape_html(n)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="body"><div class="label svelte-1eu12f7">${escape_html(label)}</div> <div${attr_class("value-wrap svelte-1eu12f7", void 0, {
			"big": big,
			"mono": mono
		})}>`);
		if (children) {
			$$renderer.push("<!--[0-->");
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else if (multi) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<textarea${attr("placeholder", placeholder)}${attr("disabled", disabled, true)}${attr("name", name)} rows="2" class="svelte-1eu12f7">`);
			const $$body = escape_html(value);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<input${attr("value", value)}${attr("type", type)}${attr("placeholder", placeholder)}${attr("disabled", disabled, true)}${attr("autocomplete", autocomplete)}${attr("name", name)} class="svelte-1eu12f7"/>`);
		}
		$$renderer.push(`<!--]--></div></div></label>`);
		bind_props($$props, { value });
	});
}
//#endregion
//#region src/lib/components/st/STTurn.svelte
function STTurn($$renderer, $$props) {
	let { num, role, thinking = false, children } = $$props;
	const isAgent = derived(() => role === "-_-");
	$$renderer.push(`<div class="st-turn svelte-pj5954"><div class="num svelte-pj5954">${escape_html(num)}</div> <div class="body"><div${attr_class("role svelte-pj5954", void 0, { "agent": isAgent() })}>${escape_html(role)}${escape_html(thinking ? " · THINKING…" : "")}</div> <div${attr_class("content svelte-pj5954", void 0, { "thinking": thinking })}>`);
	children($$renderer);
	$$renderer.push(`<!----></div></div></div>`);
}
//#endregion
//#region src/lib/components/st/STAgentDrawer.svelte
function STAgentDrawer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { deckId, themeId = null, open = false } = $$props;
		let messages = [];
		let input = "";
		let sending = false;
		const turnCount = derived(() => messages.length);
		let undoStack = [];
		function isThinking(m) {
			if (m.role !== "assistant") return false;
			return false;
		}
		function plainText(m) {
			return m.parts.filter((p) => p.kind === "text").map((p) => p.text).join("");
		}
		function canUndo(undoPatch) {
			if (!undoPatch || typeof undoPatch !== "object") return false;
			const patch = undoPatch;
			if (patch.type === "update_theme") return Boolean(themeId);
			return [
				"patch_slide",
				"delete_slide",
				"reorder_slides"
			].includes(patch.type);
		}
		$$renderer.push(`<div${attr_class("drawer svelte-1v8krrf", void 0, { "open": open })}>`);
		if (open) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="panel-head svelte-1v8krrf">`);
			STFace($$renderer, {
				size: 16,
				color: "var(--st-cobalt)"
			});
			$$renderer.push(`<!----> <span class="tag svelte-1v8krrf">${escape_html(t("agent.tag"))}</span> <span${attr_class("dot svelte-1v8krrf", void 0, { "live": sending })} aria-hidden="true"></span> <span class="status svelte-1v8krrf">${escape_html(t("agent.live"))} · ${escape_html(turnCount())} ${escape_html(turnCount() === 1 ? t("agent.turn_singular") : t("agent.turn_plural"))}</span> <span class="spacer svelte-1v8krrf"></span> <button class="panel-close svelte-1v8krrf" type="button" aria-label="Close agent">×</button></div> <div class="body svelte-1v8krrf"><div class="transcript svelte-1v8krrf">`);
			if (messages.length === 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="hello svelte-1v8krrf">`);
				STFace($$renderer, {
					size: 32,
					color: "var(--st-cobalt)"
				});
				$$renderer.push(`<!----> <div class="hello-line svelte-1v8krrf">${escape_html(t("agent.hello"))}</div></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--[-->`);
				const each_array = ensure_array_like(messages);
				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let msg = each_array[i];
					STTurn($$renderer, {
						num: String(i + 1).padStart(2, "0"),
						role: msg.role === "assistant" ? "-_-" : "YOU",
						thinking: isThinking(msg),
						children: ($$renderer) => {
							if (msg.role === "user") {
								$$renderer.push("<!--[0-->");
								$$renderer.push(`<span class="content svelte-1v8krrf">${escape_html(plainText(msg))}</span>`);
							} else {
								$$renderer.push("<!--[-1-->");
								$$renderer.push(`<div class="parts svelte-1v8krrf"><!--[-->`);
								const each_array_1 = ensure_array_like(msg.parts);
								for (let j = 0, $$length = each_array_1.length; j < $$length; j++) {
									let part = each_array_1[j];
									if (part.kind === "text" && part.text) {
										$$renderer.push("<!--[0-->");
										$$renderer.push(`<span class="content svelte-1v8krrf">${escape_html(part.text)}</span>`);
									} else if (part.kind === "tool") {
										$$renderer.push("<!--[1-->");
										$$renderer.push(`<div class="tool-line svelte-1v8krrf"><span class="tool-marker svelte-1v8krrf">↳</span> <span class="tool-name svelte-1v8krrf">${escape_html(part.name)}</span> `);
										if (!part.result) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<span class="tool-pending svelte-1v8krrf">${escape_html(t("agent.tool_pending"))}</span>`);
										} else if (part.result.startsWith("error")) {
											$$renderer.push("<!--[1-->");
											$$renderer.push(`<span class="tool-err svelte-1v8krrf">${escape_html(t("agent.tool_failed"))}</span>`);
										} else {
											$$renderer.push("<!--[-1-->");
											$$renderer.push(`<span class="tool-ok svelte-1v8krrf">${escape_html(t("agent.tool_ok"))}</span>`);
										}
										$$renderer.push(`<!--]--></div> `);
										if (part.result && part.result.startsWith("error")) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<div class="tool-err-msg svelte-1v8krrf">${escape_html(part.result)}</div>`);
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]--> `);
										if (part.image) {
											$$renderer.push("<!--[0-->");
											$$renderer.push(`<img class="tool-image svelte-1v8krrf"${attr("src", `data:${part.image.mediaType};base64,${part.image.base64}`)} alt="Slide preview" loading="lazy"/>`);
										} else $$renderer.push("<!--[-1-->");
										$$renderer.push(`<!--]-->`);
									} else $$renderer.push("<!--[-1-->");
									$$renderer.push(`<!--]-->`);
								}
								$$renderer.push(`<!--]--></div>`);
							}
							$$renderer.push(`<!--]-->`);
						}});
				}
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--></div> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (undoStack.length > 0) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="undo-stack svelte-1v8krrf"><div class="undo-header svelte-1v8krrf"><span class="undo-title svelte-1v8krrf">↩ ${escape_html(undoStack.length)} UNDOABLE</span></div> <div class="undo-list svelte-1v8krrf"><!--[-->`);
				const each_array_2 = ensure_array_like(undoStack);
				for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
					let entry = each_array_2[i];
					if (canUndo(entry.undoPatch)) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<button class="undo-row svelte-1v8krrf" type="button"><span class="undo-tool svelte-1v8krrf">${escape_html(entry.tool)}</span> <span class="undo-label svelte-1v8krrf">${escape_html(entry.label)}</span> <span class="undo-btn svelte-1v8krrf">UNDO</span></button>`);
					} else {
						$$renderer.push("<!--[-1-->");
						$$renderer.push(`<div class="undo-row undo-row-static svelte-1v8krrf"><span class="undo-tool svelte-1v8krrf">${escape_html(entry.tool)}</span> <span class="undo-label svelte-1v8krrf">${escape_html(entry.label)}</span></div>`);
					}
					$$renderer.push(`<!--]-->`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div class="footer svelte-1v8krrf"><div class="compose svelte-1v8krrf"><span class="compose-num svelte-1v8krrf">${escape_html(String(messages.length + 1).padStart(2, "0"))} ·</span> <textarea${attr("placeholder", t("agent.compose_placeholder"))} rows="1"${attr("disabled", sending, true)} class="svelte-1v8krrf">`);
			const $$body = escape_html(input);
			if ($$body) $$renderer.push(`${$$body}`);
			$$renderer.push(`</textarea> <span class="compose-cmd svelte-1v8krrf">⇧↵</span></div></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
		bind_props($$props, { open });
	});
}
//#endregion
//#region src/lib/utils/debounce.ts
function debounce(fn, delay) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	};
}
//#endregion
//#region src/lib/utils/slide-snippet.ts
var STRING_LIKE = new Set([
	"text",
	"richtext",
	"markdown"
]);
var FALLBACK_KEYS = [
	"title",
	"head",
	"label",
	"name",
	"eyebrow"
];
var MAX_LEN = 60;
/**
* Extract a short readable preview of a slide's content for the slide list.
* Tries (in order): a top-level `title` field, any other top-level text field,
* the first item of any list field. Returns null when the slide has no
* usable text — caller should fall back to the slide-type label.
*/
function slideSnippet(data, fields) {
	if (!data) return null;
	if (typeof data.title === "string" && data.title.trim()) return clip(data.title);
	for (const f of fields) {
		if (!STRING_LIKE.has(f.type)) continue;
		const v = data[f.name];
		if (typeof v === "string" && v.trim()) return clip(v);
	}
	for (const f of fields) {
		if (f.type !== "list") continue;
		const arr = data[f.name];
		if (!Array.isArray(arr) || arr.length === 0) continue;
		const first = arr[0];
		if (typeof first === "string" && first.trim()) return clip(first);
		if (first && typeof first === "object") {
			const obj = first;
			for (const k of FALLBACK_KEYS) {
				const v = obj[k];
				if (typeof v === "string" && v.trim()) return clip(v);
			}
		}
	}
	return null;
}
function clip(s) {
	const stripped = s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/\s+/g, " ").trim();
	return stripped.length > MAX_LEN ? stripped.slice(0, MAX_LEN - 1) + "…" : stripped;
}
//#endregion
//#region src/routes/decks/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		let slideDataMap = Object.fromEntries(data.slides.map((s) => [s.id, { ...s.data }]));
		let selectedSlideId = data.slides[0]?.id ?? null;
		let saving = false;
		let saveError = "";
		let exporting = false;
		let agentOpen = false;
		let mobilePane = "list";
		let selectedSlide = derived(() => data.slides.find((s) => s.id === selectedSlideId) ?? null);
		let selectedType = derived(() => selectedSlide() ? data.slideTypes.find((t) => t.id === selectedSlide().typeId) ?? null : null);
		let selectedData = derived(() => selectedSlideId ? slideDataMap[selectedSlideId] ?? {} : {});
		const selectedIdx = derived(() => selectedSlideId ? data.slides.findIndex((s) => s.id === selectedSlideId) : -1);
		const saveLabel = derived(() => saving ? t("editor.save_busy") : saveError ? t("editor.save_error") : t("editor.save_idle"));
		const autosave = debounce(async (slideId, slideData) => {
			saving = true;
			saveError = "";
			try {
				if (!(await fetch(`/api/decks/${data.deck.id}/slides/${slideId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ data: slideData })
				})).ok) saveError = "Save failed";
			} catch {
				saveError = "Save failed";
			} finally {
				saving = false;
			}
		}, 500);
		function handleFieldChange(newData) {
			if (!selectedSlideId) return;
			slideDataMap[selectedSlideId] = newData;
			autosave(selectedSlideId, newData);
		}
		let draggedId = null;
		let dropTargetId = null;
		let dropPosition = "before";
		const displaySlides = derived(() => {
			return data.slides;
		});
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			head("1opty6d", $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>${escape_html(data.deck.title)} — slidt</title>`);
				});
			});
			$$renderer.push(`<div class="editor svelte-1opty6d"><div class="breadcrumb svelte-1opty6d"><div class="cell index svelte-1opty6d">§3</div> <div class="cell crumbs svelte-1opty6d"><a href="/decks" class="crumb-link svelte-1opty6d">${escape_html(t("editor.crumb_decks"))}</a> <span class="dim svelte-1opty6d">/</span> <span class="dim svelte-1opty6d">${escape_html(String(data.deck.slideOrder.length).padStart(2, "0"))}</span> <span class="dim svelte-1opty6d">›</span> <span class="title svelte-1opty6d">${escape_html(data.deck.title)}</span> <span${attr_class("pill svelte-1opty6d", void 0, {
				"pill-error": saveError,
				"pill-saving": saving
			})}>${escape_html(saveLabel())}</span></div> <div class="cell actions svelte-1opty6d"><a class="action svelte-1opty6d"${attr("href", `/api/decks/${stringify(data.deck.id)}/present`)} target="_blank">${escape_html(t("editor.action_present"))}</a> <button class="action svelte-1opty6d"${attr("disabled", exporting, true)}>${escape_html(t("editor.action_export"))}</button> <button class="action svelte-1opty6d" type="button">${escape_html(t("editor.theme_button"))}${escape_html(data.theme ? ` · ${data.theme.name}` : "")}</button> <button class="action svelte-1opty6d" type="button">${escape_html(t("editor.action_share"))}</button> <button class="action danger svelte-1opty6d" type="button">${escape_html(t("editor.action_delete"))}</button> <button class="action accent svelte-1opty6d" type="button"${attr("aria-pressed", agentOpen)}>`);
			STFace($$renderer, {
				size: 14,
				color: "var(--st-bg)",
				mood: agentOpen ? "happy" : "idle"
			});
			$$renderer.push(`<!----> ${escape_html(agentOpen ? t("editor.agent_on") : t("editor.agent_off"))}</button></div></div> <div class="body svelte-1opty6d"><aside${attr_class("slide-list svelte-1opty6d", void 0, { "mob-active": mobilePane === "list" })}><div class="list-head svelte-1opty6d"><span>${escape_html(t("editor.slides_label"))}</span> <span>${escape_html(String(data.slides.length).padStart(2, "0"))}</span></div> <div class="list-body svelte-1opty6d"><!--[-->`);
			const each_array = ensure_array_like(displaySlides());
			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let slide = each_array[i];
				const type = data.slideTypes.find((t) => t.id === slide.typeId);
				const active = selectedSlideId === slide.id;
				const snippet = type ? slideSnippet(slideDataMap[slide.id], type.fields) : null;
				$$renderer.push(`<div${attr_class("srow svelte-1opty6d", void 0, {
					"active": active,
					"dragging": draggedId === slide.id,
					"drop-before": dropTargetId === slide.id && dropPosition === "before",
					"drop-after": dropTargetId === slide.id && dropPosition === "after"
				})} role="button" tabindex="0" draggable="true"><span class="srow-n svelte-1opty6d">${escape_html(String(i + 1).padStart(2, "0"))}</span> <span class="srow-body svelte-1opty6d"><span class="srow-title svelte-1opty6d">${escape_html(snippet ?? type?.label ?? t("editor.slide_unknown"))}</span> `);
				if (snippet && type) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="srow-type svelte-1opty6d">${escape_html(type.label.toUpperCase())}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></span> <button class="srow-del svelte-1opty6d" type="button"${attr("title", t("editor.delete_slide"))}${attr("aria-label", t("editor.delete_slide"))}>×</button> <span class="srow-grip svelte-1opty6d" aria-hidden="true">⋮⋮</span></div>`);
			}
			$$renderer.push(`<!--]--></div> <button class="list-foot svelte-1opty6d" type="button"><span>${escape_html(t("editor.slides_add"))}</span> <span class="key svelte-1opty6d">n</span></button></aside> <section${attr_class("form svelte-1opty6d", void 0, { "mob-active": mobilePane === "edit" })}>`);
			if (selectedSlide() && selectedType()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="form-head svelte-1opty6d">${escape_html(t("editor.form_head", {
					n: String(selectedIdx() + 1).padStart(2, "0"),
					type: selectedType().name.toUpperCase()
				}))}</div> <div class="fields svelte-1opty6d"><!--[-->`);
				const each_array_1 = ensure_array_like(selectedType().fields);
				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let field = each_array_1[i];
					STField($$renderer, {
						n: String(i + 1).padStart(2, "0"),
						label: field.label ?? field.name,
						value: "",
						children: ($$renderer) => {
							FieldEditor($$renderer, {
								field,
								value: selectedData()[field.name],
								onchange: (v) => handleFieldChange({
									...selectedData(),
									[field.name]: v
								})
							});
						},
						$$slots: { default: true }
					});
				}
				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="form-empty svelte-1opty6d">${escape_html(data.slides.length === 0 ? t("editor.form_empty_no_slides") : t("editor.form_empty_select"))}</div>`);
			}
			$$renderer.push(`<!--]--></section> <section${attr_class("right svelte-1opty6d", void 0, {
				"mob-active": mobilePane === "agent",
				"mob-agent": mobilePane === "agent"
			})}><div class="preview-wrap svelte-1opty6d"><div class="preview-meta svelte-1opty6d"><span>${escape_html(t("editor.preview_meta"))}</span> `);
			if (selectedSlideId) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span>${escape_html(t("editor.preview_slide_of", {
					n: String(selectedIdx() + 1).padStart(2, "0"),
					total: String(data.slides.length).padStart(2, "0")
				}))}</span>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<span>—</span>`);
			}
			$$renderer.push(`<!--]--></div> <div class="preview-frame svelte-1opty6d">`);
			SlidePreview($$renderer, {
				slideType: selectedType(),
				slideData: selectedData(),
				theme: data.theme
			});
			$$renderer.push(`<!----></div> <div class="thumbs svelte-1opty6d"><!--[-->`);
			const each_array_2 = ensure_array_like(displaySlides());
			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				const active = selectedSlideId === each_array_2[i].id;
				$$renderer.push(`<button type="button"${attr_class("thumb svelte-1opty6d", void 0, { "active": active })}${attr("title", String(i + 1).padStart(2, "0"))}>${escape_html(String(i + 1).padStart(2, "0"))}</button>`);
			}
			$$renderer.push(`<!--]--></div></div> `);
			STAgentDrawer($$renderer, {
				deckId: data.deck.id,
				themeId: data.deck.themeId,
				get open() {
					return agentOpen;
				},
				set open($$value) {
					agentOpen = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----></section></div> <div class="mob-tabs svelte-1opty6d"><button${attr_class("svelte-1opty6d", void 0, { "active": mobilePane === "list" })}>${escape_html(t("editor.slides_label"))}</button> <button${attr_class("svelte-1opty6d", void 0, { "active": mobilePane === "edit" })}>${escape_html(t("editor.mob_edit"))}</button> <button${attr_class("svelte-1opty6d", void 0, { "active": mobilePane === "preview" })}>${escape_html(t("editor.mob_preview"))}</button> <button${attr_class("mob-agent-tab svelte-1opty6d", void 0, { "active": mobilePane === "agent" })}>${escape_html(t("editor.mob_agent"))}</button></div></div> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-C4Dt_zCo.js.map
