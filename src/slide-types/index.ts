import type { SlideType } from '../renderer/types.ts';
import { cover } from './title.ts';
import { agenda } from './agenda.ts';
import { bulletList } from './content.ts';
import { numberedList } from './principles.ts';
import { columnList } from './values.ts';
import { calloutContent } from './reserve.ts';
import { cardGrid } from './purposes.ts';
import { divider } from './section.ts';
import { teamCards } from './ownership.ts';
import { comparison } from './friction.ts';
import { qaList } from './discussion.ts';
import { closing } from './closing.ts';
import { appendixList } from './appendix-list.ts';
import { quote } from './quote.ts';
import { statGrid } from './stat-grid.ts';
import { timeline } from './timeline.ts';
import { twoColumn } from './two-column.ts';
import { threeColumn } from './three-column.ts';
import { dotFlow } from './dot-flow.ts';
import { quotePair } from './quote-pair.ts';

export const BUILT_IN_SLIDE_TYPES: SlideType[] = [
  cover,
  agenda,
  bulletList,
  numberedList,
  columnList,
  calloutContent,
  cardGrid,
  divider,
  teamCards,
  comparison,
  qaList,
  closing,
  appendixList,
  quote,
  statGrid,
  timeline,
  twoColumn,
  threeColumn,
  dotFlow,
  quotePair,
];

export {
  cover,
  agenda,
  bulletList,
  numberedList,
  columnList,
  calloutContent,
  cardGrid,
  divider,
  teamCards,
  comparison,
  qaList,
  closing,
  appendixList,
  quote,
  statGrid,
  timeline,
  twoColumn,
  threeColumn,
  dotFlow,
  quotePair,
};
