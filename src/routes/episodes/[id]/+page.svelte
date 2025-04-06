<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { page } from "$app/stores";
  import apiClient from "$lib/plugins/interceptor";
  import type { Episode, ApiResponse } from "$lib/types/Episode";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";
  import Loader from "$lib/components/Loader.svelte";

  let episode: Episode | null = null;
  let loading: boolean = true;
  let error: Error | null = null;

  // Extract the `id` parameter from the route
  let id: string;
  $: id = $page.params.id;

  async function getEpisodeDetails() {
    try {
      loading = true;
      const response: ApiResponse<Episode> = await apiClient.get<Episode>(
        `episodes/${id}`
      );
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      episode = response.data; // Assuming the response data is an Episode object
    } catch (err) {
      error =
        err instanceof Error ? err : new Error("An unknown error occurred");
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    getEpisodeDetails();
  });
</script>

<svelte:head>
  <title>{episode ? episode.name : "Loading..."} - TV Maze</title>
  <meta
    name="description"
    content="Explore details of your favorite TV episodes, including summary, air date, and more."
  />
</svelte:head>

<HeaderComponent title="Episode Details" />
{#if loading}
  <Loader />
{:else if error}
  <p class="text-red-500">Error loading episode: {error.message}</p>
{:else if episode}
  <div class="bg-accent-dark">
    <section
      class="relative h-[500px] bg-cover bg-center"
      style="background-image: url('{episode.image?.original ||
        episode.image?.medium ||
        ''}');"
    >
      <div
        class="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black via-transparent to-black"
        in:fly={{ x: -200, duration: 500 }}
      >
        <div class="text-center text-white">
          <h1 class="mb-4 text-4xl font-bold md:text-6xl">{episode.name}</h1>
          <p
            class="mb-6 text-lg md:text-xl"
            in:fly={{ x: 500, duration: 500, delay: 200 }}
          >
            Air Date: {episode.airdate} | Season {episode.season}, Episode {episode.number}
          </p>
        </div>
      </div>
    </section>

    <div class="container mx-auto py-8">
      <h2 class="text-3xl font-bold mb-4">Episode Summary</h2>
      <div class="bg-white rounded-lg shadow-lg p-4">
        {@html episode.summary}
      </div>
    </div>
  </div>
{/if}

<FooterComponent />
