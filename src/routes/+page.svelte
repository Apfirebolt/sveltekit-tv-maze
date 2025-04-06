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
  let loading: boolean = true;
  let shows: Show[] = []; // Initialize shows as an empty array
  let error: Error | null = null;

  async function getShows() {
    try {
      loading = true;
      const response: ApiResponse<Show[]> =
        await apiClient.get<Show[]>("shows");
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      shows = response.data; // Assuming the response data is an array of Show objects
    } catch (err) {
      error =
        err instanceof Error ? err : new Error("An unknown error occurred");
    } finally {
      loading = false;
    }
  }

  let text = "Welcome to Svelte Maze";
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

  onMount(() => {
    getShows();
  });
</script>

<svelte:head>
  <title>TV Maze - Browse Latest TV Shows</title>
  <meta
    name="description"
    content="Explore a collection of the latest shows, including genres, ratings, and more. Find your next favorite tv show here!"
  />
</svelte:head>

<HeaderComponent title="Movies" />
{#if loading}
  <Loader />
{:else if error}
  <p class="text-red-500">Error loading shows: {error.message}</p>
{:else}
  <div class="bg-accent-dark">
    <section
  class="relative h-[500px] bg-cover bg-center"
  style="background-image: url('https://ntvb.tmsimg.com/assets/p8696131_b_h10_aa.jpg?w=960&h=540');"
>
  <div
    class="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black via-transparent to-black"
    in:fly={{ x: -200, duration: 500 }}
  >
    <div class="text-center text-white">
      <h1 class="mb-4 text-4xl font-bold md:text-6xl">
        {displayedText}
      </h1>
      <p class="mb-6 text-lg md:text-xl" 
        in:fly={{ x: 500, duration: 500, delay: 200 }}>
        Discover your favorite movies and more
      </p>
    </div>
  </div>
</section>

    <div class="container mx-auto py-8">
      <h2 class="text-3xl font-bold mb-4">Latest Movies</h2>
      <div
        class="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4"
      >
        {#each shows as show}
          <div
            class="break-inside-avoid bg-white rounded-lg shadow-lg p-4 transition-transform transform hover:scale-105"
          >
            <img
              src={show.image?.medium}
              alt={show.name}
              class="rounded-t-lg w-full h-auto"
            />
            <h3 class="text-xl font-semibold mt-2">{show.name}</h3>
            {@html show.summary}
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<FooterComponent />
