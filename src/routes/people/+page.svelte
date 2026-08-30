<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import apiClient from "$lib/plugins/interceptor";
  import type { SearchResult, ApiResponse } from "$lib/types/Person";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Icon from "@iconify/svelte";

  let searchQuery: string = "";
  let loading: boolean = false;
  let people: SearchResult[] = [];
  let error: Error | null = null;

  const headline = "Welcome to Svelte Maze";
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

  async function getPeople(query: string = "") {
    try {
      loading = true;
      error = null;
      const endpoint = query ? `search/people?q=${encodeURIComponent(query)}` : "people";
      const response: ApiResponse<SearchResult[]> = await apiClient.get<SearchResult[]>(endpoint);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      people = query
        ? (response.data as any[]).map((item: any) => item.person || item)
        : response.data || [];
    } catch (err) {
      error = err instanceof Error ? err : new Error("An unknown error occurred");
    } finally {
      loading = false;
    }
  }

  const goToDetails = (person: SearchResult) => {
    goto(`/people/${person.id}`);
  };

  function handleSearch() {
    getPeople(searchQuery.trim());
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  onMount(() => {
    runTypewriter();
    getPeople();
  });

  onDestroy(() => {
    if (typeTimer) clearTimeout(typeTimer);
  });
</script>

<svelte:head>
  <title>TV Maze - Browse People</title>
  <meta
    name="description"
    content="Explore a collection of people in the TV industry. Find your favorite actors, directors, writers, and cast members!"
  />
  <meta name="keywords" content="actors, directors, cast, tv maze, people, crew, entertainment" />
  <meta name="author" content="Amit Prafulla" />
</svelte:head>

<div class="min-h-screen bg-light text-dark flex flex-col selection:bg-primary selection:text-light">
  <HeaderComponent title="People" />

  <!-- Hero Section -->
  <section
    class="relative bg-cover bg-center min-h-[480px] sm:min-h-[520px] flex items-center justify-center overflow-hidden border-b border-secondary/20"
    style="background-image: url('https://m.media-amazon.com/images/S/pv-target-images/830d8bb707f1461e700568a501ad23defef1dba40c697a0a29846edfb8a61f3d.png');"
  >
    <div class="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90 pointer-events-none" />

    <div class="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16 space-y-6">
      
      <!-- Headline & Tag -->
      <div class="space-y-3">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-light border border-white/20 backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-light animate-pulse" />
          Industry Cast & Creative Directory
        </div>

        <h1
          class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white min-h-[2.5rem] sm:min-h-[4rem]"
          in:fly={{ y: 20, duration: 400 }}
        >
          {displayedText}
        </h1>

        <p
          class="text-sm sm:text-base lg:text-lg text-light/85 max-w-xl mx-auto leading-relaxed"
          in:fly={{ y: 20, duration: 400, delay: 150 }}
        >
          Discover your favorite actors, directors, and creators across television history.
        </p>
      </div>

      <!-- Glassmorphic Search Form Box -->
      <div
        class="max-w-xl mx-auto bg-primary/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl space-y-3"
        in:fly={{ y: 25, duration: 450, delay: 200 }}
      >
        <form on:submit|preventDefault={handleSearch} class="flex items-center gap-2">
          <div class="relative flex-1">
            <Icon
              icon="mdi:magnify"
              class="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              bind:value={searchQuery}
              on:keydown={handleKeydown}
              placeholder="Search actors, directors, writers..."
              class="w-full bg-white text-dark placeholder-gray-500 rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm border border-transparent shadow-inner focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
            />
          </div>

          <button
            type="submit"
            class="px-5 py-3 rounded-xl bg-secondary hover:bg-tertiary active:bg-dark text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/40 shrink-0"
            aria-label="Search people"
          >
            <Icon icon="mdi:magnify" class="text-lg" />
            <span class="hidden sm:inline">Search</span>
          </button>
        </form>

        {#if searchQuery}
          <div class="flex items-center justify-between text-2xs text-light/80 px-1">
            <span>Query: <strong class="text-white">"{searchQuery}"</strong></span>
            <button
              type="button"
              class="hover:text-white underline focus:outline-none"
              on:click={() => {
                searchQuery = "";
                getPeople();
              }}
            >
              Reset Search
            </button>
          </div>
        {/if}
      </div>

    </div>
  </section>

  <!-- Main Grid Content -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <h3 class="text-base font-bold text-dark">Error loading directory</h3>
          <p class="text-xs text-red-600 mt-1">{error.message}</p>
        </div>
        <button
          type="button"
          class="px-5 py-2.5 bg-primary text-light text-xs font-bold rounded-xl shadow hover:bg-primary-dark transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          on:click={() => getPeople(searchQuery)}
        >
          Retry Search
        </button>
      </div>
    {:else if people.length === 0}
      <div class="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm p-8 max-w-lg mx-auto space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-secondary/15 text-primary flex items-center justify-center mx-auto text-2xl">
          <Icon icon="mdi:account-search-outline" />
        </div>
        <h3 class="text-base font-bold text-dark">No people found</h3>
        <p class="text-xs text-gray-500 max-w-xs mx-auto">
          We couldn't find anyone matching your search query. Try another name or keyword.
        </p>
        <button
          type="button"
          class="mt-2 px-5 py-2 bg-secondary text-white text-xs font-semibold rounded-xl hover:bg-primary transition shadow-sm"
          on:click={() => {
            searchQuery = "";
            getPeople();
          }}
        >
          View All People
        </button>
      </div>
    {:else}
      <!-- Section Title & Results Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-gray-200">
        <div>
          <h2 class="text-2xl sm:text-3xl font-black text-dark tracking-tight">
            {searchQuery ? "Search Results" : "Featured TV Personalities"}
          </h2>
          <p class="text-xs text-gray-500 mt-1 font-mono">
            Showing {people.length} profiles
          </p>
        </div>

        {#if searchQuery}
          <button
            type="button"
            class="text-xs font-semibold text-primary hover:text-secondary flex items-center gap-1 transition-colors self-start sm:self-auto"
            on:click={() => {
              searchQuery = "";
              getPeople();
            }}
          >
            <Icon icon="mdi:arrow-left" class="text-sm" />
            <span>Clear search filter</span>
          </button>
        {/if}
      </div>

      <!-- Responsive Masonry / Multicolumn Feed -->
      <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {#each people as person (person.id)}
          <article
            class="break-inside-avoid bg-white border border-gray-200 hover:border-gray-300 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            in:fly={{ y: 20, duration: 300 }}
          >
            <!-- Portrait Media Container -->
            <div class="relative overflow-hidden bg-dark/5 aspect-auto">
              {#if person.image?.original || person.image?.medium}
                <img
                  src={person.image?.original || person.image?.medium}
                  alt={person.name}
                  loading="lazy"
                  class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
              {:else}
                <div class="h-64 flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
                  <Icon icon="mdi:account-outline" class="text-4xl mb-1 text-gray-300" />
                  <span class="text-2xs font-mono uppercase tracking-wider text-gray-400">No Photo Available</span>
                </div>
              {/if}

              {#if person.country?.name}
                <div class="absolute top-3 left-3">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-2xs font-semibold bg-dark/80 text-light backdrop-blur-md shadow-sm">
                    <Icon icon="mdi:map-marker-outline" class="text-xs" />
                    {person.country.name}
                  </span>
                </div>
              {/if}

              {#if person.gender}
                <div class="absolute top-3 right-3">
                  <span class="px-2 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider bg-primary/90 text-light backdrop-blur-md shadow-sm">
                    {person.gender}
                  </span>
                </div>
              {/if}
            </div>

            <!-- Profile Info & CTAs -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-1.5">
                <h3 class="text-lg font-bold text-dark tracking-tight group-hover:text-primary transition-colors">
                  {person.name}
                </h3>

                {#if person.birthday}
                  <p class="text-2xs font-mono text-gray-500">
                    Born: {new Date(person.birthday).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                    {#if person.deathday}
                      &mdash; {new Date(person.deathday).getFullYear()}
                    {/if}
                  </p>
                {/if}
              </div>

              <!-- Action Button Row -->
              <div class="pt-3 border-t border-gray-100">
                <button
                  type="button"
                  on:click={() => goToDetails(person)}
                  class="w-full inline-flex items-center justify-center gap-2 bg-secondary hover:bg-primary active:bg-dark text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 group/btn"
                >
                  <Icon icon="mdi:account-details-outline" class="text-base" />
                  <span>View Details</span>
                  <Icon icon="mdi:arrow-right" class="text-sm group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </main>

  <FooterComponent />
</div>