import type { RequestEvent } from '@sveltejs/kit';
import { SKILL_TEMPLATE } from '$lib/skill-content.ts';

export async function GET(event: RequestEvent) {
  const baseUrl = event.url.origin;
  const content = SKILL_TEMPLATE.replaceAll('{{BASE_URL}}', baseUrl);
  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'inline; filename="SKILL.md"',
      'Cache-Control': 'no-cache',
    },
  });
}
