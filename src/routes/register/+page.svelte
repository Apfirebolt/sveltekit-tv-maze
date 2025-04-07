<script lang="ts">
  import { fly } from "svelte/transition";  
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";

  let username: string = "";
  let email: string = "";
  let password: string = "";
  let error: string | null = null;

  function handleRegister() {
    if (!username || !email || !password) {
      error = "Please fill in all fields.";
      return;
    }

    error = null;
    alert("Registration successful!");
  }
</script>

<svelte:head>
  <title>Register - TV Maze</title>
  <meta
    name="description"
    content="Register for a TV Maze account to explore your favorite TV shows."
  />
</svelte:head>

<HeaderComponent title="Register" />

<div class="container mx-auto py-8">
  <h1 class="text-4xl font-bold text-center mb-6">Register</h1>
  <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
    {#if error}
      <p class="text-red-500 mb-4">{error}</p>
    {/if}
    <form on:submit|preventDefault={handleRegister} class="space-y-6"
        in:fly={{ x: -200, duration: 500 }}
    >
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          bind:value={username}
          class="mt-1 block w-full border border-tertiary rounded-lg shadow-sm focus:ring-2 focus:ring-secondary focus:outline-none transition duration-200 ease-in-out p-3"
          placeholder="Enter your username"
          required
        />
      </div>
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
        Register
      </button>
      <p>
        Already have an account?{" "}
        <a href="/login" class="text-secondary hover:underline">
          Login here
        </a>
      </p>
    </form>
  </div>
</div>

<FooterComponent />
