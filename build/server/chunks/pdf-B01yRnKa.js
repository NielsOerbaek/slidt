import { d as db, a as decks, c as slides, b as slideTypes, t as themes, h as assets } from './db-CWmjlPNh.js';
import { r as render } from './renderer-AiFTzwmy.js';
import { eq, inArray } from 'drizzle-orm';
import { readFile } from 'fs/promises';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

//#region src/lib/server/font-css.ts
var INTER_DIR = path.resolve(process.cwd(), "node_modules/@fontsource/inter/files");
var INTER_SPECS = [
	{
		weight: 300,
		file: "inter-latin-300-normal.woff2"
	},
	{
		weight: 400,
		file: "inter-latin-400-normal.woff2"
	},
	{
		weight: 500,
		file: "inter-latin-500-normal.woff2"
	},
	{
		weight: 600,
		file: "inter-latin-600-normal.woff2"
	}
];
var NEUREAL_DIR = path.resolve(process.cwd(), "static/fonts");
var NEUREAL_SPECS = [{
	family: "Neureal",
	weight: 400,
	file: "Neureal-Regular.woff2"
}, {
	family: "Neureal Mono",
	weight: 400,
	file: "NeurealMono-Regular.woff2"
}];
async function fontFaceRule(family, weight, filePath) {
	try {
		const b64 = (await readFile(filePath)).toString("base64");
		return [
			`@font-face {`,
			`  font-family: '${family}';`,
			`  font-weight: ${weight};`,
			`  font-style: normal;`,
			`  src: url('data:font/woff2;base64,${b64}') format('woff2');`,
			`}`
		].join("\n");
	} catch {
		return null;
	}
}
/**
* Build @font-face CSS for Inter (always present via @fontsource/inter),
* Neureal (display), and Neureal Mono (data). Neureal families come from
* static/fonts/ and are silently omitted if the files are absent.
*/
async function buildFontCss() {
	const rules = [];
	for (const { weight, file } of INTER_SPECS) {
		const rule = await fontFaceRule("Inter", weight, path.join(INTER_DIR, file));
		if (rule) rules.push(rule);
	}
	for (const { family, weight, file } of NEUREAL_SPECS) {
		const rule = await fontFaceRule(family, weight, path.join(NEUREAL_DIR, file));
		if (rule) rules.push(rule);
	}
	return rules.join("\n");
}
//#endregion
//#region src/lib/server/pdf-utils.ts
/**
* Appends each buffer in `extras` onto the end of `main`.
* Returns `main` unchanged when `extras` is empty.
*/
async function stitchPdfs(main, extras) {
	if (extras.length === 0) return main;
	const merged = await PDFDocument.load(main);
	for (const extra of extras) {
		const doc = await PDFDocument.load(extra);
		const copied = await merged.copyPages(doc, doc.getPageIndices());
		for (const page of copied) merged.addPage(page);
	}
	return Buffer.from(await merged.save());
}
//#endregion
//#region src/lib/server/pdf.ts
/**
* Insert @font-face CSS at the top of the HTML `<style>` block.
* Returns html unchanged when fontCss is empty or there is no <style> tag.
*/
function injectFontCss(html, fontCss) {
	if (!fontCss || !html.includes("<style>")) return html;
	return html.replace("<style>", `<style>\n${fontCss}\n`);
}
async function loadDeckHtml(deckId) {
	const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
	if (!deck) throw new Error(`Deck not found: ${deckId}`);
	const slideRows = await db.select().from(slides).where(eq(slides.deckId, deckId));
	const slideMap = new Map(slideRows.map((s) => [s.id, s]));
	const ordered = deck.slideOrder.map((id) => slideMap.get(id)).filter((s) => Boolean(s));
	for (const s of slideRows) if (!deck.slideOrder.includes(s.id)) ordered.push(s);
	const typeIds = [...new Set(ordered.map((s) => s.typeId))];
	const typeRows = typeIds.length ? await db.select().from(slideTypes).where(inArray(slideTypes.id, typeIds)) : [];
	const typeMap = new Map(typeRows.map((t) => [t.id, t]));
	let theme = null;
	if (deck.themeId) {
		const [t] = await db.select().from(themes).where(eq(themes.id, deck.themeId)).limit(1);
		theme = t ?? null;
	}
	if (!theme) {
		const [t] = await db.select().from(themes).where(eq(themes.isPreset, true)).limit(1);
		theme = t ?? null;
	}
	if (!theme) throw new Error("No theme configured for this deck");
	const appendixAssets = (await db.select().from(assets).where(eq(assets.deckId, deckId))).filter((a) => a.kind === "appendix-pdf");
	const deckSlides = ordered.map((s) => {
		const t = typeMap.get(s.typeId);
		if (!t) throw new Error(`Missing slide type ${s.typeId}`);
		return {
			typeName: t.name,
			data: s.data
		};
	});
	const renderTypes = typeRows.map((t) => ({
		name: t.name,
		label: t.label,
		fields: t.fields,
		htmlTemplate: t.htmlTemplate,
		css: t.css
	}));
	const renderTheme = {
		name: theme.name,
		tokens: theme.tokens
	};
	return {
		html: injectFontCss(await render({
			title: deck.title,
			lang: deck.lang,
			slides: deckSlides
		}, renderTheme, renderTypes), await buildFontCss()),
		appendixAssets
	};
}
var PRESENTATION_CSS = `
html, body { margin:0; padding:0; width:100vw; height:100vh; overflow:hidden; background:#000; }

/* ── slide base ──────────────────────────────────────── */
.slide {
  display: none !important;
  position: absolute; top:50%; left:50%;
  transform: translate(-50%,-50%) scale(var(--slide-scale,1));
  transform-origin: center center;
  z-index: 0;
}
.slide.active  { display:flex !important; z-index:1; }
.slide.prs-out { display:flex !important; z-index:0; }

/* ── FADE ────────────────────────────────────────────── */
[data-t="fade"] .slide.active  { animation: prs-fadein  .38s ease both; }
[data-t="fade"] .slide.prs-out { animation: prs-fadeout .38s ease both; }

/* ── SLIDE ───────────────────────────────────────────── */
[data-t="slide"] .slide.active          { animation: prs-from-r .42s cubic-bezier(.4,0,.2,1) both; }
[data-t="slide"] .slide.prs-back.active { animation: prs-from-l .42s cubic-bezier(.4,0,.2,1) both; }
[data-t="slide"] .slide.prs-out         { animation: prs-to-l   .42s cubic-bezier(.4,0,.2,1) both; }
[data-t="slide"] .slide.prs-back.prs-out{ animation: prs-to-r   .42s cubic-bezier(.4,0,.2,1) both; }

/* ── ZOOM ────────────────────────────────────────────── */
[data-t="zoom"] .slide.active  { animation: prs-zoomin  .3s ease both; }
[data-t="zoom"] .slide.prs-out { animation: prs-zoomout .22s ease both; }

/* ── keyframes ───────────────────────────────────────── */
@keyframes prs-fadein  { from{opacity:0} to{opacity:1} }
@keyframes prs-fadeout { from{opacity:1} to{opacity:0} }

@keyframes prs-from-r {
  from { transform:translate(50%,-50%) scale(var(--slide-scale,1)); }
  to   { transform:translate(-50%,-50%) scale(var(--slide-scale,1)); }
}
@keyframes prs-from-l {
  from { transform:translate(-150%,-50%) scale(var(--slide-scale,1)); }
  to   { transform:translate(-50%,-50%) scale(var(--slide-scale,1)); }
}
@keyframes prs-to-l {
  from { transform:translate(-50%,-50%) scale(var(--slide-scale,1)); }
  to   { transform:translate(-150%,-50%) scale(var(--slide-scale,1)); }
}
@keyframes prs-to-r {
  from { transform:translate(-50%,-50%) scale(var(--slide-scale,1)); }
  to   { transform:translate(50%,-50%) scale(var(--slide-scale,1)); }
}
@keyframes prs-zoomin {
  from { opacity:0; transform:translate(-50%,-50%) scale(calc(var(--slide-scale,1)*.95)); }
  to   { opacity:1; transform:translate(-50%,-50%) scale(var(--slide-scale,1)); }
}
@keyframes prs-zoomout {
  from { opacity:1; transform:translate(-50%,-50%) scale(var(--slide-scale,1)); }
  to   { opacity:0; transform:translate(-50%,-50%) scale(calc(var(--slide-scale,1)*1.04)); }
}

/* ── HUD ─────────────────────────────────────────────── */
#prs-hud {
  position:fixed; bottom:14px; right:18px; z-index:9999;
  display:flex; align-items:center; gap:8px;
  font-family:'Neureal Mono',monospace; font-size:12px;
  color:rgba(255,255,255,.28); pointer-events:none;
}
#prs-t-btn {
  pointer-events:auto; cursor:pointer; background:none;
  border:1px solid rgba(255,255,255,.18); border-radius:4px;
  padding:2px 7px; color:inherit; font:inherit;
  transition:color .15s, border-color .15s;
}
#prs-t-btn:hover { color:rgba(255,255,255,.7); border-color:rgba(255,255,255,.45); }
`;
var PRESENTATION_JS = `
(function() {
  var TRANS = ['none','fade','slide','zoom'];
  var DUR   = {none:0, fade:400, slide:460, zoom:320};
  var slides = Array.from(document.querySelectorAll('.slide'));
  var n = slides.length, cur = 0, busy = false;

  var params = new URLSearchParams(location.search);
  var ti = Math.max(0, TRANS.indexOf(params.get('t') || 'fade'));

  var counter = document.getElementById('prs-counter');
  var tBtn    = document.getElementById('prs-t-btn');

  function setT(i) {
    ti = ((i % TRANS.length) + TRANS.length) % TRANS.length;
    document.body.setAttribute('data-t', TRANS[ti]);
    if (tBtn) tBtn.textContent = TRANS[ti];
  }

  function updateCounter() {
    if (counter) counter.textContent = (cur+1) + ' / ' + n;
  }

  function show(i) {
    if (busy) return;
    var fwd = (i > cur) || (cur === n-1 && ((i%n+n)%n) === 0);
    var prev = slides[cur];
    cur = ((i%n)+n)%n;
    var next = slides[cur];
    if (prev === next) return;
    updateCounter();

    var t = TRANS[ti];
    if (t === 'none') {
      prev.classList.remove('active');
      next.classList.add('active');
      return;
    }

    if (!fwd) { prev.classList.add('prs-back'); next.classList.add('prs-back'); }
    prev.classList.add('prs-out');
    next.classList.add('active');
    busy = true;
    setTimeout(function() {
      prev.classList.remove('active','prs-out','prs-back');
      next.classList.remove('prs-back');
      busy = false;
    }, DUR[t] || 400);
  }

  function resize() {
    document.documentElement.style.setProperty(
      '--slide-scale',
      Math.min(window.innerWidth/1920, window.innerHeight/1080)
    );
  }
  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('keydown', function(e) {
    if (['ArrowRight','ArrowDown',' ','PageDown'].includes(e.key)) { e.preventDefault(); show(cur+1); }
    else if (['ArrowLeft','ArrowUp','PageUp'].includes(e.key))     { e.preventDefault(); show(cur-1); }
    else if (e.key==='t'||e.key==='T') setT(ti+1);
    else if (e.key==='f'||e.key==='F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  document.addEventListener('click', function(e) {
    if (e.target.closest && e.target.closest('#prs-hud')) return;
    if (e.clientX >= window.innerWidth/2) show(cur+1); else show(cur-1);
  });

  if (tBtn) tBtn.addEventListener('click', function() { setT(ti+1); });

  setT(ti);
  slides[0].classList.add('active');
  updateCounter();
})();
`;
async function renderDeckToPresentation(deckId) {
	const { html } = await loadDeckHtml(deckId);
	return html.replace("</style>", PRESENTATION_CSS + "</style>").replace("</body>", `<div id="prs-hud"><button id="prs-t-btn"></button><span id="prs-counter"></span></div><script>${PRESENTATION_JS}<\/script></body>`);
}
async function renderDeckToPdf(deckId) {
	const { html: htmlWithFonts, appendixAssets } = await loadDeckHtml(deckId);
	const { chromium } = await new Function("m", "return import(m)")("playwright");
	const browser = await chromium.launch();
	let pdfBuf;
	try {
		const page = await browser.newPage();
		await page.setContent(htmlWithFonts, { waitUntil: "networkidle" });
		await page.evaluate(async () => {
			await document.fonts.ready;
		});
		const bytes = await page.pdf({
			width: "1920px",
			height: "1080px",
			printBackground: true
		});
		pdfBuf = Buffer.from(bytes);
	} finally {
		await browser.close();
	}
	if (appendixAssets.length > 0) {
		const appendixBufs = await Promise.all(appendixAssets.map((a) => readFile(a.storagePath).then((b) => Buffer.from(b))));
		pdfBuf = await stitchPdfs(pdfBuf, appendixBufs);
	}
	return pdfBuf;
}

export { renderDeckToPresentation as a, buildFontCss as b, injectFontCss as i, renderDeckToPdf as r };
//# sourceMappingURL=pdf-B01yRnKa.js.map
