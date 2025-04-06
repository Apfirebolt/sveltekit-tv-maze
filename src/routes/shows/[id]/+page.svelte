<script lang="ts">
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { page } from "$app/stores";
    import apiClient from "$lib/plugins/interceptor";
    import type { Show, ApiResponse } from "$lib/types/Show";
    import HeaderComponent from "$lib/components/Header.svelte";
    import FooterComponent from "$lib/components/Footer.svelte";
    import Loader from "$lib/components/Loader.svelte";
  
    let show: Show | null = null;
    let loading: boolean = true;
    let error: Error | null = null;
  
    // Extract the `id` parameter from the route
    let id: string;
    $: id = $page.params.id;
  
    async function getShowDetails() {
      try {
        loading = true;
        const response: ApiResponse<Show> = await apiClient.get<Show>(
          `shows/${id}`
        );
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        show = response.data; // Assuming the response data is a Show object
      } catch (err) {
        error =
          err instanceof Error ? err : new Error("An unknown error occurred");
      } finally {
        loading = false;
      }
    }
  
    onMount(() => {
      getShowDetails();
    });
  </script>
  
  <svelte:head>
    <title>{show ? show.name : "Loading..."} - TV Maze</title>
    <meta
      name="description"
      content="Explore details of your favorite TV shows, including summary, genres, and more."
    />
  </svelte:head>
  
  <HeaderComponent title="Show Details" />
  {#if loading}
    <Loader />
  {:else if error}
    <p class="text-red-500">Error loading show: {error.message}</p>
  {:else if show}
    <div class="bg-accent-dark">
      <section
        class="relative h-[500px] bg-cover bg-center"
        style="background-image: url('{show.image?.original ||
          show.image?.medium ||
          ''}');"
      >
        <div
          class="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black via-transparent to-black"
          in:fly={{ x: -200, duration: 500 }}
        >
          <div class="text-center text-white">
            <h1 class="mb-4 text-4xl font-bold md:text-6xl">{show.name}</h1>
            <p
              class="mb-6 text-lg md:text-xl"
              in:fly={{ x: 500, duration: 500, delay: 200 }}
            >
              Genres: {show.genres.join(", ")} | Premiered: {show.premiered}
            </p>
          </div>
        </div>
      </section>
  
      <div class="container mx-auto py-8">
        <h2 class="text-3xl font-bold mb-4">Show Summary</h2>
        <div class="bg-white rounded-lg shadow-lg p-4">
          {@html show.summary}
        </div>
        <h2 class="text-3xl font-bold mt-8 mb-4">Details</h2>
        <div class="bg-white rounded-lg shadow-lg p-4">
          <p><strong>Status:</strong> {show.status}</p>
          <p><strong>Language:</strong> {show.language}</p>
          <p><strong>Runtime:</strong> {show.runtime} minutes</p>
          <p><strong>Rating:</strong> {show.rating.average || "N/A"}</p>
          <p><strong>Official Site:</strong> <a href={show.officialSite} target="_blank">{show.officialSite}</a></p>
          <p><strong>Schedule:</strong> {show.schedule.days.join(", ")} at {show.schedule.time}</p>
          <p><strong>Network:</strong> {show.network?.name || "N/A"}</p>
          <p><strong>Updated:</strong> {new Date(show.updated).toLocaleDateString()}</p>
        </div>    
      </div>
    </div>
  {/if}
  
  <FooterComponent />
