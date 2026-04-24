export type FieldKind =
  | 'text'
  | 'richtext'
  | 'markdown'
  | 'bool'
  | 'select'
  | 'image'
  | 'list'
  | 'group';

export interface Field {
  name: string;
  type: FieldKind;
  label?: string;
  help?: string;
  required?: boolean;
  default?: unknown;

  /** for `select` */
  options?: string[];

  /** for `image` */
  accept?: string;

  /** for `list` — the shape each item takes */
  items?: Field;

  /** for `group` */
  fields?: Field[];
}

export interface SlideType {
  name: string;
  label: string;
  fields: Field[];
  htmlTemplate: string;
  /** CSS written without an outer wrapper — the renderer auto-scopes it to `.st-<name>` */
  css: string;
  /** Set true on section-divider slides that should omit the corner logo. */
  hideCorner?: boolean;
}

export interface Theme {
  name: string;
  /** CSS custom-property name to value, e.g. `{ "--ood-white": "#FFFFFF" }` */
  tokens: Record<string, string>;
  /**
   * Optional system prompt injected into the agent when this theme is active.
   * Sets tone, style direction, and content rules for the presentation.
   */
  systemPrompt?: string;
}

export interface Slide {
  typeName: string;
  data: Record<string, unknown>;
}

export interface AppendixItem {
  path: string;
  mark: string;
  title: string;
  subtitle: string;
}

export interface Deck {
  title: string;
  lang: string;
  slides: Slide[];
  appendix?: AppendixItem[];
  appendixEyebrow?: string;
  appendixTitle?: string;
}

export interface RenderOptions {
  /** Omit appendix list slide even if appendix items are present. Default false. */
  skipAppendixList?: boolean;
  /** Skip field validation (useful for preview with empty/partial data). Default false. */
  skipValidation?: boolean;
}
