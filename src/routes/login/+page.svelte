<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types.js';

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Log in — slidt</title></svelte:head>

<div class="login-wrap">
  <div class="login-card">
    <h1>slidt</h1>
    <p class="sub">Sign in to continue</p>

    {#if form?.error}
      <p class="error" role="alert">{form.error}</p>
    {/if}

    <form method="POST" use:enhance>
      <label>
        Email
        <input type="email" name="email" required autocomplete="email" />
      </label>
      <label>
        Password
        <input type="password" name="password" required autocomplete="current-password" />
      </label>
      <button type="submit">Log in</button>
    </form>
  </div>
</div>

<style>
  .login-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f0eeff;
  }
  .login-card {
    background: white;
    border-radius: 12px;
    padding: 40px 48px;
    width: 360px;
    box-shadow: 0 4px 24px rgba(110,49,255,0.12);
  }
  h1 { font-size: 32px; font-weight: 700; color: #6e31ff; margin: 0 0 4px; }
  .sub { color: #666; margin: 0 0 28px; font-size: 14px; }
  .error { color: #c00; background: #fff0f0; border: 1px solid #fcc; border-radius: 6px; padding: 8px 12px; font-size: 13px; margin-bottom: 16px; }
  label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 500; color: #444; margin-bottom: 16px; }
  input { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; outline-offset: 2px; }
  input:focus { outline: 2px solid #6e31ff; border-color: transparent; }
  button[type="submit"] {
    width: 100%;
    padding: 12px;
    background: #6e31ff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
  }
  button[type="submit"]:hover { background: #5a28d4; }
</style>
