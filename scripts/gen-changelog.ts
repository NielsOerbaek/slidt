/**
 * Read `git log` and emit a structured changelog grouped by ISO date so the
 * /docs/changelog page can render it without any runtime git access. Runs at
 * build time via `pnpm prebuild`. Output lands in `src/lib/changelog.generated.json`
 * and is committed so dev environments see it without the prebuild step.
 *
 * Each entry: { hash, shortHash, date, isoDate, subject, body, author, type? }.
 * Conventional-commit prefix (e.g. "feat(editor):") is parsed out into `type`
 * so the page can colour-code by category.
 */
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const outPath = resolve(repoRoot, 'src/lib/changelog.generated.json');

interface ChangelogCommit {
  hash: string;
  shortHash: string;
  date: string;        // ISO 8601, used for sorting
  isoDate: string;     // YYYY-MM-DD, used for grouping
  subject: string;
  body: string;
  author: string;
  type?: string;       // feat / fix / chore / docs / refactor / etc.
  scope?: string;      // editor / preview / nav …
}

interface ChangelogDay {
  date: string;        // YYYY-MM-DD
  commits: ChangelogCommit[];
}

interface Changelog {
  generatedAt: string;
  days: ChangelogDay[];
}

const SEP = '';   // Unit Separator — unlikely in commit messages
const REC = '';   // Record Separator — splits commits

const fmt = ['%H', '%h', '%aI', '%an', '%s', '%b'].join(SEP);
const raw = execSync(
  `git log --no-merges --date=iso-strict --pretty=format:'${fmt}${REC}'`,
  { cwd: repoRoot, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 },
);

const CONV_RE = /^([a-z]+)(?:\(([^)]+)\))?(!?):\s+(.*)$/;

function parseCommit(rec: string): ChangelogCommit | null {
  const trimmed = rec.replace(/^\s+/, '').replace(/\n+$/, '');
  if (!trimmed) return null;
  const [hash, shortHash, date, author, subject, ...rest] = trimmed.split(SEP);
  if (!hash) return null;
  const body = rest.join(SEP).trim();
  const isoDate = (date ?? '').slice(0, 10);
  const out: ChangelogCommit = {
    hash: hash!,
    shortHash: shortHash!,
    date: date!,
    isoDate,
    subject: subject ?? '',
    body,
    author: author ?? '',
  };
  const m = CONV_RE.exec(subject ?? '');
  if (m) {
    out.type = m[1];
    if (m[2]) out.scope = m[2];
    out.subject = m[4]!;
  }
  return out;
}

const commits = raw
  .split(REC)
  .map(parseCommit)
  .filter((c): c is ChangelogCommit => c !== null);

const byDay = new Map<string, ChangelogCommit[]>();
for (const c of commits) {
  const arr = byDay.get(c.isoDate) ?? [];
  arr.push(c);
  byDay.set(c.isoDate, arr);
}

const days: ChangelogDay[] = [...byDay.entries()]
  .sort((a, b) => (a[0] < b[0] ? 1 : -1))
  .map(([date, commits]) => ({ date, commits }));

const out: Changelog = {
  generatedAt: new Date().toISOString(),
  days,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`changelog: ${commits.length} commits across ${days.length} days → ${outPath}`);
