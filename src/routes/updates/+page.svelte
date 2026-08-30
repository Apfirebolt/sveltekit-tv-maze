<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import apiClient from "$lib/plugins/interceptor";
  import type { Show, ApiResponse } from "$lib/types/Show";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Icon from "@iconify/svelte";

  let searchQuery: string = "";
  let loading: boolean = false;
  let updates: { show: Show; updatedTimestamp: number }[] = [];
  let error: Error | null = null;

  const headline = "Welcome to Updates";
  let displayedText = "";
  let typeTimer: ReturnType<typeof setTimeout> | null = null;

  const runTypewriter = () => {
    let index = 0;
    const tick = () => {
      if (index < headline.length) {
        displayedText = headline.slice(0, index + 1);
        index++;
        typeTimer = setTimeout(tick, 75);
      }
    };
    tick();
  };

  /**
   * Fetches latest updated shows from TVmaze `/updates/shows` endpoint
   * and queries full details for the top recent shows.
   */
  async function fetchLatestUpdates() {
    try {
      loading = true;
      error = null;

      const response = await apiClient.get<Record<string, number>>("/updates/shows");
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Sort show IDs by newest epoch update timestamp
      const sortedEntries = Object.entries(response.data || {})
        .sort(([, timeA], [, timeB]) => timeB - timeA)
        .slice(0, 16);

      // Fetch show details concurrently
      const detailedPromises = sortedEntries.map(async ([showId, updatedTimestamp]) => {
        try {
          const showRes: ApiResponse<Show> = await apiClient.get<Show>(`/shows/${showId}`);
          return { show: showRes.data, updatedTimestamp };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(detailedPromises);
      updates = results.filter(
        (item): item is { show: Show; updatedTimestamp: number } => item !== null
      );
    } catch (err) {
      error = err instanceof Error ? err : new Error("Failed to load show updates");
    } finally {
      loading = false;
    }
  }

  // Client-side quick search filter
  $: filteredUpdates = updates.filter(({ show }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = show.name?.toLowerCase() || "";
    const summary = show.summary?.toLowerCase() || "";
    const network = show.network?.name?.toLowerCase() || "";
    return name.includes(q) || summary.includes(q) || network.includes(q);
  });

  onMount(() => {
    runTypewriter();
    fetchLatestUpdates();
  });

  onDestroy(() => {
    if (typeTimer) clearTimeout(typeTimer);
  });
</script>

<svelte:head>
  <title>TV Maze - Latest Show Updates</title>
  <meta
    name="description"
    content="Stay updated with the latest TV shows, episode revisions, cast modifications, and metadata changes."
  />
  <meta name="keywords" content="tv updates, show revisions, episodes, casting, tv maze" />
  <meta name="author" content="Amit Prafulla" />
</svelte:head>

<div class="min-h-screen bg-light text-dark flex flex-col selection:bg-primary selection:text-light">
  <HeaderComponent title="Updates" />

  <!-- Hero Section -->
  <section
    class="relative bg-cover bg-center min-h-[460px] sm:min-h-[500px] flex items-center justify-center overflow-hidden border-b border-secondary/20"
    style="background-image: url('https://static1.cbrimages.com/wordpress/wp-content/uploads/2024/08/code-geass-feature.jpg');"
  >
    <div class="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90 pointer-events-none" />

    <div class="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16 text-light space-y-4">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-light border border-white/20 backdrop-blur-sm">
        <span class="w-1.5 h-1.5 rounded-full bg-light animate-pulse" />
        Live Database Sync & Changes
      </div>

      <h1
        class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white min-h-[2.5rem] sm:min-h-[4rem]"
        in:fly={{ y: 25, duration: 400 }}
      >
        {displayedText}
      </h1>

      <p
        class="text-sm sm:text-base lg:text-lg text-light/85 max-w-2xl mx-auto leading-relaxed"
        in:fly={{ y: 25, duration: 400, delay: 150 }}
      >
        Discover your favorite movies and more
      </p>

      <!-- Search Input -->
      <div class="pt-2 max-w-md mx-auto">
        <div class="relative">
          <input
            type="search"
            bind:value={searchQuery}
            placeholder="Filter by show title or keywords..."
            class="w-full bg-white/95 text-dark placeholder-gray-500 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm border border-white/30 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
          <Icon icon="mdi:magnify" class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-base" />
        </div>
      </div>
    </div>
  </section>

  <!-- Main Feed Area -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Status & Results Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-gray-200">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-dark tracking-tight">
          Recent TV Updates
        </h2>
        <p class="text-xs text-gray-500 mt-1 font-mono">
          {#if !loading}
            Showing {filteredUpdates.length} modified entries
          {/if}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-primary active:bg-dark text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
        on:click={fetchLatestUpdates}
      >
        <Icon icon="mdi:refresh" class="text-base {loading ? 'animate-spin' : ''}" />
        <span>Sync Latest</span>
      </button>
    </div>

    <!-- State Views -->
    {#if loading}
      <div class="flex items-center justify-center py-24">
        <Loader />
      </div>
    {:else if error}
      <div class="p-8 text-center bg-white border border-red-200 rounded-3xl shadow-sm max-w-md mx-auto space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto text-2xl">
          <Icon icon="mdi:alert-circle-outline" />
        </div>
        <div>
          <h3 class="text-base font-bold text-dark">Error loading updates</h3>
          <p class="text-xs text-red-600 mt-1">{error.message}</p>
        </div>
        <button
          type="button"
          class="px-5 py-2.5 bg-primary text-light text-xs font-bold rounded-xl shadow hover:bg-primary-dark transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          on:click={fetchLatestUpdates}
        >
          Try Again
        </button>
      </div>
    {:else if filteredUpdates.length === 0}
      <div class="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm p-8 max-w-lg mx-auto space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-secondary/15 text-primary flex items-center justify-center mx-auto text-2xl">
          <Icon icon="mdi:bell-cancel-outline" />
        </div>
        <h3 class="text-base font-bold text-dark">No updates found</h3>
        <p class="text-xs text-gray-500 max-w-xs mx-auto">
          {searchQuery ? "No entries matched your search filter." : "No updated records are available at this moment."}
        </p>
        {#if searchQuery}
          <button
            type="button"
            class="mt-2 px-4 py-2 bg-secondary text-white text-xs font-semibold rounded-xl hover:bg-primary transition shadow-sm"
            on:click={() => (searchQuery = "")}
          >
            Clear Search Filter
          </button>
        {/if}
      </div>
    {:else}
      <!-- Responsive Masonry / Multicolumn Grid -->
      <div class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {#each filteredUpdates as { show, updatedTimestamp } (show.id)}
          <article
            class="break-inside-avoid bg-white border border-gray-200 hover:border-gray-300 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            in:fly={{ y: 20, duration: 300 }}
          >
            <!-- Poster Media -->
            <div class="relative overflow-hidden bg-dark/10 aspect-auto">
              {#if show.image?.original || show.image?.medium}
                <img
                  src={show.image.medium || show.image.original}
                  alt={show.name}
                  loading="lazy"
                  class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
              {:else}
                <div class="h-48 flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
                  <Icon icon="mdi:television-off" class="text-3xl mb-1 text-gray-300" />
                  <span class="text-2xs font-mono uppercase tracking-wider text-gray-400">No Image Available</span>
                </div>
              {/if}

              <!-- Rating Badge -->
              {#if show.rating?.average}
                <div class="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark/85 text-light backdrop-blur-md text-xs font-bold shadow-md">
                  <Icon icon="mdi:star" class="text-yellow-400 text-sm" />
                  <span>{show.rating.average}</span>
                </div>
              {/if}

              <!-- Update Time Pill -->
              <div class="absolute top-3 left-3">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider bg-primary/90 text-light backdrop-blur-md shadow-sm">
                  <Icon icon="mdi:clock-check-outline" class="text-xs" />
                  Updated
                </span>
              </div>
            </div>

            <!-- Content Details -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div class="space-y-1.5">
                <div class="flex items-baseline justify-between gap-2 border-b border-gray-100 pb-2 mb-1">
                  <h3 class="text-base sm:text-lg font-bold text-dark tracking-tight group-hover:text-primary transition-colors leading-snug">
                    <a href={show.url} target="_blank" rel="noopener noreferrer">
                      {show.name}
                    </a>
                  </h3>
                </div>

                <!-- Network / Premiered -->
                <div class="flex items-center gap-2 text-2xs font-mono text-gray-500">
                  {#if show.network?.name}
                    <span>{show.network.name}</span>
                  {/if}
                  {#if show.premiered}
                    <span>&bull;</span>
                    <span>{new Date(show.premiered).getFullYear()}</span>
                  {/if}
                </div>

                <!-- Summary Preview -->
                {#if show.summary}
                  <div class="prose prose-slate max-w-none text-xs leading-relaxed text-gray-600 line-clamp-3 pt-1">
                    {@html show.summary}
                  </div>
                {/if}
              </div>

              <!-- Action Bar -->
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-2xs font-mono text-gray-500">
                <span>
                  {new Date(updatedTimestamp * 1000).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric"
                  })}
                </span>

                <a
                  href={show.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-secondary underline transition-colors"
                >
                  <span>Details</span>
                  <Icon icon="mdi:arrow-top-right" class="text-sm" />
                </a>
              </div>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </main>

  <FooterComponent />
</div>