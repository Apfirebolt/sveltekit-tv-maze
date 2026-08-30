<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import Icon from "@iconify/svelte";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";

  let email: string = "";
  let password: string = "";
  let showPassword: boolean = false;
  let rememberMe: boolean = false;
  let isSubmitting: boolean = false;
  let error: string | null = null;

  async function handleLogin() {
    if (!email || !password) {
      error = "Please fill in all fields.";
      return;
    }

    error = null;
    isSubmitting = true;

    // Simulate authentication delay
    setTimeout(() => {
      isSubmitting = false;
      alert("Login successful!");
    }, 800);
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<svelte:head>
  <title>Login - TV Maze</title>
  <meta
    name="description"
    content="Login to your TV Maze account to explore, track, and bookmark your favorite TV shows."
  />
</svelte:head>

<div class="min-h-screen bg-light text-dark flex flex-col selection:bg-primary selection:text-light">
  <HeaderComponent title="Login" />

  <!-- Main Content Wrapper -->
  <main class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
    <div
      class="w-full max-w-md bg-white border border-gray-200/80 rounded-3xl shadow-xl p-8 sm:p-10 space-y-8 backdrop-blur-sm"
      in:fly={{ y: 20, duration: 400 }}
    >
      <!-- Form Header -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary/15 text-primary mb-2 shadow-inner">
          <Icon icon="mdi:account-lock-outline" class="text-2xl" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-dark">
          Welcome Back
        </h1>
        <p class="text-xs sm:text-sm text-gray-500">
          Enter your credentials to access your watchlist & preferences.
        </p>
      </div>

      <!-- Error Notification Banner -->
      {#if error}
        <div
          class="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium"
          in:fade={{ duration: 200 }}
          role="alert"
        >
          <Icon icon="mdi:alert-circle-outline" class="text-base shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      {/if}

      <!-- Login Form -->
      <form on:submit|preventDefault={handleLogin} class="space-y-5">
        <!-- Email Field -->
        <div class="space-y-1.5">
          <label for="email" class="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Email Address
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Icon icon="mdi:email-outline" class="text-lg" />
            </div>
            <input
              type="email"
              id="email"
              bind:value={email}
              class="w-full bg-gray-50/70 border border-gray-300 text-dark placeholder-gray-400 text-sm rounded-xl pl-10 pr-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label for="password" class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Password
            </label>
            <a
              href="/forgot-password"
              class="text-xs font-semibold text-primary hover:text-secondary transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Icon icon="mdi:lock-outline" class="text-lg" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              bind:value={password}
              class="w-full bg-gray-50/70 border border-gray-300 text-dark placeholder-gray-400 text-sm rounded-xl pl-10 pr-11 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              on:click={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} class="text-lg" />
            </button>
          </div>
        </div>

        <!-- Remember Me Checkbox -->
        <div class="flex items-center">
          <label class="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600">
            <input
              type="checkbox"
              bind:checked={rememberMe}
              class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30 focus:ring-offset-0"
            />
            <span>Remember me for 30 days</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          disabled={isSubmitting}
          class="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark active:bg-secondary text-light font-bold text-sm py-3.5 px-5 rounded-xl shadow-lg shadow-primary/25 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {#if isSubmitting}
            <Icon icon="mdi:loading" class="animate-spin text-lg" />
            <span>Authenticating...</span>
          {:else}
            <span>Sign In</span>
            <Icon icon="mdi:arrow-right" class="text-base" />
          {/if}
        </button>
      </form>

      <!-- Register Footer Link -->
      <div class="text-center pt-2 border-t border-gray-100">
        <p class="text-xs text-gray-600">
          Don't have an account?{" "}
          <a
            href="/register"
            class="font-bold text-primary hover:text-secondary underline underline-offset-2 transition-colors"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  </main>

  <FooterComponent />
</div>