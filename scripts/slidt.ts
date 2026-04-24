#!/usr/bin/env tsx
/**
 * slidt CLI — Agent-facing command-line interface for the slidt presentation platform.
 *
 * Authentication:
 *   --api-key <key>   or   SLIDT_API_KEY env var
 *
 * Base URL:
 *   --url <url>       or   SLIDT_URL env var   (default: http://localhost:3000)
 *
 * Usage examples:
 *   slidt deck list
 *   slidt deck create --title "My Deck" --lang da
 *   slidt deck get <id>
 *   slidt deck duplicate <id>
 *   slidt deck delete <id>
 *   slidt deck collaborator list <deckId>
 *   slidt deck collaborator add <deckId> --email <email> [--role editor|viewer]
 *   slidt deck collaborator remove <deckId> --email <email>
 *
 *   slidt slide list <deckId>
 *   slidt slide add <deckId> --type <typeId> --data '{"title":"Hello"}'
 *   slidt slide patch <deckId> <slideId> --data '{"title":"Updated"}'
 *   slidt slide delete <deckId> <slideId>
 *   slidt slide reorder <deckId> --order <id1,id2,...>
 *
 *   slidt theme list
 *   slidt theme get <id>
 *   slidt theme create --name "My Theme" --tokens '{"--color":"#fff"}' [--prompt "..."]
 *   slidt theme patch <id> [--name "..."] [--tokens '...'] [--prompt "..."]
 *   slidt theme validate <file.json>
 *   slidt theme delete <id>
 *
 *   slidt template list [--deck <deckId>]
 *   slidt template get <id>
 *   slidt template create <deckId> --file <template.json>
 *   slidt template patch <id> --file <template.json>
 *   slidt template validate <file.json>
 *   slidt template delete <id>
 *
 *   slidt agent chat <deckId> --message "..." [--json] [--quiet] [--no-stream]
 *   slidt agent history <deckId>
 *
 *   slidt key list
 *   slidt key create --name "my-agent"
 *   slidt key revoke <id>
 *
 *   slidt export pdf <deckId> [--out deck.pdf]
 *
 *   slidt health
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// ── Config ────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getFlag(name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : undefined;
}

function hasFlag(name: string): boolean {
  return args.includes(`--${name}`);
}

const BASE_URL = (getFlag('url') ?? process.env.SLIDT_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const API_KEY = getFlag('api-key') ?? process.env.SLIDT_API_KEY;

if (!API_KEY) {
  console.error('Error: API key required. Set SLIDT_API_KEY env var or pass --api-key <key>');
  process.exit(1);
}

// ── HTTP helpers ──────────────────────────────────────────────────

const HEADERS = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

async function api(method: string, path: string, body?: unknown): Promise<unknown> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: HEADERS,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return res.json();
  if (ct.includes('application/pdf') || ct.includes('application/octet-stream')) return res.arrayBuffer();
  return res.text();
}

function out(data: unknown) {
  if (typeof data === 'string') {
    console.log(data);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

function readJsonArg(flag: string, required = false): unknown {
  const raw = getFlag(flag);
  if (!raw) {
    if (required) { console.error(`Error: --${flag} required`); process.exit(1); }
    return undefined;
  }
  try { return JSON.parse(raw); } catch {
    console.error(`Error: --${flag} must be valid JSON`);
    process.exit(1);
  }
}

function readJsonFile(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(resolve(filePath), 'utf-8'));
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, (e as Error).message);
    process.exit(1);
  }
}

// ── Template/Theme Validation ──────────────────────────────────────

const VALID_FIELD_TYPES = ['text', 'richtext', 'markdown', 'bool', 'select', 'image', 'list', 'group'];
const FORBIDDEN_CSS = ['@import', 'expression(', 'behavior:', 'javascript:'];
const ALLOWED_HELPERS = ['fmt', 'eq', 'default', 'each', 'if', 'unless', 'with'];

function validateTemplate(tpl: Record<string, unknown>): string[] {
  const errs: string[] = [];
  if (typeof tpl.name !== 'string' || !tpl.name) errs.push('name (string) required');
  if (typeof tpl.label !== 'string' || !tpl.label) errs.push('label (string) required');
  if (!Array.isArray(tpl.fields)) {
    errs.push('fields (array) required');
  } else {
    for (const f of tpl.fields as unknown[]) {
      const fld = f as Record<string, unknown>;
      if (!VALID_FIELD_TYPES.includes(fld.type as string)) {
        errs.push(`Unknown field type: ${fld.type} (${fld.name})`);
      }
    }
  }
  if (typeof tpl.htmlTemplate !== 'string' || !tpl.htmlTemplate) {
    errs.push('htmlTemplate (string) required');
  } else {
    // Check for disallowed Handlebars helpers
    const helperRegex = /\{\{#?(\w+)/g;
    let m;
    while ((m = helperRegex.exec(tpl.htmlTemplate as string)) !== null) {
      const helper = m[1];
      if (!ALLOWED_HELPERS.includes(helper) && helper !== 'fmt') {
        errs.push(`Disallowed Handlebars helper: {{${helper}}} — allowed: ${ALLOWED_HELPERS.join(', ')}`);
      }
    }
    // Check for raw HTML in template (it's a template, HTML is allowed here)
  }
  if (typeof tpl.css !== 'string') {
    errs.push('css (string) required');
  } else {
    for (const forbidden of FORBIDDEN_CSS) {
      if ((tpl.css as string).includes(forbidden)) {
        errs.push(`Forbidden CSS pattern: "${forbidden}"`);
      }
    }
  }
  return errs;
}

function validateTheme(theme: Record<string, unknown>): string[] {
  const errs: string[] = [];
  if (typeof theme.name !== 'string' || !theme.name) errs.push('name (string) required');
  if (!theme.tokens || typeof theme.tokens !== 'object' || Array.isArray(theme.tokens)) {
    errs.push('tokens (object) required');
  } else {
    const tokens = theme.tokens as Record<string, unknown>;
    for (const [k, v] of Object.entries(tokens)) {
      if (!k.startsWith('--')) errs.push(`Token key must start with "--": ${k}`);
      if (typeof v !== 'string') errs.push(`Token value must be string: ${k}`);
    }
  }
  if (theme.systemPrompt !== undefined && typeof theme.systemPrompt !== 'string') {
    errs.push('systemPrompt must be a string if provided');
  }
  return errs;
}

// ── Commands ──────────────────────────────────────────────────────

const [cmd, sub, ...rest] = args.filter(a => !a.startsWith('--') || a === '--').slice(0, 3);
// Re-parse positional args (skip flags)
const positionals = args.filter((a, i) => {
  if (a.startsWith('--')) return false;
  const prev = args[i - 1];
  if (prev?.startsWith('--')) return false; // this is a flag value
  return true;
});

const [command, subcommand, pos1, pos2] = positionals;

async function main() {
  switch (command) {

    // ── health ──────────────────────────────────────────────────
    case 'health': {
      const r = await api('GET', '/healthz');
      out(r);
      break;
    }

    // ── deck ────────────────────────────────────────────────────
    case 'deck': {
      switch (subcommand) {
        case 'list': {
          out(await api('GET', '/api/decks'));
          break;
        }
        case 'get': {
          if (!pos1) { console.error('Usage: deck get <id>'); process.exit(1); }
          out(await api('GET', `/api/decks/${pos1}`));
          break;
        }
        case 'create': {
          const title = getFlag('title');
          const lang = getFlag('lang') ?? 'da';
          if (!title) { console.error('--title required'); process.exit(1); }
          out(await api('POST', '/api/decks', { title, lang }));
          break;
        }
        case 'patch': {
          if (!pos1) { console.error('Usage: deck patch <id>'); process.exit(1); }
          const body: Record<string, unknown> = {};
          const title = getFlag('title'); if (title) body.title = title;
          const lang = getFlag('lang'); if (lang) body.lang = lang;
          const themeId = getFlag('theme-id'); if (themeId) body.themeId = themeId;
          const orderRaw = getFlag('slide-order');
          if (orderRaw) body.slideOrder = orderRaw.split(',').map(s => s.trim());
          out(await api('PATCH', `/api/decks/${pos1}`, body));
          break;
        }
        case 'duplicate': {
          if (!pos1) { console.error('Usage: deck duplicate <id>'); process.exit(1); }
          const result = await api('POST', `/api/decks/${pos1}/duplicate`) as { id: string; title: string };
          console.log(`Duplicated → ${result.id} "${result.title}"`);
          break;
        }
        case 'delete': {
          if (!pos1) { console.error('Usage: deck delete <id>'); process.exit(1); }
          out(await api('DELETE', `/api/decks/${pos1}`));
          break;
        }
        case 'collaborator': {
          // positionals[0]=deck, [1]=collaborator, [2]=subaction, [3]=deckId
          const collabAction = pos1;  // subaction (list/add/remove)
          const deckIdArg = pos2;     // deckId is the 4th positional
          switch (collabAction) {
            case 'list': {
              if (!deckIdArg) { console.error('Usage: deck collaborator list <deckId>'); process.exit(1); }
              out(await api('GET', `/api/decks/${deckIdArg}/collaborators`));
              break;
            }
            case 'add': {
              if (!deckIdArg) { console.error('Usage: deck collaborator add <deckId> --email <email> [--role viewer|editor]'); process.exit(1); }
              const email = getFlag('email');
              const role = getFlag('role') ?? 'editor';
              if (!email) { console.error('--email required'); process.exit(1); }
              out(await api('POST', `/api/decks/${deckIdArg}/collaborators`, { email, role }));
              break;
            }
            case 'remove': {
              if (!deckIdArg) { console.error('Usage: deck collaborator remove <deckId> --email <email>'); process.exit(1); }
              const email = getFlag('email');
              if (!email) { console.error('--email required'); process.exit(1); }
              // Look up userId from collaborator list
              const collabs = await api('GET', `/api/decks/${deckIdArg}/collaborators`) as Array<{ userId: string; email: string }>;
              const target = collabs.find(c => c.email === email);
              if (!target) { console.error(`Not a collaborator: ${email}`); process.exit(1); }
              out(await api('DELETE', `/api/decks/${deckIdArg}/collaborators?userId=${target.userId}`));
              break;
            }
            default:
              console.error('Unknown collaborator subcommand. Available: list, add, remove');
              process.exit(1);
          }
          break;
        }
        default:
          console.error('Unknown deck subcommand. Available: list, get, create, patch, duplicate, delete, collaborator');
          process.exit(1);
      }
      break;
    }

    // ── slide ───────────────────────────────────────────────────
    case 'slide': {
      switch (subcommand) {
        case 'list': {
          if (!pos1) { console.error('Usage: slide list <deckId>'); process.exit(1); }
          out(await api('GET', `/api/decks/${pos1}/slides`));
          break;
        }
        case 'get': {
          if (!pos1 || !pos2) { console.error('Usage: slide get <deckId> <slideId>'); process.exit(1); }
          out(await api('GET', `/api/decks/${pos1}/slides/${pos2}`));
          break;
        }
        case 'add': {
          if (!pos1) { console.error('Usage: slide add <deckId> --type <typeId> [--data {...}]'); process.exit(1); }
          const typeId = getFlag('type');
          if (!typeId) { console.error('--type required'); process.exit(1); }
          const data = readJsonArg('data') ?? {};
          out(await api('POST', `/api/decks/${pos1}/slides`, { typeId, data }));
          break;
        }
        case 'patch': {
          if (!pos1 || !pos2) { console.error('Usage: slide patch <deckId> <slideId> --data {...}'); process.exit(1); }
          const data = readJsonArg('data', true);
          out(await api('PATCH', `/api/decks/${pos1}/slides/${pos2}`, { data }));
          break;
        }
        case 'delete': {
          if (!pos1 || !pos2) { console.error('Usage: slide delete <deckId> <slideId>'); process.exit(1); }
          out(await api('DELETE', `/api/decks/${pos1}/slides/${pos2}`));
          break;
        }
        case 'reorder': {
          if (!pos1) { console.error('Usage: slide reorder <deckId> --order <id1,id2,...>'); process.exit(1); }
          const orderRaw = getFlag('order');
          if (!orderRaw) { console.error('--order required'); process.exit(1); }
          const order = orderRaw.split(',').map(s => s.trim());
          out(await api('PATCH', `/api/decks/${pos1}`, { slideOrder: order }));
          break;
        }
        default:
          console.error('Unknown slide subcommand. Available: list, get, add, patch, delete, reorder');
          process.exit(1);
      }
      break;
    }

    // ── theme ───────────────────────────────────────────────────
    case 'theme': {
      switch (subcommand) {
        case 'list': {
          out(await api('GET', '/api/themes'));
          break;
        }
        case 'get': {
          if (!pos1) { console.error('Usage: theme get <id>'); process.exit(1); }
          out(await api('GET', `/api/themes/${pos1}`));
          break;
        }
        case 'create': {
          const name = getFlag('name');
          if (!name) { console.error('--name required'); process.exit(1); }
          let tokens = readJsonArg('tokens');
          const file = getFlag('file');
          if (file) {
            const f = readJsonFile(file) as Record<string, unknown>;
            tokens = tokens ?? f.tokens;
            const body = { name, tokens, systemPrompt: getFlag('prompt') ?? f.systemPrompt, scope: getFlag('scope') ?? f.scope };
            const errs = validateTheme({ ...f, name, tokens });
            if (errs.length) { console.error('Validation errors:\n' + errs.join('\n')); process.exit(1); }
            out(await api('POST', '/api/themes', body));
            break;
          }
          if (!tokens) { console.error('--tokens or --file required'); process.exit(1); }
          const body: Record<string, unknown> = { name, tokens, scope: getFlag('scope') ?? 'global' };
          const prompt = getFlag('prompt'); if (prompt) body.systemPrompt = prompt;
          const errs = validateTheme(body);
          if (errs.length) { console.error('Validation errors:\n' + errs.join('\n')); process.exit(1); }
          out(await api('POST', '/api/themes', body));
          break;
        }
        case 'patch': {
          if (!pos1) { console.error('Usage: theme patch <id>'); process.exit(1); }
          const body: Record<string, unknown> = {};
          const name = getFlag('name'); if (name) body.name = name;
          const tokens = readJsonArg('tokens'); if (tokens) body.tokens = tokens;
          const prompt = getFlag('prompt'); if (prompt !== undefined) body.systemPrompt = prompt;
          const file = getFlag('file');
          if (file) {
            const f = readJsonFile(file) as Record<string, unknown>;
            if (f.name && !body.name) body.name = f.name;
            if (f.tokens && !body.tokens) body.tokens = f.tokens;
            if (f.systemPrompt && !body.systemPrompt) body.systemPrompt = f.systemPrompt;
          }
          out(await api('PATCH', `/api/themes/${pos1}`, body));
          break;
        }
        case 'delete': {
          if (!pos1) { console.error('Usage: theme delete <id>'); process.exit(1); }
          out(await api('DELETE', `/api/themes/${pos1}`));
          break;
        }
        case 'validate': {
          if (!pos1) { console.error('Usage: theme validate <file.json>'); process.exit(1); }
          const data = readJsonFile(pos1) as Record<string, unknown>;
          const errs = validateTheme(data);
          if (errs.length) {
            console.error('Theme validation FAILED:\n' + errs.map(e => `  - ${e}`).join('\n'));
            process.exit(1);
          }
          console.log('Theme valid ✓');
          break;
        }
        default:
          console.error('Unknown theme subcommand. Available: list, get, create, patch, delete, validate');
          process.exit(1);
      }
      break;
    }

    // ── template ─────────────────────────────────────────────────
    case 'template': {
      switch (subcommand) {
        case 'list': {
          const deckId = getFlag('deck');
          const url = deckId ? `/api/templates?deckId=${deckId}` : '/api/templates';
          out(await api('GET', url));
          break;
        }
        case 'get': {
          if (!pos1) { console.error('Usage: template get <id>'); process.exit(1); }
          out(await api('GET', `/api/templates/${pos1}`));
          break;
        }
        case 'create': {
          if (!pos1) { console.error('Usage: template create <deckId> --file <template.json>'); process.exit(1); }
          const file = getFlag('file');
          if (!file) { console.error('--file required'); process.exit(1); }
          const tpl = readJsonFile(file) as Record<string, unknown>;
          const errs = validateTemplate(tpl);
          if (errs.length) { console.error('Validation errors:\n' + errs.map(e => `  - ${e}`).join('\n')); process.exit(1); }
          out(await api('POST', '/api/templates', { ...tpl, scope: 'deck', deckId: pos1 }));
          break;
        }
        case 'patch': {
          if (!pos1) { console.error('Usage: template patch <id> --file <template.json>'); process.exit(1); }
          const file = getFlag('file');
          if (!file) { console.error('--file required'); process.exit(1); }
          const tpl = readJsonFile(file) as Record<string, unknown>;
          const errs = validateTemplate(tpl);
          if (errs.length) { console.error('Validation errors:\n' + errs.map(e => `  - ${e}`).join('\n')); process.exit(1); }
          out(await api('PATCH', `/api/templates/${pos1}`, tpl));
          break;
        }
        case 'delete': {
          if (!pos1) { console.error('Usage: template delete <id>'); process.exit(1); }
          out(await api('DELETE', `/api/templates/${pos1}`));
          break;
        }
        case 'validate': {
          if (!pos1) { console.error('Usage: template validate <file.json>'); process.exit(1); }
          const tpl = readJsonFile(pos1) as Record<string, unknown>;
          const errs = validateTemplate(tpl);
          if (errs.length) {
            console.error('Template validation FAILED:\n' + errs.map(e => `  - ${e}`).join('\n'));
            process.exit(1);
          }
          console.log('Template valid ✓');
          break;
        }
        default:
          console.error('Unknown template subcommand. Available: list, get, create, patch, delete, validate');
          process.exit(1);
      }
      break;
    }

    // ── agent ─────────────────────────────────────────────────────
    case 'agent': {
      switch (subcommand) {
        case 'chat': {
          if (!pos1) { console.error('Usage: agent chat <deckId> --message "..."'); process.exit(1); }
          const message = getFlag('message');
          if (!message) { console.error('--message required'); process.exit(1); }

          const jsonMode   = hasFlag('json');
          const quietMode  = hasFlag('quiet');
          const noStream   = hasFlag('no-stream');

          const res = await fetch(`${BASE_URL}/api/decks/${pos1}/agent`, {
            method: 'POST',
            headers: { ...HEADERS, 'Accept': 'text/event-stream' },
            body: JSON.stringify({ message }),
          });
          if (!res.ok) {
            const text = await res.text().catch(() => '');
            console.error(`HTTP ${res.status}: ${text}`);
            process.exit(1);
          }

          const reader = res.body!.getReader();
          const dec = new TextDecoder();
          let buf = '';
          let accumulated = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const evt = JSON.parse(line.slice(6));
                if (jsonMode) {
                  // NDJSON: emit every event as a JSON line on stdout
                  process.stdout.write(JSON.stringify(evt) + '\n');
                } else if (noStream) {
                  // Buffer mode: accumulate text, print once at end
                  if (evt.type === 'text') accumulated += evt.delta;
                  else if (evt.type === 'tool_start' && !quietMode)
                    process.stderr.write(`[tool: ${evt.tool}]\n`);
                  else if (evt.type === 'tool_done' && !quietMode)
                    process.stderr.write(`[done: ${evt.tool}: ${String(evt.result).slice(0, 80)}]\n`);
                  else if (evt.type === 'done') process.stdout.write(accumulated + '\n');
                  else if (evt.type === 'error') { console.error('\nAgent error:', evt.message); process.exit(1); }
                } else {
                  // Default streaming mode
                  if (evt.type === 'text') process.stdout.write(evt.delta);
                  else if (evt.type === 'tool_start' && !quietMode)
                    process.stderr.write(`\n[tool: ${evt.tool}]\n`);
                  else if (evt.type === 'tool_done' && !quietMode)
                    process.stderr.write(`[done: ${evt.tool}: ${String(evt.result).slice(0, 80)}]\n`);
                  else if (evt.type === 'done') process.stdout.write('\n');
                  else if (evt.type === 'error') { console.error('\nAgent error:', evt.message); process.exit(1); }
                }
              } catch { /* skip malformed */ }
            }
          }
          break;
        }
        case 'history': {
          if (!pos1) { console.error('Usage: agent history <deckId>'); process.exit(1); }
          // Fetch messages via the decks API (not a dedicated endpoint yet, use the agent endpoint with a meta flag)
          // For now, show slides as context proxy
          console.error('Note: agent history is stored in the database. Use the web UI to view the full conversation.');
          break;
        }
        default:
          console.error('Unknown agent subcommand. Available: chat, history');
          process.exit(1);
      }
      break;
    }

    // ── key ───────────────────────────────────────────────────────
    case 'key': {
      switch (subcommand) {
        case 'list': {
          out(await api('GET', '/api/keys'));
          break;
        }
        case 'create': {
          const name = getFlag('name');
          if (!name) { console.error('--name required'); process.exit(1); }
          const result = await api('POST', '/api/keys', { name }) as Record<string, unknown>;
          console.log('API Key created. Save this token — it will not be shown again:');
          console.log('');
          console.log(`  Token: ${result.token}`);
          console.log(`  ID:    ${result.id}`);
          console.log(`  Name:  ${result.name}`);
          console.log('');
          console.log('Set SLIDT_API_KEY=' + result.token);
          break;
        }
        case 'revoke': {
          if (!pos1) { console.error('Usage: key revoke <id>'); process.exit(1); }
          out(await api('DELETE', `/api/keys?id=${pos1}`));
          break;
        }
        default:
          console.error('Unknown key subcommand. Available: list, create, revoke');
          process.exit(1);
      }
      break;
    }

    // ── export ───────────────────────────────────────────────────
    case 'export': {
      if (subcommand !== 'pdf') { console.error('Usage: export pdf <deckId> [--out deck.pdf]'); process.exit(1); }
      if (!pos1) { console.error('Usage: export pdf <deckId>'); process.exit(1); }
      const buf = await api('GET', `/api/decks/${pos1}/export`) as ArrayBuffer;
      const outFile = getFlag('out') ?? `deck-${pos1}.pdf`;
      writeFileSync(outFile, Buffer.from(buf));
      console.log(`Saved to ${outFile}`);
      break;
    }

    default: {
      console.log(`slidt — presentation platform CLI

Usage: slidt <command> <subcommand> [options]

Commands:
  health                        Check server status

  deck list                     List all decks
  deck get <id>                 Get a deck
  deck create --title "..." [--lang da]
  deck patch <id> [--title "..."] [--lang ...] [--theme-id ...]
  deck duplicate <id>           Deep-copy deck (slides, theme, deck-scoped types)
  deck delete <id>
  deck collaborator list <deckId>
  deck collaborator add <deckId> --email <email> [--role editor|viewer]
  deck collaborator remove <deckId> --email <email>

  slide list <deckId>
  slide get <deckId> <slideId>
  slide add <deckId> --type <typeId> [--data '{}']
  slide patch <deckId> <slideId> --data '{}'
  slide delete <deckId> <slideId>
  slide reorder <deckId> --order <id1,id2,...>

  theme list
  theme get <id>
  theme create --name "..." --tokens '{"--var":"#fff"}' [--prompt "..."] [--scope global|deck]
  theme create --name "..." --file theme.json
  theme patch <id> [--name ...] [--tokens ...] [--prompt ...] [--file ...]
  theme delete <id>
  theme validate <file.json>

  template list [--deck <deckId>]
  template get <id>
  template create <deckId> --file template.json
  template patch <id> --file template.json
  template delete <id>
  template validate <file.json>

  agent chat <deckId> --message "..."    Stream response (--json NDJSON, --quiet no tools, --no-stream buffer)
  agent history <deckId>                 (see web UI for full history)

  key list                       List your API keys
  key create --name "agent-name" Create an API key (token shown once)
  key revoke <id>                Revoke an API key

  export pdf <deckId> [--out deck.pdf]

Global options:
  --api-key <key>     API key (or set SLIDT_API_KEY)
  --url <url>         Base URL (or set SLIDT_URL, default: http://localhost:3000)
`);
      break;
    }
  }
}

main().catch((e) => {
  console.error('Error:', e instanceof Error ? e.message : String(e));
  process.exit(1);
});
