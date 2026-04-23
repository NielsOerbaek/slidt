import type { SlideType } from '../renderer/types.ts';
import { title } from './title.ts';
import { agenda } from './agenda.ts';
import { content } from './content.ts';
import { principles } from './principles.ts';
import { values } from './values.ts';
import { reserve } from './reserve.ts';
import { purposes } from './purposes.ts';
import { section } from './section.ts';
import { ownership } from './ownership.ts';
import { friction } from './friction.ts';
import { discussion } from './discussion.ts';
import { closing } from './closing.ts';
import { appendixList } from './appendix-list.ts';

export const BUILT_IN_SLIDE_TYPES: SlideType[] = [
  title,
  agenda,
  content,
  principles,
  values,
  reserve,
  purposes,
  section,
  ownership,
  friction,
  discussion,
  closing,
  appendixList,
];

export {
  title,
  agenda,
  content,
  principles,
  values,
  reserve,
  purposes,
  section,
  ownership,
  friction,
  discussion,
  closing,
  appendixList,
};
