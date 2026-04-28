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
  'nav.docs': { da: 'DOCS', en: 'DOCS' },
  'nav.admin': { da: 'ADMIN', en: 'ADMIN' },
  'nav.settings': { da: 'INDSTILLINGER', en: 'SETTINGS' },
  'nav.more': { da: 'MERE', en: 'MORE' },
  'nav.menu_label': { da: 'Menu', en: 'Menu' },

  // ── Unsaved-changes guard ────────────────────────────────────────────
  'unsaved.title': { da: 'IKKE GEMT', en: 'UNSAVED' },
  'unsaved.body': {
    da: 'Du har ændringer som ikke er gemt. Forlader du siden nu går de tabt.',
    en: 'You have unsaved changes. Leaving now will discard them.',
  },
  'unsaved.stay': { da: 'BLIV HER', en: 'STAY' },
  'unsaved.leave': { da: 'FORLAD ALLIGEVEL', en: 'LEAVE ANYWAY' },

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
  'decks.action_dup': { da: 'KOP', en: 'DUP' },
  'decks.shared_with_me': { da: 'DELT MED MIG', en: 'SHARED WITH ME' },

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

  // Undo
  'editor.undo_label': { da: 'FORTRYDT', en: 'UNDONE' },
  'editor.redo_label': { da: 'GENTAGET', en: 'REDONE' },
  'editor.undo_failed': { da: 'Kunne ikke fortryde', en: 'Undo failed' },
  'editor.action_delete_slide': { da: 'Slet slide', en: 'Delete slide' },
  'editor.action_more': { da: 'MERE', en: 'MORE' },
  'editor.action_slide_list_mode': { da: 'SLIDE-LISTE', en: 'SLIDE LIST' },
  'editor.slide_list_compact': { da: 'Tekst', en: 'Text' },
  'editor.slide_list_thumbnails': { da: 'Miniaturer', en: 'Thumbnails' },
  'editor.action_history': { da: 'HISTORIK', en: 'HISTORY' },

  'history.title': { da: 'HISTORIK', en: 'HISTORY' },
  'history.close': { da: 'Luk historik', en: 'Close history' },
  'history.empty': { da: 'Ingen ændringer registreret endnu.', en: 'No edits recorded yet.' },
  'history.loading': { da: 'Indlæser…', en: 'Loading…' },
  'history.load_more': { da: 'INDLÆS FLERE', en: 'LOAD MORE' },
  'history.revert': { da: 'FORTRYD', en: 'REVERT' },
  'history.reverting': { da: 'FORTRYDER…', en: 'REVERTING…' },
  'history.revert_confirm': {
    da: 'Fortryd denne ændring? "{summary}"',
    en: 'Revert this change? "{summary}"',
  },
  'history.revert_failed': { da: 'Kunne ikke fortryde', en: 'Revert failed' },
  'editor.action_add_slide': { da: 'Tilføj slide', en: 'Add slide' },
  'editor.action_reorder': { da: 'Omarranger slides', en: 'Reorder slides' },
  'editor.action_apply_theme': { da: 'Skift tema', en: 'Apply theme' },

  // Preview
  'editor.preview_meta': { da: 'FORHÅNDSVISNING · 1920×1080', en: 'PREVIEW · 1920×1080' },
  'editor.preview_slide_of': { da: 'SLIDE {n} / {total}', en: 'SLIDE {n} / {total}' },

  // Mobile tabs
  'editor.mob_edit': { da: 'REDIGER', en: 'EDIT' },
  'editor.mob_preview': { da: 'FORHÅNDSVIS', en: 'PREVIEW' },
  'editor.mob_agent': { da: 'AGENT', en: 'AGENT' },

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
  'agent.thinking_summary': { da: 'TÆNKER', en: 'THINKING' },
  'agent.undoable_header': { da: '↩ {n} FORTRYDELIGE', en: '↩ {n} UNDOABLE' },
  'agent.close': { da: 'Luk agent', en: 'Close agent' },
  'agent.model_change': { da: 'Skift model i indstillinger', en: 'Change model in settings' },

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
  'templates.search_placeholder': { da: 'Søg skabeloner…', en: 'Search templates…' },
  'templates.empty_search': { da: 'Ingen skabeloner matcher søgningen.', en: 'No templates match your search.' },
  'templates.scope_all': { da: 'Alle', en: 'All' },
  'templates.scope_global': { da: 'Globale', en: 'Global' },
  'templates.scope_deck': { da: 'Dæk-skabeloner', en: 'Deck-scoped' },
  'templates.from_deck': { da: 'FRA', en: 'FROM' },
  'template_edit.scope_label': { da: 'OMFANG', en: 'SCOPE' },
  'template_edit.from_deck': { da: 'Tilhører dæk', en: 'Belongs to deck' },
  'template_edit.promote': { da: 'Promover til global', en: 'Promote to global' },
  'template_edit.promote_confirm': {
    da: 'Promover denne skabelon til global? Den vil være tilgængelig for alle brugere og knytningen til dækket fjernes.',
    en: 'Promote this template to global? It will be available to all users and detached from the deck.',
  },
  'template_edit.promoted': { da: '✓ PROMOVERET', en: '✓ PROMOTED' },
  'template_edit.promote_admin_only': { da: 'Kræver admin-rettigheder', en: 'Admins only' },
  'template_edit.agent_open': { da: 'Tilkald agent til at hjælpe med skabelonen', en: 'Open the agent to help tweak this template' },
  'template_edit.promote_admin_only_intro': {
    da: 'Denne skabelon er kun bundet til ét dæk. Promover for at gøre den global.',
    en: 'This template is bound to a single deck. Promote to make it global.',
  },

  'theme_edit.crumb': { da: 'Temaer', en: 'Themes' },
  'theme_edit.save': { da: 'GEM', en: 'SAVE' },
  'theme_edit.saved': { da: '✓ GEMT', en: '✓ SAVED' },
  'theme_edit.preview_label': { da: 'LIVE FORHÅNDSVISNING', en: 'LIVE PREVIEW' },
  'theme_edit.system_prompt_label': { da: 'AGENT SYSTEMPROMPT', en: 'AGENT SYSTEM PROMPT' },
  'theme_edit.system_prompt_help': {
    da: 'Sætter tonen, stilretningen og indholdsreglerne agenten følger, når dette tema er aktivt. Kun ren tekst — ingen markup.',
    en: 'Sets the tone, style direction, and content rules the agent follows when this theme is active. Plain text only — no markup.',
  },
  'theme_edit.system_prompt_placeholder': {
    da: 'Beskriv tonen, stemmen og indholdskriterierne for dette tema…',
    en: 'Describe the tone, voice, and content conventions for this theme…',
  },

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

  // ── Editor: theme picker & collaborators (new) ───────────────────────
  'editor.theme_button': { da: 'TEMA', en: 'THEME' },
  'editor.theme_picker_head': { da: 'SKIFT TEMA', en: 'CHANGE THEME' },
  'editor.theme_active': { da: 'AKTIV', en: 'ACTIVE' },
  'editor.collab_label': { da: 'SAMARBEJDSPARTNERE', en: 'COLLABORATORS' },
  'editor.collab_role_editor': { da: 'Redigerer', en: 'Editor' },
  'editor.collab_role_viewer': { da: 'Læser', en: 'Viewer' },
  'editor.collab_add': { da: 'Tilføj', en: 'Add' },

  // ── Settings ─────────────────────────────────────────────────────────
  'settings.title': { da: 'Indstillinger — slidt', en: 'Settings — slidt' },
  'settings.meta': { da: 'INDSTILLINGER', en: 'SETTINGS' },
  'settings.headline': { da: 'Indstillinger', en: 'Settings' },

  'settings.profile': { da: 'PROFIL', en: 'PROFILE' },
  'settings.display_name': { da: 'VISNINGSNAVN', en: 'DISPLAY NAME' },
  'settings.save': { da: 'Gem', en: 'Save' },
  'settings.saved': { da: 'Gemt.', en: 'Saved.' },
  'settings.current_password': { da: 'NUVÆRENDE ADGANGSKODE', en: 'CURRENT PASSWORD' },
  'settings.new_password': { da: 'NY ADGANGSKODE', en: 'NEW PASSWORD' },
  'settings.confirm_password': { da: 'BEKRÆFT NY', en: 'CONFIRM NEW' },
  'settings.change_password': { da: 'Skift adgangskode', en: 'Change password' },
  'settings.password_changed': { da: 'Adgangskode ændret.', en: 'Password changed.' },

  'settings.preferences': { da: 'PRÆFERENCER', en: 'PREFERENCES' },
  'settings.vim_name': { da: 'VIM-TILSTAND', en: 'VIM MODE' },
  'settings.vim_desc': { da: 'j/k/d/gg/G navigation i dæk-editoren', en: 'j/k/d/gg/G navigation in the deck editor' },
  'settings.language_name': { da: 'SPROG', en: 'LANGUAGE' },
  'settings.language_desc': { da: 'Brugergrænsefladesprog på tværs af platformen', en: 'UI language across the platform' },
  'settings.save_prefs': { da: 'Gem præferencer', en: 'Save preferences' },
  'settings.agent_model_name': { da: 'AGENT-MODEL', en: 'AGENT MODEL' },
  'settings.agent_model_desc': { da: 'LLM til agent-sessioner', en: 'LLM for agent sessions' },
  'settings.agent_model_unavailable': { da: 'Ollama utilgængeligt', en: 'Ollama unavailable' },
  'settings.agent_model_claude': { da: 'Claude (Sonnet 4.6)', en: 'Claude (Sonnet 4.6)' },
  'settings.agent_model_local': { da: 'Lokal (Ollama) — gratis', en: 'Local (Ollama) — free' },
  'settings.agent_model_api': { da: 'API — koster pr. prompt', en: 'API — metered' },
  'settings.agent_model_meter': {
    da: 'API-modeller er hostet hos udbyderen og afregnes pr. forbrug.',
    en: 'API models are hosted by the provider and billed per use.',
  },
  'settings.key_set_as': { da: 'Sæt som:', en: 'Set as:' },

  'settings.api_keys': { da: 'API-NØGLER', en: 'API KEYS' },
  'settings.key_new_label': { da: 'NY NØGLE — KOPIÉR NU, DEN VISES IKKE IGEN', en: 'NEW KEY — COPY NOW, IT WILL NOT BE SHOWN AGAIN' },
  'settings.key_dismiss': { da: 'Afvis', en: 'Dismiss' },
  'settings.key_name_label': { da: 'NØGLENAVN', en: 'KEY NAME' },
  'settings.key_create': { da: '+ Ny nøgle', en: '+ New Key' },
  'settings.key_cancel': { da: 'Annullér', en: 'Cancel' },
  'settings.key_empty': {
    da: 'Ingen API-nøgler endnu. Opret en for at tillade CLI- eller agent-adgang.',
    en: 'No API keys yet. Create one to allow CLI or agent access.',
  },
  'settings.col_name': { da: 'Navn', en: 'Name' },
  'settings.col_last_used': { da: 'Sidst brugt', en: 'Last used' },
  'settings.key_revoke': { da: 'Tilbagekald', en: 'Revoke' },
  'settings.key_revoke_confirm': { da: 'Tilbagekald denne nøgle?', en: 'Revoke this key?' },

  // ── Admin ─────────────────────────────────────────────────────────────
  'admin.title': { da: 'Admin — slidt', en: 'Admin — slidt' },
  'admin.meta': { da: 'ADMINPANEL — {n} BRUGERE', en: 'ADMIN PANEL — {n} USERS' },
  'admin.headline': { da: 'Brugere', en: 'Users' },
  'admin.new_user': { da: '+ Ny bruger', en: '+ New User' },
  'admin.create_user': { da: 'OPRET BRUGER', en: 'CREATE USER' },
  'admin.col_name': { da: 'Navn', en: 'Name' },
  'admin.col_email': { da: 'Mail', en: 'Email' },
  'admin.col_role': { da: 'Rolle', en: 'Role' },
  'admin.col_last_seen': { da: 'Sidst set', en: 'Last seen' },
  'admin.col_actions': { da: 'Handlinger', en: 'Actions' },
  'admin.badge_admin': { da: 'ADMIN', en: 'ADMIN' },
  'admin.badge_user': { da: 'BRUGER', en: 'USER' },
  'admin.remove_admin': { da: 'Fjern admin', en: 'Remove admin' },
  'admin.make_admin': { da: 'Gør til admin', en: 'Make admin' },
  'admin.reset_pw': { da: 'Nulstil adg.', en: 'Reset pw' },
  'admin.pw_set': { da: 'Sæt', en: 'Set' },
  'admin.delete': { da: 'Slet', en: 'Delete' },
  'admin.delete_user_confirm': { da: 'Slet {name}?', en: 'Delete {name}?' },
  'admin.form_email': { da: 'Mail', en: 'Email' },
  'admin.form_name': { da: 'Navn', en: 'Name' },
  'admin.form_password': { da: 'Adgangskode', en: 'Password' },
  'admin.form_is_admin': { da: 'Admin', en: 'Admin' },
  'admin.form_create': { da: 'Opret', en: 'Create' },
  'admin.form_cancel': { da: 'Annullér', en: 'Cancel' },
  'admin.action_success': { da: 'Udført.', en: 'Done.' },
  'admin.pw_new_placeholder': { da: 'Ny adgangskode', en: 'New password' },
  'admin.issue_deck_link': { da: 'dæk ↗', en: 'deck ↗' },
  'admin.issue_status_open': { da: 'åben', en: 'open' },
  'admin.issue_status_resolved': { da: 'løst', en: 'resolved' },
  'admin.issues': { da: 'PROBLEMER', en: 'ISSUES' },
  'admin.issues_count': { da: '{total} total · {open} åbne', en: '{total} total · {open} open' },
  'admin.issues_empty': { da: 'Ingen problemer rapporteret endnu.', en: 'No issues reported yet.' },
  'admin.resolve': { da: 'Løs', en: 'Resolve' },
  'admin.delete_issue_confirm': { da: 'Slet dette problem?', en: 'Delete this issue?' },

  // ── Field editor ──────────────────────────────────────────────────────
  'field.select_default': { da: '— vælg —', en: '— select —' },
  'field.remove': { da: 'Fjern', en: 'Remove' },
  'field.add_item': { da: '+ Tilføj {label}', en: '+ Add {label}' },
} as const satisfies Record<string, { da: string; en: string }>;

export type MessageKey = keyof typeof messages;
