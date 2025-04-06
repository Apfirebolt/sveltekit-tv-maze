<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { goto } from '$app/navigation';
  import apiClient from "$lib/plugins/interceptor";
  import type { SearchResult, ApiResponse } from "$lib/types/Show";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Icon from "@iconify/svelte";

  let searchQuery: string = "";
  let loading: boolean = false;
  let shows: SearchResult[] = [];
  let error: Error | null = null;

  async function getShows(query: string = "") {
    try {
      loading = true;
      const endpoint = query ? `search/shows?q=${query}` : "shows";
      const response: ApiResponse<SearchResult[]> =
        await apiClient.get<SearchResult[]>(endpoint);
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      shows = query
        ? response.data.map((item: any) => item.show)
        : response.data;
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

  const goToDetails = (show : SearchResult) => {
    goto(`/shows/${show.id}`);
  };

  const typeWriter = () => {
    if (index < text.length) {
      displayedText += text[index];
      index++;
      setTimeout(typeWriter, 100);
    }
  };

  typeWriter();

  function handleSearch() {
    getShows(searchQuery);
  }
</script>

<svelte:head>
  <title>TV Maze - Browse Latest TV Shows</title>
  <meta
    name="description"
    content="Explore a collection of the latest shows, including genres, ratings, and more. Find your next favorite tv show here!"
  />
</svelte:head>

<HeaderComponent title="Shows" />

{#if loading}
  <Loader />
{:else if error}
  <p class="text-red-500">Error loading shows: {error.message}</p>
{:else}
  <div class="bg-accent-dark">
    <section
      class="relative h-[500px] bg-cover bg-center"
      style="background-image: url('https://static1.srcdn.com/wordpress/wp-content/uploads/2020/08/The-Big-Bang-Theory-cast.jpg');"
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
          <div
            class="flex items-center space-x-4 mb-6 min-w-xl bg-primary rounded-lg p-4"
          >
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search for TV shows..."
              class="w-full p-2 border rounded"
            />
            <button
              on:click={handleSearch}
              class="bg-secondary text-white px-4 py-2 rounded hover:bg-tertiary"
            >
              <Icon icon="mdi:magnify" class="text-2xl" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="container mx-auto py-8">
    {#if shows.length > 0}
      <h2 class="text-3xl font-bold mb-4">Search Results</h2>
    {:else}
      <p class="text-lg text-gray-500">No results found. Try a different search query.</p>
    {/if}
      <div class="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
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
            <button
              on:click={() => goToDetails(show)}
              class="mt-4 bg-secondary text-white flex justify-between items-center px-4 py-2 rounded hover:bg-primary"
            >
              <Icon icon="mdi:information" class="text-2xl mx-2" />
              View Details
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<FooterComponent />
