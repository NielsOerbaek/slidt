<script lang="ts">
  type Mood = 'idle' | 'thinking' | 'happy' | 'sleep' | 'alert';

  let { size = 18, mood = 'idle', color }: {
    size?: number;
    mood?: Mood;
    color?: string;
  } = $props();

  const eye = { idle: '-', thinking: '-', happy: '^', sleep: 'z', alert: 'o' } as const;
  const mouth = { idle: '_', thinking: '.', happy: '_', sleep: '_', alert: '_' } as const;
  const text = $derived(`${eye[mood]}${mouth[mood]}${eye[mood]}`);
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
