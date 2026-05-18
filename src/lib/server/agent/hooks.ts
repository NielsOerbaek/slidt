export interface LoopHookState {
  /** True once a planning-loop nudge has been injected this run. */
  planningNudgeSent: boolean;
}

/**
 * Called at the start of each iteration, before the API request is made.
 * Returns a [System: ...] string to prepend as a user message, or null.
 */
export function getPreTurnInjection(iterCount: number, maxIterations: number): string | null {
  if (iterCount === maxIterations - 2) {
    return '[System: You have 3 iterations remaining. Please wrap up, summarise what you completed, and tell the user what (if anything) still needs to be done.]';
  }
  return null;
}

/**
 * Called when the model produced a text-only response (no tool calls).
 * Returns a [System: ...] string to inject and continue the loop, or null to end the loop.
 *
 * @param responseText - Plain text extracted from the model response.
 */
export function getPostResponseInjection(
  responseText: string,
  iterCount: number,
  maxIterations: number,
  state: LoopHookState,
): string | null {
  // Planning-loop guard: model wrote a plan but ended without calling any tools.
  if (!state.planningNudgeSent && iterCount < maxIterations - 2) {
    const endsWithQuestion = /\?[\s]*$/.test(responseText.trim());
    const looksLikePlan =
      responseText.length > 150 &&
      !endsWithQuestion &&
      (
        // General planning keywords
        /\b(step \d|\d\.\s|\bplan\b|trin \d|jeg starter|starting now|i will now|i will call|i'll start|executing|i am going to|jeg g[åa]r i gang|i'm starting|now i will|now i'll|calling now)\b/i.test(responseText) ||
        // Theme token calculations — model listed --sl-* values but didn't call the tool
        /--sl-[a-z]/.test(responseText) ||
        // Model wrote out a tool invocation in prose instead of calling it
        /\b(create_theme|update_theme|patch_slide|add_slide|reorder_slides|set_deck_title)\b/.test(responseText)
      );
    if (looksLikePlan) {
      state.planningNudgeSent = true;
      return '[System: You wrote a plan but made zero tool calls. Your NEXT response must be a tool call — call the first tool in your plan RIGHT NOW. Do not write any text before the tool call.]';
    }
  }
  return null;
}
