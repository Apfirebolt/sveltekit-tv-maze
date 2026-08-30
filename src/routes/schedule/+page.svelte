<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fly, fade } from "svelte/transition";
  import apiClient from "$lib/plugins/interceptor";
  import type { Schedule } from "$lib/types/Schedule";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Icon from "@iconify/svelte";

  const countries = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "IN", name: "India" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "JP", name: "Japan" }
  ];

  let selectedCountry = "US";
  let selectedDate: string = new Date().toISOString().split("T")[0];
  let searchQuery: string = "";
  let loading: boolean = false;
  let items: Schedule[] = [];
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

  const fetchSchedule = async () => {
    loading = true;
    error = null;
    try {
      const response = await apiClient.get<Schedule[]>(
        `/schedule?country=${selectedCountry}&date=${selectedDate}`
      );
      items = response.data || [];
    } catch (err) {
      error = err instanceof Error ? err : new Error("Failed to load broadcast schedule");
      items = [];
    } finally {
      loading = false;
    }
  };

  // Quick date jump helpers
  function setDateOffset(offsetDays: number) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    selectedDate = d.toISOString().split("T")[0];
    fetchSchedule();
  }

  // Client-side quick filter on active schedule results
  $: filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const showName = item.show?.name?.toLowerCase() || "";
    const epName = item.name?.toLowerCase() || "";
    const network = item.show?.network?.name?.toLowerCase() || "";
    return showName.includes(q) || epName.includes(q) || network.includes(q);
  });

  onMount(() => {
    runTypewriter();
    fetchSchedule();
  });

  onDestroy(() => {
    if (typeTimer) clearTimeout(typeTimer);
  });
</script>

<svelte:head>
  <title>TV Maze - Airing Schedule</title>
  <meta
    name="description"
    content="Browse live television schedules, air times, and network premiere listings across international territories."
  />
  <meta name="keywords" content="tv schedule, air times, tv maze, streaming schedule, television guide" />
  <meta name="author" content="Amit Prafulla" />
</svelte:head>

<div class="min-h-screen bg-light text-dark flex flex-col selection:bg-primary selection:text-light">
  <HeaderComponent title="TV Schedule" />

  <!-- Hero Section with Background Banner -->
  <section
    class="relative bg-cover bg-center min-h-[500px] sm:min-h-[540px] flex items-center justify-center overflow-hidden border-b border-secondary/20"
    style="background-image: url('https://www.hollywoodreporter.com/wp-content/uploads/2024/12/Squidgame_Unit_204_N064080.jpg?w=1296&h=730&crop=1');"
  >
    <div class="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90 pointer-events-none" />

    <div class="relative z-10 max-w-4xl w-full mx-auto text-center px-4 sm:px-6 lg:px-8 py-14 space-y-6">
      
      <!-- Headline & Badge -->
      <div class="space-y-3">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-light border border-white/20 backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-light animate-pulse" />
          Live Broadcasting & Airing Grid
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
          Discover your favorite movies and more
        </p>
      </div>

      <!-- Schedule Filter Control Panel -->
      <div
        class="max-w-2xl mx-auto bg-primary/85 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/20 shadow-2xl space-y-4 text-left"
        in:fly={{ y: 25, duration: 450, delay: 200 }}
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Country Select -->
          <div class="space-y-1.5">
            <label for="country" class="block text-2xs font-bold uppercase tracking-wider text-light">
              Broadcast Territory
            </label>
            <div class="relative">
              <select
                id="country"
                bind:value={selectedCountry}
                on:change={fetchSchedule}
                class="w-full bg-white text-dark text-xs sm:text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-transparent shadow-inner focus:outline-none focus:ring-2 focus:ring-secondary transition-all cursor-pointer"
              >
                {#each countries as c}
                  <option value={c.code}>{c.name} ({c.code})</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Date Picker -->
          <div class="space-y-1.5">
            <label for="date" class="block text-2xs font-bold uppercase tracking-wider text-light">
              Airing Date
            </label>
            <input
              id="date"
              type="date"
              bind:value={selectedDate}
              on:change={fetchSchedule}
              class="w-full bg-white text-dark text-xs sm:text-sm font-semibold rounded-xl px-3.5 py-2.5 border border-transparent shadow-inner focus:outline-none focus:ring-2 focus:ring-secondary transition-all cursor-pointer"
            />
          </div>
        </div>

        <!-- Quick Jump Buttons & Search Filter -->
        <div class="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <!-- Quick date buttons -->
          <div class="flex items-center gap-1.5">
            <span class="text-2xs uppercase tracking-wider text-light/70 font-semibold mr-1 hidden sm:inline">Jump:</span>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg text-2xs font-bold bg-white/10 hover:bg-white/20 text-light border border-white/15 transition-colors"
              on:click={() => setDateOffset(-1)}
            >
              Yesterday
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg text-2xs font-bold bg-white/20 hover:bg-white/30 text-light border border-white/30 transition-colors"
              on:click={() => setDateOffset(0)}
            >
              Today
            </button>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg text-2xs font-bold bg-white/10 hover:bg-white/20 text-light border border-white/15 transition-colors"
              on:click={() => setDateOffset(1)}
            >
              Tomorrow
            </button>
          </div>

          <!-- Refresh Button -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary hover:bg-tertiary active:bg-dark text-white text-2xs font-bold transition shadow-sm"
            on:click={fetchSchedule}
          >
            <Icon icon="mdi:refresh" class="text-sm {loading ? 'animate-spin' : ''}" />
            <span>Refresh Grid</span>
          </button>
        </div>
      </div>

    </div>
  </section>

  <!-- Main Schedule Content Area -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
    
    <!-- Header / Status Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-dark tracking-tight flex items-center gap-2">
          <span>Schedule for {new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span class="text-xs px-2.5 py-0.5 rounded-md bg-secondary text-white font-mono">
            {selectedCountry}
          </span>
        </h2>
        <p class="text-xs text-gray-500 mt-1 font-mono">
          {#if !loading}
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'broadcast' : 'broadcasts'}
          {/if}
        </p>
      </div>

      <!-- In-Page Quick Filter Input -->
      <div class="w-full sm:w-72">
        <div class="relative">
          <Icon icon="mdi:magnify" class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            bind:value={searchQuery}
            placeholder="Filter by show or network..."
            class="w-full bg-white text-dark placeholder-gray-400 rounded-xl pl-9 pr-3 py-2 text-xs border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Feed Output Stages -->
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
          <h3 class="text-base font-bold text-dark">Error loading schedule</h3>
          <p class="text-xs text-red-600 mt-1">{error.message}</p>
        </div>
        <button
          type="button"
          class="px-5 py-2.5 bg-primary text-light text-xs font-bold rounded-xl shadow hover:bg-primary-dark transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          on:click={fetchSchedule}
        >
          Try Again
        </button>
      </div>
    {:else if filteredItems.length === 0}
      <div class="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm p-8 max-w-lg mx-auto space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-secondary/15 text-primary flex items-center justify-center mx-auto text-2xl">
          <Icon icon="mdi:calendar-blank-outline" />
        </div>
        <h3 class="text-base font-bold text-dark">No broadcasts scheduled</h3>
        <p class="text-xs text-gray-500 max-w-xs mx-auto">
          {searchQuery ? "No scheduled show matched your search filter." : "No scheduled shows found for the selected country and date."}
        </p>
        {#if searchQuery}
          <button
            type="button"
            class="mt-2 px-4 py-2 bg-secondary text-white text-xs font-semibold rounded-xl hover:bg-primary transition shadow-sm"
            on:click={() => (searchQuery = "")}
          >
            Clear Filter
          </button>
        {/if}
      </div>
    {:else}
      <!-- Masonry Grid for Airing Cards -->
      <div class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {#each filteredItems as item (item.id)}
          <article
            class="break-inside-avoid bg-white border border-gray-200 hover:border-gray-300 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            in:fly={{ y: 20, duration: 300 }}
          >
            <!-- Show Banner / Poster Image -->
            <div class="relative overflow-hidden bg-dark/10 aspect-auto">
              {#if item.show?.image?.original || item.show?.image?.medium || item.image?.original || item.image?.medium}
                <img
                  src={item.image?.medium || item.show?.image?.medium || item.show?.image?.original}
                  alt={item.show?.name || item.name}
                  loading="lazy"
                  class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
              {:else}
                <div class="h-44 flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
                  <Icon icon="mdi:television-guide" class="text-3xl mb-1 text-gray-300" />
                  <span class="text-2xs font-mono uppercase tracking-wider text-gray-400">No Image Available</span>
                </div>
              {/if}

              <!-- Time Badge -->
              {#if item.airtime}
                <div class="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark/85 text-light backdrop-blur-md text-2xs font-mono font-bold shadow-md">
                  <Icon icon="mdi:clock-outline" class="text-xs text-primary-light" />
                  <span>{item.airtime}</span>
                </div>
              {/if}

              <!-- Season & Episode Badge -->
              {#if item.season !== undefined && item.number !== undefined}
                <div class="absolute top-3 right-3">
                  <span class="px-2 py-0.5 rounded-md text-2xs font-bold uppercase tracking-wider bg-primary/90 text-light backdrop-blur-md shadow-sm">
                    S{item.season} &bull; E{item.number}
                  </span>
                </div>
              {/if}
            </div>

            <!-- Content Card Body -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div class="space-y-1.5">
                <!-- Show Title & Network -->
                <div class="flex items-baseline justify-between gap-2 border-b border-gray-100 pb-2 mb-1">
                  <h3 class="text-base sm:text-lg font-bold text-dark tracking-tight group-hover:text-primary transition-colors leading-snug">
                    <a href={item.show?.url || item.url} target="_blank" rel="noopener noreferrer">
                      {item.show?.name || item.name}
                    </a>
                  </h3>
                </div>

                {#if item.name && item.name !== item.show?.name}
                  <p class="text-xs font-semibold text-secondary-dark line-clamp-1">
                    "{item.name}"
                  </p>
                {/if}

                <!-- Network / Channel & Runtime Info -->
                <div class="flex items-center gap-2 text-2xs font-mono text-gray-500">
                  {#if item.show?.network?.name}
                    <span class="inline-flex items-center gap-1">
                      <Icon icon="mdi:broadcast" class="text-xs" />
                      {item.show.network.name}
                    </span>
                  {/if}
                  {#if item.runtime}
                    <span>&bull;</span>
                    <span>{item.runtime} mins</span>
                  {/if}
                </div>

                <!-- Episode Summary -->
                {#if item.summary}
                  <div class="prose prose-slate max-w-none text-xs leading-relaxed text-gray-600 line-clamp-3 pt-1">
                    {@html item.summary}
                  </div>
                {/if}
              </div>

              <!-- Action Link -->
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span class="text-2xs font-mono text-gray-400">
                  Date: {item.airdate}
                </span>

                <a
                  href={item.url || item.show?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-secondary underline transition-colors"
                >
                  <span>More Info</span>
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