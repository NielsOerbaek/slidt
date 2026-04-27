import type { PageLoad } from './$types.js';
import changelog from '$lib/changelog.generated.json';

interface Commit {
  hash: string;
  shortHash: string;
  date: string;
  isoDate: string;
  subject: string;
  body: string;
  author: string;
  type?: string;
  scope?: string;
}

interface Day {
  date: string;
  commits: Commit[];
}

export const load: PageLoad = () => {
  const days = (changelog.days as Day[]).map((d) => {
    const features = d.commits.filter((c) => c.type === 'feat');
    const fixes = d.commits.filter((c) => c.type === 'fix');
    const other = d.commits.filter((c) => c.type !== 'feat' && c.type !== 'fix');
    return { date: d.date, features, fixes, other };
  })
  // Drop days with no user-visible content (chore-only days)
  .filter((d) => d.features.length > 0 || d.fixes.length > 0);

  return {
    generatedAt: changelog.generatedAt,
    days,
  };
};
