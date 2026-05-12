import type { Theme } from '../renderer/types.ts';

export const minimal: Theme = {
  name: 'minimal',
  tokens: {
    '--sl-bg': '#f5f5f3',
    '--sl-surface': '#fafaf8',
    '--sl-fg': '#1a1a1a',
    '--sl-dim': '#a0a09a',
    '--sl-very-dim': '#b5b5b0',
    '--sl-border': '#e0e0db',
    '--sl-border-mid': '#d5d5d0',
    '--sl-dark-bg': '#1a1a1a',
    '--sl-dark-fg': '#f5f5f3',
    '--sl-dark-dim': '#888888',
    '--sl-accent': '#1a1a1a',
    '--sl-accent-bg': '#e8e8e6',
    '--sl-font': "'Inter', sans-serif",
    '--sl-body-font': "'Inter', sans-serif",
  },
};
