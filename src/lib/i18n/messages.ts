/**
 * UI copy registry. Add keys here, reference them via t() from src/lib/i18n.
 * Each entry holds at minimum the Danish string (default locale) and may
 * include other locales as we add them.
 *
 * Keys are dotted: <screen-or-area>.<thing>. Keep them short and self-evident.
 *
 * Brand-name strings ("SLIDT", "OS & DATA", the "slidt" wordmark, "-_-") are
 * NOT translated — they're identity. Form field placeholders that map to
 * domain words (e.g. JSON keys) are NOT translated either.
 */
export const messages = {
  // ── Meta bar / nav ──────────────────────────────────────────────────
  'meta.product': {
    da: 'SLIDT / ET SLIDE-VÆRKTØJ TIL OS & DATA',
    en: 'SLIDT / A SLIDE TOOL FOR OS & DATA',
  },
  'meta.internal': { da: 'INTERN', en: 'INTERNAL' },
  'meta.version': { da: 'V 0.4.1', en: 'V 0.4.1' },
  'meta.cph': { da: '2026 · KBH', en: '2026 · CPH' },

  'nav.user_prefix': { da: 'BRUGER/', en: 'USER/' },
  'nav.logout': { da: 'LOG UD →', en: 'LOG OUT →' },
  'nav.decks': { da: 'DÆK', en: 'DECKS' },
  'nav.themes': { da: 'TEMAER', en: 'THEMES' },
  'nav.templates': { da: 'SKABELONER', en: 'TEMPLATES' },

  // ── Login ────────────────────────────────────────────────────────────
  'login.tag': { da: '§ 01 — LOG IND', en: '§ 01 — SIGN IN' },
  'login.form_tag': { da: '§ GODKEND', en: '§ AUTHENTICATE' },
  'login.email_label': { da: '01 · MAIL', en: '01 · EMAIL' },
  'login.password_label': { da: '02 · ADGANGSKODE', en: '02 · PASSWORD' },
  'login.submit': { da: '→ FORTSÆT · 03', en: '→ ENTER · 03' },
  'login.agent_ready': { da: 'KLAR.', en: 'READY.' },
  'login.help': { da: '— FØRSTE GANG? SPØRG NIELS.', en: '— FIRST TIME? ASK NIELS.' },
  'login.title': { da: 'Log ind — slidt', en: 'Sign in — slidt' },

  // ── Decks list ───────────────────────────────────────────────────────
  'decks.title': { da: 'Dæk — slidt', en: 'Decks — slidt' },
  'decks.workspace': { da: 'DÆK — ARBEJDSRUM /', en: 'DECKS — WORKSPACE /' },
  'decks.last_week': { da: 'SIDSTE UGE', en: 'LAST WEEK' },
  'decks.agent_edits': { da: 'AGENT-ÆNDRINGER', en: 'AGENT EDITS' },
  'decks.new': { da: '+ NYT DÆK', en: '+ NEW DECK' },
  'decks.new_label': { da: 'NYT · TITEL', en: 'NEW · TITLE' },
  'decks.new_placeholder': { da: 'Nyt dæk', en: 'Untitled deck' },
  'decks.create': { da: 'OPRET', en: 'CREATE' },
  'decks.cancel': { da: 'ANNULLÉR', en: 'CANCEL' },
  'decks.col_n': { da: '№', en: '№' },
  'decks.col_title': { da: 'TITEL', en: 'TITLE' },
  'decks.col_slides': { da: 'SLIDES', en: 'SLIDES' },
  'decks.col_updated': { da: 'OPDATERET', en: 'UPDATED' },
  'decks.col_actions': { da: 'HANDLINGER', en: 'ACTIONS' },
  'decks.action_open': { da: 'ÅBN', en: 'OPEN' },
  'decks.action_pdf': { da: 'PDF', en: 'PDF' },

  // Decks list headlines (numeric variants → see headlineForCount in i18n/index.ts)
  'decks.headline.zero': { da: 'Ingen dæk endnu.', en: 'No decks yet.' },
  'decks.headline.one': { da: 'Ét dæk i gang.', en: 'One deck in motion.' },
  'decks.headline.many': { da: '{word} dæk i gang.', en: '{word} decks in motion.' },

  // ── Empty state ─────────────────────────────────────────────────────
  'empty.tag': { da: 'TOM · 00 DÆK', en: 'EMPTY · 00 DECKS' },
  'empty.headline': { da: 'Intet at\nsidde med\nendnu.', en: 'Nothing\nto slide\nyet.' },
  'empty.copy': {
    da: 'Start blankt, løft fra en skabelon, eller giv -_- en brief og lad den lave et førsteudkast du kan rette i.',
    en: 'Start blank, lift from a template, or hand -_- a brief and let it compose a first draft you can edit from.',
  },
  'empty.from_template': { da: 'FRA SKABELON', en: 'FROM TEMPLATE' },
  'empty.draft_with_agent': { da: 'UDKAST MED -_-', en: 'DRAFT WITH -_-' },
  'empty.off_duty': { da: 'HAR FRI', en: 'OFF-DUTY' },

  // ── Editor breadcrumb / actions ─────────────────────────────────────
  'editor.crumb_decks': { da: 'DÆK', en: 'DECKS' },
  'editor.action_present': { da: 'PRÆSENTÉR', en: 'PRESENT' },
  'editor.action_export': { da: 'EKSPORT.PDF', en: 'EXPORT.PDF' },
  'editor.action_export_busy': { da: 'BYGGER…', en: 'BUILDING…' },
  'editor.action_share': { da: 'DEL', en: 'SHARE' },
  'editor.action_share_done': { da: 'KOPIERET ✓', en: 'COPIED ✓' },
  'editor.action_delete': { da: 'SLET DÆK', en: 'DELETE DECK' },
  'editor.confirm_delete': {
    da: 'Slet dette dæk? Kan ikke fortrydes.',
    en: 'Delete this deck? Cannot be undone.',
  },
  'editor.share_dialog_label': { da: 'DELINGSLINK', en: 'SHARE LINK' },
  'editor.share_dialog_close': { da: 'LUK', en: 'CLOSE' },
  'editor.share_dialog_copy': { da: 'KOPIÉR', en: 'COPY' },
  'editor.share_failed': { da: 'KUNNE IKKE OPRETTE LINK', en: 'COULD NOT CREATE LINK' },
  'editor.agent_on': { da: 'ON', en: 'ON' },
  'editor.agent_off': { da: 'OFF', en: 'OFF' },

  'editor.save_idle': { da: 'GEMT', en: 'SAVED' },
  'editor.save_busy': { da: 'GEMMER', en: 'SAVING' },
  'editor.save_error': { da: 'FEJL', en: 'ERROR' },

  // Slide list
  'editor.slides_label': { da: 'SLIDES', en: 'SLIDES' },
  'editor.slides_add': { da: '+ TILFØJ', en: '+ ADD' },
  'editor.slide_unknown': { da: 'Ukendt', en: 'Unknown' },
  'editor.delete_slide': { da: 'Slet slide', en: 'Delete slide' },

  // Form
  'editor.form_head': {
    da: 'REDIGERER · SLIDE {n} · TYPE={type}',
    en: 'EDITING · SLIDE {n} · TYPE={type}',
  },
  'editor.form_empty_no_slides': { da: 'TILFØJ EN SLIDE FOR AT STARTE.', en: 'ADD A SLIDE TO START.' },
  'editor.form_empty_select': { da: 'VÆLG EN SLIDE FOR AT REDIGERE.', en: 'SELECT A SLIDE TO EDIT.' },

  // Preview
  'editor.preview_meta': { da: 'FORHÅNDSVISNING · 1920×1080', en: 'PREVIEW · 1920×1080' },
  'editor.preview_slide_of': { da: 'SLIDE {n} / {total}', en: 'SLIDE {n} / {total}' },

  // Agent drawer
  'agent.tag': { da: '§4 · AGENT', en: '§4 · AGENT' },
  'agent.live': { da: 'LIVE', en: 'LIVE' },
  'agent.working': { da: 'I GANG', en: 'WORKING' },
  'agent.turn_singular': { da: 'TUR', en: 'TURN' },
  'agent.turn_plural': { da: 'TURE', en: 'TURNS' },
  'agent.hint': { da: 'SPØRG -_- OM ALT DÆK-AGTIGT…', en: 'ASK -_- ANYTHING DECK-SHAPED…' },
  'agent.expand': { da: '▲ FOLD UD  ⌘K', en: '▲ EXPAND  ⌘K' },
  'agent.collapse': { da: '▼ FOLD IND', en: '▼ COLLAPSE' },
  'agent.compose_placeholder': { da: 'Spørg -_- om alt dæk-agtigt…', en: 'Ask -_- for anything deck-shaped…' },
  'agent.hello': { da: 'KLAR. SPØRG OM ALT DÆK-AGTIGT.', en: 'READY. SAY ANYTHING DECK-SHAPED.' },
  'agent.tool_pending': { da: '…', en: '…' },
  'agent.tool_ok': { da: 'FÆRDIG', en: 'DONE' },
  'agent.tool_failed': { da: 'FEJL', en: 'FAILED' },
  'agent.undo': { da: '↶ FORTRYD', en: '↶ UNDO' },

  // Type picker
  'editor.picker_head': { da: 'NY SLIDE · VÆLG TYPE', en: 'NEW SLIDE · CHOOSE TYPE' },
  'editor.picker_close': { da: 'Luk', en: 'Close' },

  // ── Themes / templates / share — chrome only ────────────────────────
  'themes.title': { da: 'Temaer — slidt', en: 'Themes — slidt' },
  'themes.workspace': { da: 'TEMAER — ARBEJDSRUM /', en: 'THEMES — WORKSPACE /' },
  'themes.items_suffix': { da: 'STK.', en: 'ITEMS' },
  'themes.headline': { da: 'Temaer.', en: 'Themes.' },
  'themes.new': { da: '+ NYT TEMA', en: '+ NEW THEME' },
  'themes.new_label': { da: 'NYT · NAVN', en: 'NEW · NAME' },
  'themes.placeholder_name': { da: 'Tema-navn', en: 'Theme name' },
  'themes.preset': { da: 'FORUDDEFINERET · ', en: 'PRESET · ' },

  'templates.title': { da: 'Skabeloner — slidt', en: 'Templates — slidt' },
  'templates.headline': { da: 'Slide-typer.', en: 'Slide types.' },
  'templates.items_label': { da: 'SKABELONER —', en: 'TEMPLATES —' },

  'theme_edit.crumb': { da: 'Temaer', en: 'Themes' },
  'theme_edit.save': { da: 'GEM', en: 'SAVE' },
  'theme_edit.saved': { da: '✓ GEMT', en: '✓ SAVED' },
  'theme_edit.preview_label': { da: 'LIVE FORHÅNDSVISNING', en: 'LIVE PREVIEW' },

  'template_edit.crumb': { da: 'Skabeloner', en: 'Templates' },
  'template_edit.fields_label': { da: 'FELTER (JSON)', en: 'FIELDS (JSON)' },
  'template_edit.template_label': { da: 'HANDLEBARS-SKABELON', en: 'HANDLEBARS TEMPLATE' },
  'template_edit.css_label': {
    da: 'CSS (auto-scopes til .st-{name})',
    en: 'CSS (auto-scoped to .st-{name})',
  },
  'template_edit.preview_label': {
    da: 'LIVE FORHÅNDSVISNING (TESTDATA)',
    en: 'LIVE PREVIEW (DUMMY DATA)',
  },

  'share.view_only': { da: 'KUN VISNING', en: 'VIEW ONLY' },
} as const satisfies Record<string, { da: string; en: string }>;

export type MessageKey = keyof typeof messages;
