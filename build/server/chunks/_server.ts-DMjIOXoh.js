import { d as db, f as agentMessages, a as decks, t as themes, b as slideTypes, i as issues, c as slides } from './db-CWmjlPNh.js';
import { r as requireDeckRole } from './deck-access-DZX5watP.js';
import { v as validate, V as ValidationError } from './validate-CiBKPHUw.js';
import { error } from '@sveltejs/kit';
import { eq, or, and, asc, inArray } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';
import Handlebars from 'handlebars';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';

//#region src/lib/server/agent/guardrails.ts
var GuardrailError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "GuardrailError";
	}
};
var ALLOWED_HELPERS = new Set([
	"fmt",
	"eq",
	"default",
	"each",
	"if",
	"unless",
	"with"
]);
function walkAst(node) {
	if (!node || typeof node !== "object") return;
	const n = node;
	switch (n.type) {
		case "PartialStatement":
		case "PartialBlock": throw new GuardrailError("Partial references are not allowed in templates");
		case "MustacheStatement": {
			const path = n.path;
			const params = n.params ?? [];
			const hash = n.hash;
			if (path && (params.length > 0 || (hash?.pairs.length ?? 0) > 0)) {
				if (!ALLOWED_HELPERS.has(path.original)) throw new GuardrailError(`Unknown helper: "${path.original}"`);
			}
			break;
		}
		case "BlockStatement": {
			const path = n.path;
			if (path && !ALLOWED_HELPERS.has(path.original)) throw new GuardrailError(`Unknown block helper: "${path.original}"`);
			break;
		}
		case "SubExpression": {
			const path = n.path;
			if (path && !ALLOWED_HELPERS.has(path.original)) throw new GuardrailError(`Unknown helper in sub-expression: "${path.original}"`);
			break;
		}
	}
	for (const key of Object.keys(n)) {
		if (key === "type") continue;
		const child = n[key];
		if (Array.isArray(child)) for (const item of child) walkAst(item);
		else if (child && typeof child === "object" && "type" in child) walkAst(child);
	}
}
function checkHandlebarsTemplate(template) {
	let ast;
	try {
		ast = Handlebars.parse(template);
	} catch (err) {
		throw new GuardrailError(`Template parse error: ${err instanceof Error ? err.message : String(err)}`);
	}
	walkAst(ast);
}
var UNSAFE_URL_RE = /^(?:https?:|ftp:|\/\/|javascript:)/i;
function checkCss(css) {
	if (/@import/i.test(css)) throw new GuardrailError("@import is not allowed in template CSS");
	for (const match of css.matchAll(/url\s*\(\s*['"]?(.*?)['"]?\s*\)/gi)) {
		const urlValue = (match[1] ?? "").trim();
		if (urlValue && UNSAFE_URL_RE.test(urlValue)) throw new GuardrailError(`url() with external reference is not allowed: ${urlValue}`);
	}
	if (/expression\s*\(/i.test(css)) throw new GuardrailError("expression() is not allowed in template CSS");
	if (/\bbehavior\s*:/i.test(css)) throw new GuardrailError("behavior: is not allowed in template CSS");
}
//#endregion
//#region src/lib/server/agent/tools.ts
/**
* Defensive coercion for tool inputs that should be objects. Anthropic's
* tool input occasionally arrives as a JSON-encoded string (especially on
* deeply nested payloads), which silently breaks downstream code that
* treats `data` as an object. Try a single JSON.parse pass when we see a
* string; otherwise return the value as-is.
*/
function coerceObject(value) {
	if (value === void 0 || value === null) return void 0;
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
		} catch {
			return;
		}
		return;
	}
	if (typeof value === "object" && !Array.isArray(value)) return value;
}
var AGENT_TOOLS = [
	{
		name: "list_slides",
		description: "List all slides in the deck with their IDs, type names, and data.",
		input_schema: {
			type: "object",
			properties: {},
			required: []
		}
	},
	{
		name: "get_slide",
		description: "Get a specific slide by ID, including all field data.",
		input_schema: {
			type: "object",
			properties: { id: {
				type: "string",
				description: "Slide ID (UUID)"
			} },
			required: ["id"]
		}
	},
	{
		name: "patch_slide",
		description: "Merge-patch a slide's data fields. Only specified fields are updated.",
		input_schema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "Slide ID (UUID)"
				},
				patch: {
					type: "object",
					description: "Fields to update (merged into existing data)"
				}
			},
			required: ["id", "patch"]
		}
	},
	{
		name: "add_slide",
		description: "Add a new slide to the end of the deck.",
		input_schema: {
			type: "object",
			properties: {
				typeId: {
					type: "string",
					description: "SlideType ID (UUID)"
				},
				data: {
					type: "object",
					description: "Initial field data (optional)"
				}
			},
			required: ["typeId"]
		}
	},
	{
		name: "delete_slide",
		description: "Delete a slide from the deck.",
		input_schema: {
			type: "object",
			properties: { id: {
				type: "string",
				description: "Slide ID (UUID)"
			} },
			required: ["id"]
		}
	},
	{
		name: "reorder_slides",
		description: "Set a new ordering for deck slides. Provide the complete slide order as an array of all slide IDs.",
		input_schema: {
			type: "object",
			properties: { order: {
				type: "array",
				items: { type: "string" },
				description: "Complete ordered array of all slide IDs (UUIDs)"
			} },
			required: ["order"]
		}
	},
	{
		name: "update_theme",
		description: "Patch CSS custom-property tokens in the deck theme. Only specified tokens are updated.",
		input_schema: {
			type: "object",
			properties: { tokens: {
				type: "object",
				description: "CSS custom-property name to value, e.g. {\"--ood-accent\": \"#5B21B6\"}"
			} },
			required: ["tokens"]
		}
	},
	{
		name: "create_slide_type",
		description: "Create a new deck-scoped slide type with a Handlebars HTML template and scoped CSS.",
		input_schema: {
			type: "object",
			properties: {
				name: {
					type: "string",
					description: "Unique slug, e.g. \"quote-with-photo\""
				},
				label: {
					type: "string",
					description: "Human-readable label"
				},
				fields: {
					type: "array",
					description: "Field schema array",
					items: { type: "object" }
				},
				htmlTemplate: {
					type: "string",
					description: "Handlebars HTML template"
				},
				css: {
					type: "string",
					description: "Scoped CSS (auto-prefixed to .st-<name>)"
				}
			},
			required: [
				"name",
				"label",
				"fields",
				"htmlTemplate",
				"css"
			]
		}
	},
	{
		name: "patch_slide_type",
		description: "Update a deck-scoped slide type's label, fields, htmlTemplate, or css. Only deck-scoped types can be patched (global types are read-only). Use this after inspect_slide_type reveals the template needs fixing.",
		input_schema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "SlideType ID (UUID)"
				},
				label: {
					type: "string",
					description: "New human-readable label (optional)"
				},
				fields: {
					type: "array",
					description: "Replacement field schema array (optional)",
					items: { type: "object" }
				},
				htmlTemplate: {
					type: "string",
					description: "Replacement Handlebars template (optional)"
				},
				css: {
					type: "string",
					description: "Replacement scoped CSS (optional)"
				}
			},
			required: ["id"]
		}
	},
	{
		name: "delete_slide_type",
		description: "Delete a deck-scoped slide type. Refuses if any slide in the deck still uses it (delete those slides first). Global types cannot be deleted.",
		input_schema: {
			type: "object",
			properties: { id: {
				type: "string",
				description: "SlideType ID (UUID)"
			} },
			required: ["id"]
		}
	},
	{
		name: "fetch_url",
		description: "Fetch the text content of a web page or URL. Use this to read articles, documents, or any web content the user wants to base slides on. Returns plain text (HTML stripped).",
		input_schema: {
			type: "object",
			properties: { url: {
				type: "string",
				description: "The URL to fetch"
			} },
			required: ["url"]
		}
	},
	{
		name: "list_slide_types",
		description: "List all slide types available for this deck (global + deck-scoped).",
		input_schema: {
			type: "object",
			properties: {},
			required: []
		}
	},
	{
		name: "report_issue",
		description: "Submit a bug report or feedback about the slidt platform itself (not deck content). Use this when you encounter a platform limitation, unexpected behavior, a missing feature, or something that seems broken. Admins review these reports.",
		input_schema: {
			type: "object",
			properties: {
				title: {
					type: "string",
					description: "Short one-line summary of the issue"
				},
				body: {
					type: "string",
					description: "Full description: what happened, what was expected, any relevant context"
				},
				severity: {
					type: "string",
					enum: [
						"low",
						"medium",
						"high"
					],
					description: "low = minor inconvenience, medium = blocks some work, high = critical failure"
				}
			},
			required: ["title", "body"]
		}
	},
	{
		name: "inspect_slide_type",
		description: "Render a slide type and return a PNG screenshot you can look at. Pass slideId to render an existing slide's actual data (use this after add_slide to see how real content fits the template); omit slideId to render with auto-generated dummy data (use this right after create_slide_type or patch_slide_type to verify the template). Always call this when you've created or modified a template, or when you've added the first slide of a slide type you haven't seen render before.",
		input_schema: {
			type: "object",
			properties: {
				id: {
					type: "string",
					description: "SlideType ID (UUID)"
				},
				slideId: {
					type: "string",
					description: "Optional Slide ID — when given, the screenshot uses that slide's real data instead of dummy data. The slide must belong to this deck."
				}
			},
			required: ["id"]
		}
	}
];
async function executeTool(deckId, toolName, input, userId) {
	switch (toolName) {
		case "list_slides": {
			const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
			if (!deck) return { result: "error: deck not found" };
			const slideRows = await db.select().from(slides).where(eq(slides.deckId, deckId));
			const typeIds = [...new Set(slideRows.map((s) => s.typeId))];
			const typeRows = typeIds.length ? await db.select().from(slideTypes).where(inArray(slideTypes.id, typeIds)) : [];
			const typeNameMap = new Map(typeRows.map((t) => [t.id, t.name]));
			const ordered = deck.slideOrder.map((id) => slideRows.find((s) => s.id === id)).filter(Boolean).map((s) => ({
				id: s.id,
				typeName: typeNameMap.get(s.typeId) ?? s.typeId,
				data: s.data
			}));
			return { result: JSON.stringify(ordered, null, 2) };
		}
		case "get_slide": {
			const id = input.id;
			const [slide] = await db.select().from(slides).where(and(eq(slides.id, id), eq(slides.deckId, deckId))).limit(1);
			if (!slide) return { result: `error: slide ${id} not found` };
			const [type] = await db.select().from(slideTypes).where(eq(slideTypes.id, slide.typeId)).limit(1);
			return { result: JSON.stringify({
				...slide,
				typeName: type?.name
			}, null, 2) };
		}
		case "patch_slide": {
			const id = input.id;
			const patch = coerceObject(input.patch);
			if (!patch) return { result: "error: patch must be an object (got string or other type)" };
			const [slide] = await db.select().from(slides).where(and(eq(slides.id, id), eq(slides.deckId, deckId))).limit(1);
			if (!slide) return { result: `error: slide ${id} not found` };
			const [type] = await db.select().from(slideTypes).where(eq(slideTypes.id, slide.typeId)).limit(1);
			const before = slide.data;
			const merged = {
				...before,
				...patch
			};
			if (type) try {
				validate(merged, type.fields);
			} catch (err) {
				if (err instanceof ValidationError) return { result: `error: ${err.message}` };
				throw err;
			}
			await db.update(slides).set({ data: merged }).where(eq(slides.id, id));
			await db.update(decks).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(decks.id, deckId));
			return {
				result: "ok",
				undoPatch: {
					type: "patch_slide",
					id,
					before
				}
			};
		}
		case "add_slide": {
			const typeId = input.typeId;
			const data = coerceObject(input.data) ?? {};
			const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
			if (!deck) return { result: "error: deck not found" };
			const [type] = await db.select().from(slideTypes).where(eq(slideTypes.id, typeId)).limit(1);
			if (!type) return { result: `error: slide type ${typeId} not found` };
			try {
				validate(data, type.fields);
			} catch (err) {
				if (err instanceof ValidationError) return { result: `error: ${err.message}` };
				throw err;
			}
			const orderIndex = deck.slideOrder.length;
			const [slide] = await db.insert(slides).values({
				deckId,
				typeId,
				data,
				orderIndex
			}).returning();
			await db.update(decks).set({
				slideOrder: [...deck.slideOrder, slide.id],
				updatedAt: /* @__PURE__ */ new Date()
			}).where(eq(decks.id, deckId));
			return {
				result: `ok (id: ${slide.id})`,
				undoPatch: {
					type: "delete_slide",
					id: slide.id
				}
			};
		}
		case "delete_slide": {
			const id = input.id;
			const [slide] = await db.select().from(slides).where(and(eq(slides.id, id), eq(slides.deckId, deckId))).limit(1);
			if (!slide) return { result: `error: slide ${id} not found` };
			const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
			const prevOrder = deck?.slideOrder ?? [];
			await db.delete(slides).where(eq(slides.id, id));
			await db.update(decks).set({
				slideOrder: prevOrder.filter((sid) => sid !== id),
				updatedAt: /* @__PURE__ */ new Date()
			}).where(eq(decks.id, deckId));
			return {
				result: "ok",
				undoPatch: {
					type: "add_slide",
					typeId: slide.typeId,
					data: slide.data,
					orderIndex: slide.orderIndex
				}
			};
		}
		case "reorder_slides": {
			const order = input.order;
			const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
			const previousOrder = deck?.slideOrder ?? [];
			await db.update(decks).set({
				slideOrder: order,
				updatedAt: /* @__PURE__ */ new Date()
			}).where(eq(decks.id, deckId));
			return {
				result: "ok",
				undoPatch: {
					type: "reorder_slides",
					previousOrder
				}
			};
		}
		case "update_theme": {
			const tokens = input.tokens;
			const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
			if (!deck?.themeId) return { result: "error: deck has no theme" };
			const [theme] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
			if (!theme) return { result: "error: theme not found" };
			const before = theme.tokens;
			await db.update(themes).set({ tokens: {
				...before,
				...tokens
			} }).where(eq(themes.id, theme.id));
			return {
				result: "ok",
				undoPatch: {
					type: "update_theme",
					themeId: theme.id,
					before
				}
			};
		}
		case "create_slide_type": {
			const name = input.name;
			const label = input.label;
			const fields = input.fields;
			const htmlTemplate = input.htmlTemplate;
			const css = input.css ?? "";
			checkHandlebarsTemplate(htmlTemplate);
			checkCss(css);
			const [st] = await db.insert(slideTypes).values({
				name,
				label,
				fields,
				htmlTemplate,
				css,
				scope: "deck",
				deckId
			}).returning();
			return {
				result: `ok (id: ${st.id})`,
				undoPatch: {
					type: "delete_slide_type",
					id: st.id
				}
			};
		}
		case "fetch_url": {
			const url = input.url;
			try {
				const res = await fetch(url, {
					headers: { "User-Agent": "Mozilla/5.0 (compatible; slidt-agent/1.0)" },
					signal: AbortSignal.timeout(1e4)
				});
				if (!res.ok) return { result: `error: HTTP ${res.status}` };
				return { result: (await res.text()).replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s{2,}/g, " ").trim().slice(0, 8e3) };
			} catch (err) {
				return { result: `error: ${err instanceof Error ? err.message : String(err)}` };
			}
		}
		case "patch_slide_type": {
			const id = input.id;
			const [st] = await db.select().from(slideTypes).where(eq(slideTypes.id, id)).limit(1);
			if (!st) return { result: `error: slide type ${id} not found` };
			if (st.scope !== "deck" || st.deckId !== deckId) return { result: "error: only deck-scoped slide types belonging to this deck can be patched" };
			const updates = {};
			if (typeof input.label === "string") updates.label = input.label;
			if (Array.isArray(input.fields)) updates.fields = input.fields;
			if (typeof input.htmlTemplate === "string") {
				checkHandlebarsTemplate(input.htmlTemplate);
				updates.htmlTemplate = input.htmlTemplate;
			}
			if (typeof input.css === "string") {
				checkCss(input.css);
				updates.css = input.css;
			}
			if (Object.keys(updates).length === 0) return { result: "error: nothing to update (provide at least one of label/fields/htmlTemplate/css)" };
			const before = {
				label: st.label,
				fields: st.fields,
				htmlTemplate: st.htmlTemplate,
				css: st.css
			};
			await db.update(slideTypes).set(updates).where(eq(slideTypes.id, id));
			return {
				result: "ok",
				undoPatch: {
					type: "patch_slide_type",
					id,
					before
				}
			};
		}
		case "delete_slide_type": {
			const id = input.id;
			const [st] = await db.select().from(slideTypes).where(eq(slideTypes.id, id)).limit(1);
			if (!st) return { result: `error: slide type ${id} not found` };
			if (st.scope !== "deck" || st.deckId !== deckId) return { result: "error: only deck-scoped slide types belonging to this deck can be deleted" };
			const inUse = await db.select({ id: slides.id }).from(slides).where(and(eq(slides.deckId, deckId), eq(slides.typeId, id))).limit(1);
			if (inUse.length > 0) return { result: `error: slide type still in use by at least one slide (${inUse[0].id}); delete those slides first` };
			await db.delete(slideTypes).where(eq(slideTypes.id, id));
			return {
				result: "ok",
				undoPatch: {
					type: "create_slide_type",
					name: st.name,
					label: st.label,
					fields: st.fields,
					htmlTemplate: st.htmlTemplate,
					css: st.css
				}
			};
		}
		case "inspect_slide_type": {
			const id = input.id;
			const slideId = typeof input.slideId === "string" && input.slideId ? input.slideId : null;
			try {
				const { screenshotSlideType } = await import('./screenshot-DUctXddR.js');
				const png = await screenshotSlideType(id, deckId, slideId ? { slideId } : {});
				const base64 = png.toString("base64");
				const dataNote = slideId ? `slide=${slideId}` : "dummy data";
				return {
					result: `ok — rendered ${png.byteLength} bytes at 1920x1080 (${dataNote})`,
					image: {
						base64,
						mediaType: "image/png"
					}
				};
			} catch (err) {
				return { result: `error: ${err instanceof Error ? err.message : String(err)}` };
			}
		}
		case "list_slide_types": {
			const rows = await db.select({
				id: slideTypes.id,
				name: slideTypes.name,
				label: slideTypes.label,
				scope: slideTypes.scope,
				fields: slideTypes.fields
			}).from(slideTypes).where(or(eq(slideTypes.scope, "global"), and(eq(slideTypes.scope, "deck"), eq(slideTypes.deckId, deckId))));
			return { result: JSON.stringify(rows, null, 2) };
		}
		case "report_issue": {
			const title = input.title?.trim();
			const body = input.body?.trim() ?? "";
			const severity = [
				"low",
				"medium",
				"high"
			].includes(input.severity) ? input.severity : "medium";
			if (!title) return { result: "error: title is required" };
			await db.insert(issues).values({
				userId: userId ?? null,
				deckId,
				title,
				body,
				severity
			});
			return { result: `ok — issue reported: "${title}"` };
		}
		default: return { result: `error: unknown tool "${toolName}"` };
	}
}
//#endregion
//#region src/lib/server/agent/runner.ts
var client = new Anthropic();
var BASE_SYSTEM_PROMPT = `You are a slide deck assistant for Os & Data, a Danish cooperative association. \
You help users edit presentations using the available tools.

Guidelines:
- Keep all content in Danish unless the user explicitly asks otherwise
- When using create_slide_type / patch_slide_type, only use these Handlebars helpers: fmt, eq, default, each, if, unless
- CSS in templates must not contain @import, external url(), expression(), or behavior:
- After using tools, briefly describe what you changed
- Be concise — let the tools do the work

Content field rules (CRITICAL):
- NEVER put HTML markup in content fields. Write plain text only. The template handles all formatting.
- Do not use <b>, <em>, <br>, <p>, <ul>, <li>, or any other HTML tags in data fields.
- Do not use Markdown syntax (**, *, #) in content fields unless the field type is explicitly "markdown".

Template rules (IMPORTANT — violations cause "[object Object]" in output):
- {{fmt value}} only works on STRING fields. Never pass an object or array to fmt.
- For list fields (type: "list"), iterate with {{#each items}}...{{/each}} and access string properties inside: {{fmt this.propertyName}}
- For group fields (type: "group"), access each sub-field directly: {{fmt field.subField}}
- Always call list_slide_types before add_slide to check the exact field names and types

Field-shape rules for add_slide / patch_slide data (READ CAREFULLY — these are the most common bugs):
- Pass real JSON objects/arrays in 'data', NEVER a JSON-encoded string. data: { eyebrow: "X" }, NOT data: "{\\"eyebrow\\":\\"X\\"}".
- A list of STRINGS is a flat array of strings. The inner schema's 'name' is a label, NOT a wrapper key.
    Example field: { name: "items", type: "list", items: { name: "item", type: "richtext" } }
    WRONG:  items: [{ "item": "First bullet" }, { "item": "Second" }]
    RIGHT:  items: ["First bullet", "Second"]
- A list of OBJECTS uses each sub-field by name, no wrapper key.
    Example field: { name: "cards", type: "list", items: { type: "group", fields: [{name:"title"},{name:"body"}] } }
    WRONG:  cards: [{ "card": { "title": "X", "body": "Y" } }]
    RIGHT:  cards: [{ "title": "X", "body": "Y" }]
- A 'group' field is an object with the sub-field names as keys, no wrapper.
- Lists of strings inside groups follow the same flat-array rule.

Visual verification (USE THE INSPECT TOOL):
- Immediately after create_slide_type or patch_slide_type, call inspect_slide_type with the new id (no slideId) to see the dummy-data render. Iterate until it looks right.
- After the FIRST add_slide for any slide type you haven't already verified in this session, call inspect_slide_type with the slide's id (passed as slideId) to see the real content fit. Catches overflow, line-wrapping, "[object Object]", colour clashes.
- If the screenshot reveals a template bug, use patch_slide_type to fix it and inspect again. delete_slide_type is available for deck-scoped types you decide not to keep.
- Look at the PNG. Check: text inside the 1920x1080 frame, no overflow, content where you expect it, no literal {{handlebars}} or [object Object] showing.`;
/** Strip base64 image data from content blocks to keep DB storage lean. */
function stripImages(content) {
	if (!Array.isArray(content)) return content;
	return content.map((block) => {
		if (!block || typeof block !== "object") return block;
		const b = block;
		if (b.type === "tool_result" && Array.isArray(b.content)) return {
			...b,
			content: b.content.filter((c) => !(c && typeof c === "object" && c.type === "image"))
		};
		if (b.type === "image") return {
			type: "text",
			text: "[image omitted]"
		};
		return block;
	});
}
function runAgentStream(deckId, userId, userMessage) {
	const encoder = new TextEncoder();
	return new ReadableStream({ async start(controller) {
		function emit(event) {
			controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
		}
		try {
			await db.insert(agentMessages).values({
				deckId,
				role: "user",
				content: userMessage
			});
			const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
			let themeInfo = "";
			let themeSystemPrompt = "";
			if (deck?.themeId) {
				const [theme] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
				if (theme) {
					themeInfo = `\nCurrent theme: ${theme.name}\nTheme tokens: ${JSON.stringify(theme.tokens)}`;
					if (theme.systemPrompt) themeSystemPrompt = `\n\nTheme guidelines (${theme.name}):\n${theme.systemPrompt}`;
				}
			}
			const typeList = (await db.select({
				name: slideTypes.name,
				label: slideTypes.label
			}).from(slideTypes).where(or(eq(slideTypes.scope, "global"), and(eq(slideTypes.scope, "deck"), eq(slideTypes.deckId, deckId))))).map((t) => `${t.name}: ${t.label}`).join("\n");
			const systemPrompt = `${BASE_SYSTEM_PROMPT}${themeSystemPrompt}\n\nDeck: "${deck?.title ?? deckId}"${themeInfo}\n\nAvailable slide types:\n${typeList}`;
			const history = await db.select().from(agentMessages).where(eq(agentMessages.deckId, deckId)).orderBy(asc(agentMessages.createdAt)).limit(40);
			const sessionMessages = [];
			for (const msg of history) if (msg.rawContent && Array.isArray(msg.rawContent) && msg.rawContent.length > 0) for (const raw of msg.rawContent) sessionMessages.push({
				role: raw.role,
				content: raw.content
			});
			else sessionMessages.push({
				role: msg.role,
				content: msg.content
			});
			let iterCount = 0;
			const MAX_ITERATIONS = 25;
			let finalText = "";
			const allToolCallsThisSession = [];
			const historyLength = sessionMessages.length;
			while (iterCount < MAX_ITERATIONS) {
				iterCount++;
				const stream = client.messages.stream({
					model: "claude-sonnet-4-6",
					max_tokens: 4096,
					system: systemPrompt,
					tools: AGENT_TOOLS,
					messages: sessionMessages
				});
				stream.on("text", (delta) => {
					if (delta) {
						finalText += delta;
						emit({
							type: "text",
							delta
						});
					}
				});
				const finalMessage = await stream.finalMessage();
				const toolUseBlocks = finalMessage.content.filter((b) => b.type === "tool_use");
				if (finalMessage.stop_reason !== "tool_use" || toolUseBlocks.length === 0) {
					sessionMessages.push({
						role: "assistant",
						content: finalMessage.content
					});
					break;
				}
				const toolResults = [];
				for (const toolUse of toolUseBlocks) {
					emit({
						type: "tool_start",
						tool: toolUse.name,
						toolUseId: toolUse.id,
						input: toolUse.input
					});
					try {
						const { result, undoPatch, image } = await executeTool(deckId, toolUse.name, toolUse.input, userId);
						emit({
							type: "tool_done",
							tool: toolUse.name,
							toolUseId: toolUse.id,
							result,
							undoPatch,
							...image ? { image: {
								base64: image.base64,
								mediaType: image.mediaType
							} } : {}
						});
						allToolCallsThisSession.push({
							name: toolUse.name,
							input: toolUse.input,
							result,
							undoPatch
						});
						const content = image ? [{
							type: "image",
							source: {
								type: "base64",
								media_type: image.mediaType,
								data: image.base64
							}
						}, {
							type: "text",
							text: result
						}] : result;
						toolResults.push({
							type: "tool_result",
							tool_use_id: toolUse.id,
							content
						});
					} catch (err) {
						const errMsg = err instanceof Error ? err.message : String(err);
						emit({
							type: "tool_done",
							tool: toolUse.name,
							toolUseId: toolUse.id,
							result: `error: ${errMsg}`
						});
						toolResults.push({
							type: "tool_result",
							tool_use_id: toolUse.id,
							content: `error: ${errMsg}`,
							is_error: true
						});
					}
				}
				sessionMessages.push({
					role: "assistant",
					content: finalMessage.content
				});
				sessionMessages.push({
					role: "user",
					content: toolResults
				});
			}
			const rawContent = sessionMessages.slice(historyLength).map((msg) => ({
				role: msg.role,
				content: stripImages(msg.content)
			}));
			await db.insert(agentMessages).values({
				deckId,
				role: "assistant",
				content: finalText || "(tool calls only)",
				toolCalls: allToolCallsThisSession.length > 0 ? allToolCallsThisSession : null,
				rawContent: rawContent.length > 0 ? rawContent : null
			});
			emit({ type: "done" });
		} catch (err) {
			emit({
				type: "error",
				message: err instanceof Error ? err.message : "Unknown error"
			});
		} finally {
			controller.close();
		}
	} });
}
//#endregion
//#region src/lib/server/agent/ollama-runner.ts
/** Convert AGENT_TOOLS (Anthropic format) → OpenAI function tool array */
function toOpenAITools() {
	return AGENT_TOOLS.map((tool) => ({
		type: "function",
		function: {
			name: tool.name,
			description: tool.description,
			parameters: tool.input_schema
		}
	}));
}
function runOllamaStream(deckId, userId, userMessage, modelTag) {
	const encoder = new TextEncoder();
	const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "";
	const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY ?? "";
	return new ReadableStream({ async start(controller) {
		function emit(event) {
			controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
		}
		try {
			await db.insert(agentMessages).values({
				deckId,
				role: "user",
				content: userMessage
			});
			const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
			let themeInfo = "";
			let themeSystemPrompt = "";
			if (deck?.themeId) {
				const [theme] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
				if (theme) {
					themeInfo = `\nCurrent theme: ${theme.name}\nTheme tokens: ${JSON.stringify(theme.tokens)}`;
					if (theme.systemPrompt) themeSystemPrompt = `\n\nTheme guidelines (${theme.name}):\n${theme.systemPrompt}`;
				}
			}
			const typeList = (await db.select({
				name: slideTypes.name,
				label: slideTypes.label
			}).from(slideTypes).where(or(eq(slideTypes.scope, "global"), and(eq(slideTypes.scope, "deck"), eq(slideTypes.deckId, deckId))))).map((t) => `${t.name}: ${t.label}`).join("\n");
			const systemPrompt = `${BASE_SYSTEM_PROMPT}${themeSystemPrompt}\n\nDeck: "${deck?.title ?? deckId}"${themeInfo}\n\nAvailable slide types:\n${typeList}`;
			const sessionMessages = (await db.select().from(agentMessages).where(eq(agentMessages.deckId, deckId)).orderBy(asc(agentMessages.createdAt)).limit(40)).map((msg) => ({
				role: msg.role,
				content: msg.content
			}));
			const historyLength = sessionMessages.length;
			let iterCount = 0;
			const MAX_ITERATIONS = 25;
			let finalText = "";
			const allToolCallsThisSession = [];
			while (iterCount < MAX_ITERATIONS) {
				iterCount++;
				const response = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {}
					},
					body: JSON.stringify({
						model: modelTag,
						messages: [{
							role: "system",
							content: systemPrompt
						}, ...sessionMessages],
						tools: toOpenAITools(),
						stream: true
					})
				});
				if (!response.ok || !response.body) {
					const errText = await response.text().catch(() => `HTTP ${response.status}`);
					throw new Error(`Ollama error: ${errText}`);
				}
				const reader = response.body.getReader();
				const dec = new TextDecoder();
				let buf = "";
				let assistantContent = "";
				const pendingToolCalls = [];
				let finishReason = null;
				outer: while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buf += dec.decode(value, { stream: true });
					const lines = buf.split("\n");
					buf = lines.pop() ?? "";
					for (const line of lines) {
						if (!line.startsWith("data: ")) continue;
						const payload = line.slice(6).trim();
						if (payload === "[DONE]") break outer;
						let chunk;
						try {
							chunk = JSON.parse(payload);
						} catch {
							continue;
						}
						const choice = chunk.choices?.[0];
						if (!choice) continue;
						if (choice.finish_reason) finishReason = choice.finish_reason;
						const delta = choice.delta;
						if (delta.content) {
							assistantContent += delta.content;
							emit({
								type: "text",
								delta: delta.content
							});
						}
						if (delta.tool_calls) for (const tc of delta.tool_calls) {
							if (!pendingToolCalls[tc.index]) pendingToolCalls[tc.index] = {
								id: tc.id ?? "",
								type: "function",
								function: {
									name: tc.function?.name ?? "",
									arguments: ""
								}
							};
							const pending = pendingToolCalls[tc.index];
							if (tc.id) pending.id = tc.id;
							if (tc.function?.name) pending.function.name = tc.function.name;
							if (tc.function?.arguments) pending.function.arguments += tc.function.arguments;
						}
					}
				}
				finalText = assistantContent;
				if (finishReason !== "tool_calls" || pendingToolCalls.length === 0) {
					sessionMessages.push({
						role: "assistant",
						content: assistantContent
					});
					break;
				}
				sessionMessages.push({
					role: "assistant",
					content: assistantContent || null,
					tool_calls: pendingToolCalls
				});
				for (const tc of pendingToolCalls) {
					let toolInput;
					try {
						toolInput = JSON.parse(tc.function.arguments);
					} catch {
						toolInput = {};
					}
					emit({
						type: "tool_start",
						tool: tc.function.name,
						toolUseId: tc.id,
						input: toolInput
					});
					try {
						const { result, undoPatch, image } = await executeTool(deckId, tc.function.name, toolInput, userId);
						emit({
							type: "tool_done",
							tool: tc.function.name,
							toolUseId: tc.id,
							result,
							undoPatch,
							...image ? { image: {
								base64: image.base64,
								mediaType: image.mediaType
							} } : {}
						});
						allToolCallsThisSession.push({
							name: tc.function.name,
							input: toolInput,
							result,
							undoPatch
						});
						sessionMessages.push({
							role: "tool",
							tool_call_id: tc.id,
							content: result
						});
					} catch (err) {
						const errMsg = err instanceof Error ? err.message : String(err);
						emit({
							type: "tool_done",
							tool: tc.function.name,
							toolUseId: tc.id,
							result: `error: ${errMsg}`
						});
						sessionMessages.push({
							role: "tool",
							tool_call_id: tc.id,
							content: `error: ${errMsg}`
						});
					}
				}
			}
			const rawContent = sessionMessages.slice(historyLength).map((msg) => ({
				role: msg.role,
				content: "content" in msg ? msg.content : null
			}));
			await db.insert(agentMessages).values({
				deckId,
				role: "assistant",
				content: finalText || "(tool calls only)",
				toolCalls: allToolCallsThisSession.length > 0 ? allToolCallsThisSession : null,
				rawContent: rawContent.length > 0 ? rawContent : null
			});
			emit({ type: "done" });
		} catch (err) {
			emit({
				type: "error",
				message: err instanceof Error ? err.message : "Unknown error"
			});
		} finally {
			controller.close();
		}
	} });
}
//#endregion
//#region src/routes/api/decks/[id]/agent/+server.ts
async function POST(event) {
	await requireDeckRole(event.params.id, event.locals.user?.id, "editor");
	const deckId = event.params.id;
	const body = await event.request.json().catch(() => null);
	if (!body || typeof body.message !== "string" || !body.message.trim()) throw error(400, "message required");
	const aiModel = event.locals.user?.preferences?.aiModel;
	let stream;
	if (aiModel?.startsWith("ollama:")) {
		const modelTag = aiModel.slice(7);
		stream = runOllamaStream(deckId, event.locals.user.id, body.message.trim(), modelTag);
	} else stream = runAgentStream(deckId, event.locals.user.id, body.message.trim());
	return new Response(stream, { headers: {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive"
	} });
}

export { POST };
//# sourceMappingURL=_server.ts-DMjIOXoh.js.map
