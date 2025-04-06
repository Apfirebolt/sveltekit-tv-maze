<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import apiClient from "$lib/plugins/interceptor";
  import type { Show, ApiResponse } from "$lib/types/Show";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Icon from "@iconify/svelte";

  let searchQuery: string = "";
  let loading: boolean = false;
  let shows: Show[] = []; // Initialize shows as an empty array
  let error: Error | null = null;

  let text = "Welcome to Updates";
  let displayedText = "";
  let index = 0;

  // Typewriter effect logic
  const typeWriter = () => {
    if (index < text.length) {
      displayedText += text[index];
      index++;
      setTimeout(typeWriter, 100); // Adjust speed here
    }
  };

  // Start the typewriter effect when the component is mounted
  typeWriter();
</script>

<svelte:head>
  <title>TV Maze - Latest Updates</title>
  <meta
    name="description"
    content="Latest updates related to show or person go here!"
  />
</svelte:head>

<HeaderComponent title="Updates" />
{#if loading}
  <Loader />
{:else if error}
  <p class="text-red-500">Error loading shows: {error.message}</p>
{:else}
  <div class="bg-accent-dark">
    <section
      class="relative h-[500px] bg-cover bg-center"
      style="background-image: url('https://static1.cbrimages.com/wordpress/wp-content/uploads/2024/08/code-geass-feature.jpg');"
    >
      <div
        class="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black via-transparent to-black"
        in:fly={{ x: -200, duration: 500 }}
      >
        <div class="text-center text-white">
          <h1 class="mb-4 text-4xl font-bold md:text-6xl">
            {displayedText}
          </h1>
          <p
            class="mb-6 text-lg md:text-xl"
            in:fly={{ x: 500, duration: 500, delay: 200 }}
          >
            Discover your favorite movies and more
          </p>
        </div>
      </div>
    </section>
  </div>
{/if}

<FooterComponent />
