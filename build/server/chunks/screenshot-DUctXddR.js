import { d as db, b as slideTypes, a as decks, c as slides, t as themes } from './db-CWmjlPNh.js';
import { r as render } from './renderer-AiFTzwmy.js';
import { i as injectFontCss, b as buildFontCss } from './pdf-B01yRnKa.js';
import { b as buildDummyData } from './field-defaults-DwF33Zkm.js';
import { eq, and } from 'drizzle-orm';
import './chunk-Do6Vi0cX.js';
import 'drizzle-orm/postgres-js';
import 'postgres';
import 'drizzle-orm/pg-core';
import './validate-CiBKPHUw.js';
import 'handlebars';
import 'postcss';
import 'fs/promises';
import 'path';
import 'pdf-lib';

//#region src/lib/server/screenshot.ts
/**
* Render a single slide of the given slide type and return a PNG screenshot.
* Used by the agent's `inspect_slide_type` tool to visually verify a template
* after creation. When `slideId` is given, uses that slide's actual data
* instead of auto-generated dummies — useful right after `add_slide`.
*/
async function screenshotSlideType(slideTypeId, deckId, options = {}) {
	const [st] = await db.select().from(slideTypes).where(eq(slideTypes.id, slideTypeId)).limit(1);
	if (!st) throw new Error(`slide type ${slideTypeId} not found`);
	const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
	if (!deck) throw new Error(`deck ${deckId} not found`);
	let slideData = null;
	if (options.slideId) {
		const [slide] = await db.select().from(slides).where(and(eq(slides.id, options.slideId), eq(slides.deckId, deckId))).limit(1);
		if (!slide) throw new Error(`slide ${options.slideId} not found in this deck`);
		if (slide.typeId !== slideTypeId) throw new Error(`slide ${options.slideId} uses a different slide type than ${slideTypeId}`);
		slideData = slide.data;
	}
	let theme = null;
	if (deck.themeId) {
		const [t] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
		theme = t ?? null;
	}
	if (!theme) {
		const [t] = await db.select().from(themes).where(eq(themes.isPreset, true)).limit(1);
		theme = t ?? null;
	}
	if (!theme) throw new Error("no theme available");
	const renderType = {
		name: st.name,
		label: st.label,
		fields: st.fields,
		htmlTemplate: st.htmlTemplate,
		css: st.css
	};
	const data = slideData ?? buildDummyData(renderType.fields);
	const fullHtml = injectFontCss(await render({
		title: deck.title,
		lang: deck.lang ?? "da",
		slides: [{
			typeName: renderType.name,
			data
		}]
	}, {
		name: theme.name,
		tokens: theme.tokens
	}, [renderType], { skipValidation: true }), await buildFontCss());
	const { chromium } = await new Function("m", "return import(m)")("playwright");
	const browser = await chromium.launch();
	try {
		const page = await browser.newPage({ viewport: {
			width: 1920,
			height: 1080
		} });
		await page.setContent(fullHtml, { waitUntil: "networkidle" });
		await page.evaluate(async () => {
			await document.fonts.ready;
		});
		const slideEl = await page.$(".slide");
		if (!slideEl) throw new Error("no .slide rendered");
		const bytes = await slideEl.screenshot({ type: "png" });
		return Buffer.from(bytes);
	} finally {
		await browser.close();
	}
}

export { screenshotSlideType };
//# sourceMappingURL=screenshot-DUctXddR.js.map
