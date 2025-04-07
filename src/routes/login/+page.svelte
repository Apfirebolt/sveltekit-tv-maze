<script lang="ts">
  import { fade } from "svelte/transition";  
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";

  let email: string = "";
  let password: string = "";
  let error: string | null = null;

  function handleLogin() {
    if (!email || !password) {
      error = "Please fill in all fields.";
      return;
    }

    error = null;
    alert("Login successful!");
  }
</script>

<svelte:head>
  <title>Login - TV Maze</title>
  <meta
    name="description"
    content="Login to your TV Maze account to explore your favorite TV shows."
  />
</svelte:head>

<HeaderComponent title="Login" />

<div class="container mx-auto py-8">
  <h1 class="text-4xl font-bold text-center mb-6">Login</h1>
  <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
    {#if error}
      <p class="text-red-500 mb-4">{error}</p>
    {/if}
    <form on:submit|preventDefault={handleLogin} class="space-y-6"
        in:fade={{ duration: 500 }}>
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          bind:value={email}
          class="mt-1 block w-full border border-tertiary rounded-lg shadow-sm focus:ring-2 focus:ring-secondary focus:outline-none transition duration-200 ease-in-out p-3"
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          bind:value={password}
          class="mt-1 block w-full border border-tertiary rounded-lg shadow-sm focus:ring-2 focus:ring-secondary focus:outline-none transition duration-200 ease-in-out p-3"
          placeholder="Enter your password"
          required
        />
      </div>
      <button
        type="submit"
        class="w-full bg-primary text-white py-2 px-4 rounded-lg shadow-md hover:bg-secondary transition duration-200 ease-in-out"
      >
        Login
      </button>

      <p>
        Don't have an account?{" "}
        <a href="/register" class="text-secondary hover:underline">
          Register here
        </a>
      </p>
    </form>
  </div>
</div>

<FooterComponent />
