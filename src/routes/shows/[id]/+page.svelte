<script lang="ts">
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { page } from "$app/stores";
  import apiClient from "$lib/plugins/interceptor";
  import type { Crew, Cast } from "$lib/types/Person";
  import type { Show, ShowImage, ApiResponse } from "$lib/types/Show";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Icon from "@iconify/svelte";

  let show: Show | null = null;
  let showImages: ShowImage[] = [];
  let crew: Crew[] = [];
  let cast: Cast[] = [];
  let loading: boolean = true;
  let error: Error | null = null;
  let activeTab: "cast" | "crew" | "gallery" = "cast";

  $: id = $page.params.id;
  $: headerTitle = show ? show.name : "Show Details";

  async function fetchAllShowData(showId: string) {
    if (!showId) return;
    try {
      loading = true;
      error = null;

      const [showRes, imagesRes, crewRes, castRes] = await Promise.allSettled([
        apiClient.get<Show>(`shows/${showId}`),
        apiClient.get<ShowImage[]>(`shows/${showId}/images`),
        apiClient.get<Crew[]>(`shows/${showId}/crew`),
        apiClient.get<Cast[]>(`shows/${showId}/cast`)
      ]);

      if (showRes.status === "fulfilled" && showRes.value.status === 200) {
        show = showRes.value.data;
      } else {
        throw new Error("Could not retrieve show information.");
      }

      showImages = imagesRes.status === "fulfilled" ? imagesRes.value.data || [] : [];
      crew = crewRes.status === "fulfilled" ? crewRes.value.data || [] : [];
      cast = castRes.status === "fulfilled" ? castRes.value.data || [] : [];
    } catch (err) {
      error = err instanceof Error ? err : new Error("An unknown error occurred");
    } finally {
      loading = false;
    }
  }

  $: if (id) {
    fetchAllShowData(id);
  }

  onMount(() => {
    if (id) {
      fetchAllShowData(id);
    }
  });
</script>

<svelte:head>
  <title>{show ? `${show.name} - TV Maze` : "Show Details - TV Maze"}</title>
  <meta
    name="description"
    content={show
      ? `Explore episodes, cast, crew, ratings, and gallery for ${show.name}.`
      : "Explore details of your favorite TV shows on TV Maze."}
  />
  <meta name="keywords" content="tv series, cast, crew, gallery, episodes, tv maze" />
  <meta name="author" content="Amit Prafulla" />
</svelte:head>

<div class="min-h-screen bg-light text-dark flex flex-col selection:bg-primary selection:text-light">
  <HeaderComponent title={headerTitle} />

  {#if loading}
    <div class="flex-1 flex items-center justify-center py-24">
      <Loader />
    </div>
  {:else if error}
    <main class="flex-1 flex items-center justify-center px-4 py-16">
      <div class="p-8 text-center bg-white border border-red-200 rounded-3xl shadow-sm max-w-md w-full space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto text-2xl">
          <Icon icon="mdi:alert-circle-outline" />
        </div>
        <div>
          <h2 class="text-base font-bold text-dark">Failed to load show details</h2>
          <p class="text-xs text-red-600 mt-1">{error.message}</p>
        </div>
        <button
          type="button"
          class="px-5 py-2.5 bg-primary text-light text-xs font-bold rounded-xl shadow hover:bg-primary-dark transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          on:click={() => fetchAllShowData(id)}
        >
          Try Again
        </button>
      </div>
    </main>
  {:else if show}
    <!-- Hero Backdrop Banner -->
    <section
      class="relative bg-cover bg-center min-h-[460px] sm:min-h-[520px] flex items-center justify-center overflow-hidden border-b border-secondary/20"
      style="background-image: url('{show.image?.original || show.image?.medium || 'https://ntvb.tmsimg.com/assets/p8696131_b_h10_aa.jpg?w=960&h=540'}');"
    >
      <div class="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/95 pointer-events-none" />

      <div class="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16 text-light space-y-5">
        
        <!-- Status & Network Badges -->
        <div class="flex flex-wrap items-center justify-center gap-2">
          {#if show.status}
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/90 text-light border border-white/20 shadow-sm backdrop-blur-md">
              {show.status}
            </span>
          {/if}
          {#if show.network?.name}
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-light border border-white/20 backdrop-blur-sm">
              <Icon icon="mdi:broadcast" class="text-xs text-primary-light" />
              {show.network.name}
            </span>
          {/if}
          {#if show.rating?.average}
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-dark/80 text-light border border-white/20 backdrop-blur-md">
              <Icon icon="mdi:star" class="text-yellow-400 text-sm" />
              {show.rating.average} / 10
            </span>
          {/if}
        </div>

        <!-- Title -->
        <h1
          class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight"
          in:fly={{ y: 20, duration: 450 }}
        >
          {show.name}
        </h1>

        <!-- Genre Tags & Premiered Subtitle -->
        <div
          class="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs sm:text-sm"
          in:fly={{ y: 20, duration: 450, delay: 150 }}
        >
          {#if show.genres && show.genres.length > 0}
            <div class="flex flex-wrap items-center justify-center gap-1.5">
              {#each show.genres as genre}
                <span class="px-2.5 py-1 rounded-lg bg-white/15 border border-white/10 backdrop-blur-md text-white font-medium text-xs">
                  {genre}
                </span>
              {/each}
            </div>
          {/if}

          {#if show.premiered}
            <span class="text-light/80 font-mono text-xs sm:text-sm ml-2">
              Premiered: {new Date(show.premiered).getFullYear()}
            </span>
          {/if}
        </div>

        <!-- Quick Action Nav CTA -->
        <div class="pt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`/shows/${id}/seasons`}
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-primary active:bg-dark text-white text-xs font-bold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-secondary/40"
          >
            <Icon icon="mdi:folder-multiple-image" class="text-base" />
            <span>View Seasons</span>
          </a>
          <a
            href={`/shows/${id}/episodes`}
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <Icon icon="mdi:playlist-play" class="text-base" />
            <span>View Episodes</span>
          </a>
          {#if show.officialSite}
            <a
              href={show.officialSite}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-semibold border border-white/10 transition-all"
            >
              <span>Official Site</span>
              <Icon icon="mdi:arrow-top-right" class="text-sm" />
            </a>
          {/if}
        </div>
      </div>
    </section>

    <!-- Main Detail Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <!-- Section 1: Poster, Summary & Specifications -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <!-- Left: Poster Card -->
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-white border border-gray-200 rounded-3xl p-4 shadow-xl overflow-hidden">
            <div class="aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 shadow-inner relative group">
              {#if show.image?.original || show.image?.medium}
                <img
                  src={show.image.original || show.image.medium}
                  alt={show.name}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              {:else}
                <div class="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                  <Icon icon="mdi:television-off" class="text-6xl text-gray-300 mb-2" />
                  <span class="text-xs font-mono uppercase tracking-wider text-gray-400">No Poster Image</span>
                </div>
              {/if}
            </div>

            <!-- Schedule Info Pill -->
            {#if show.schedule?.days?.length}
              <div class="mt-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-secondary/15 text-primary flex items-center justify-center text-lg shrink-0">
                  <Icon icon="mdi:calendar-clock" />
                </div>
                <div class="text-xs">
                  <span class="font-bold text-dark block">Broadcast Schedule</span>
                  <span class="text-gray-600 font-mono">
                    {show.schedule.days.join(", ")} {show.schedule.time ? `at ${show.schedule.time}` : ""}
                  </span>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Right: Summary & Key Metadata -->
        <div class="lg:col-span-2 space-y-6">
          <article class="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div class="border-b border-gray-200 pb-4">
              <h2 class="text-xl sm:text-2xl font-black text-dark tracking-tight">
                Show Synopsis
              </h2>
            </div>

            {#if show.summary}
              <div class="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-gray-700">
                {@html show.summary}
              </div>
            {:else}
              <p class="text-sm text-gray-500 italic">No detailed synopsis available for this show.</p>
            {/if}

            <!-- Metadata Specs Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Language
                </span>
                <span class="text-sm font-semibold text-dark">
                  {show.language || "Not specified"}
                </span>
              </div>

              <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Runtime
                </span>
                <span class="text-sm font-semibold text-dark">
                  {show.runtime ? `${show.runtime} minutes` : "Variable"}
                </span>
              </div>

              <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Network
                </span>
                <span class="text-sm font-semibold text-dark">
                  {show.network?.name || (show as any).webChannel?.name || "N/A"}
                </span>
              </div>

              <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Average Rating
                </span>
                <span class="text-sm font-semibold text-dark flex items-center gap-1">
                  <Icon icon="mdi:star" class="text-yellow-500 text-sm" />
                  {show.rating?.average ? `${show.rating.average} / 10` : "Unrated"}
                </span>
              </div>

              <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Status
                </span>
                <span class="text-sm font-semibold text-dark">
                  {show.status || "Unknown"}
                </span>
              </div>

              <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Last Updated
                </span>
                <span class="text-sm font-semibold text-dark font-mono">
                  {show.updated ? new Date(show.updated * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                </span>
              </div>
            </div>
          </article>
        </div>

      </div>

      <!-- Section 2: Tabbed Exploration for Cast, Crew & Images -->
      <div class="space-y-6">
        <!-- Interactive Tab Navigation -->
        <div class="flex items-center justify-between border-b border-gray-200 pb-3 flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 {activeTab === 'cast'
                ? 'bg-primary text-light shadow-md shadow-primary/25'
                : 'bg-white text-dark hover:bg-gray-100 border border-gray-200'}"
              on:click={() => (activeTab = "cast")}
            >
              <Icon icon="mdi:account-group-outline" class="text-base" />
              <span>Cast ({cast.length})</span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 {activeTab === 'crew'
                ? 'bg-primary text-light shadow-md shadow-primary/25'
                : 'bg-white text-dark hover:bg-gray-100 border border-gray-200'}"
              on:click={() => (activeTab = "crew")}
            >
              <Icon icon="mdi:account-hard-hat-outline" class="text-base" />
              <span>Crew ({crew.length})</span>
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 {activeTab === 'gallery'
                ? 'bg-primary text-light shadow-md shadow-primary/25'
                : 'bg-white text-dark hover:bg-gray-100 border border-gray-200'}"
              on:click={() => (activeTab = "gallery")}
            >
              <Icon icon="mdi:image-multiple-outline" class="text-base" />
              <span>Gallery ({showImages.length})</span>
            </button>
          </div>

          <a
            href="/shows"
            class="text-xs font-semibold text-primary hover:text-secondary flex items-center gap-1 underline transition-colors"
          >
            <Icon icon="mdi:arrow-left" class="text-sm" />
            <span>Back to Shows</span>
          </a>
        </div>

        <!-- Tab 1: Cast Grid -->
        {#if activeTab === "cast"}
          {#if cast.length === 0}
            <div class="text-center py-16 bg-white border border-gray-200 rounded-3xl p-8 max-w-md mx-auto">
              <Icon icon="mdi:account-off-outline" class="text-4xl text-gray-300 mx-auto mb-2" />
              <p class="text-sm font-semibold text-dark">No cast information available.</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" in:fade={{ duration: 200 }}>
              {#each cast as member}
                <article class="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
                  <div class="w-16 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    {#if member.person?.image?.medium}
                      <img
                        src={member.person.image.medium}
                        alt={member.person.name}
                        loading="lazy"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    {:else}
                      <div class="w-full h-full flex items-center justify-center text-gray-300">
                        <Icon icon="mdi:account" class="text-2xl" />
                      </div>
                    {/if}
                  </div>

                  <div class="min-w-0 flex-1 space-y-0.5">
                    <a
                      href={`/people/${member.person.id}`}
                      class="text-sm font-bold text-dark hover:text-primary transition-colors truncate block"
                    >
                      {member.person.name}
                    </a>
                    <p class="text-xs text-gray-500 truncate">
                      as <span class="font-semibold text-gray-700">{member.character?.name || "Self"}</span>
                    </p>
                  </div>
                </article>
              {/each}
            </div>
          {/if}
        {/if}

        <!-- Tab 2: Crew Grid -->
        {#if activeTab === "crew"}
          {#if crew.length === 0}
            <div class="text-center py-16 bg-white border border-gray-200 rounded-3xl p-8 max-w-md mx-auto">
              <Icon icon="mdi:account-hard-hat-outline" class="text-4xl text-gray-300 mx-auto mb-2" />
              <p class="text-sm font-semibold text-dark">No crew information available.</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" in:fade={{ duration: 200 }}>
              {#each crew as member}
                <article class="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
                  <div class="w-16 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    {#if member.person?.image?.medium}
                      <img
                        src={member.person.image.medium}
                        alt={member.person.name}
                        loading="lazy"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    {:else}
                      <div class="w-full h-full flex items-center justify-center text-gray-300">
                        <Icon icon="mdi:account" class="text-2xl" />
                      </div>
                    {/if}
                  </div>

                  <div class="min-w-0 flex-1 space-y-0.5">
                    <a
                      href={`/people/${member.person.id}`}
                      class="text-sm font-bold text-dark hover:text-primary transition-colors truncate block"
                    >
                      {member.person.name}
                    </a>
                    <span class="inline-block text-2xs px-2 py-0.5 bg-secondary/10 text-primary font-semibold rounded-md border border-secondary/20 truncate">
                      {member.type}
                    </span>
                  </div>
                </article>
              {/each}
            </div>
          {/if}
        {/if}

        <!-- Tab 3: Images Gallery Masonry / Grid -->
        {#if activeTab === "gallery"}
          {#if showImages.length === 0}
            <div class="text-center py-16 bg-white border border-gray-200 rounded-3xl p-8 max-w-md mx-auto">
              <Icon icon="mdi:image-off-outline" class="text-4xl text-gray-300 mx-auto mb-2" />
              <p class="text-sm font-semibold text-dark">No gallery visuals available for this show.</p>
            </div>
          {:else}
            <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6" in:fade={{ duration: 200 }}>
              {#each showImages as image}
                {@const imgUrl = image.resolutions?.original?.url || image.resolutions?.medium?.url || ""}
                {#if imgUrl}
                  <figure class="break-inside-avoid bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                    <img
                      src={imgUrl}
                      alt={show.name}
                      loading="lazy"
                      class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {#if image.type}
                      <figcaption class="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                        <span class="text-2xs font-mono uppercase tracking-wider text-gray-500 font-bold">
                          {image.type}
                        </span>
                      </figcaption>
                    {/if}
                  </figure>
                {/if}
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    </main>
  {/if}

  <FooterComponent />
</div>