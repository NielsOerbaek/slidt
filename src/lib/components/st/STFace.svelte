<script lang="ts">
  type Mood = 'idle' | 'thinking' | 'happy' | 'sleep' | 'alert';

  let { size = 18, mood = 'idle', color, animated = false }: {
    size?: number;
    mood?: Mood;
    color?: string;
    animated?: boolean;
  } = $props();

  const FRAMES = ['-_-', 'o_-', 'o_o', 'O_o', 'o_O', 'O_o', 'o_O', 'o_o', '-_o', '-_-'];

  const staticFace: Record<Mood, string> = {
    idle:     '-_-',
    thinking: '-.-',
    happy:    '^_^',
    sleep:    'z_z',
    alert:    'o_o',
  };

  let frameIdx = $state(0);
  let interval: ReturnType<typeof setInterval> | undefined;

  $effect(() => {
    if (animated) {
      frameIdx = 0;
      interval = setInterval(() => {
        frameIdx = (frameIdx + 1) % FRAMES.length;
      }, 220);
    } else {
      clearInterval(interval);
      interval = undefined;
      frameIdx = 0;
    }
    return () => clearInterval(interval);
  });

  const text = $derived(animated ? FRAMES[frameIdx] : staticFace[mood]);
</script>

<span
  class="st-face"
  style:font-size="{size}px"
  style:color={color ?? 'currentColor'}
>{text}</span>

<style>
  .st-face {
    font-family: var(--st-font-mono);
    letter-spacing: 0.05em;
    line-height: 1;
    display: inline-block;
    user-select: none;
  }
</style>
