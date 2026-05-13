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
      /\b(step \d|\d\.\s|\bplan\b|trin \d|jeg starter|starting now|i will now|i'll start|executing|i am going to|jeg g[åa]r i gang|i'm starting)\b/i.test(responseText);
    if (looksLikePlan) {
      state.planningNudgeSent = true;
      return '[System: You wrote a plan but made zero tool calls. Execute your plan now — make the first tool call immediately, no more text first.]';
    }
  }
  return null;
}
