<script lang="ts">
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { page } from "$app/stores";
  import apiClient from "$lib/plugins/interceptor";
  import type { Person, ApiResponse } from "$lib/types/Person";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import Icon from "@iconify/svelte";

  let person: Person | null = null;
  let loading: boolean = true;
  let error: Error | null = null;

  $: id = $page.params.id;

  async function getPersonDetails(personId: string) {
    if (!personId) return;
    try {
      loading = true;
      error = null;
      const response: ApiResponse<Person> = await apiClient.get<Person>(
        `people/${personId}`
      );
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      person = response.data;
    } catch (err) {
      error = err instanceof Error ? err : new Error("An unknown error occurred");
    } finally {
      loading = false;
    }
  }

  // Reactive reload if navigating between people IDs
  $: if (id) {
    getPersonDetails(id);
  }

  onMount(() => {
    if (id) {
      getPersonDetails(id);
    }
  });
</script>

<svelte:head>
  <title>{person ? `${person.name} - Cast Details` : "Loading Person..."} - TV Maze</title>
  <meta
    name="description"
    content={person
      ? `Explore filmography, biography, birthday, and career profile for ${person.name}.`
      : "Explore TV personality profiles and credits."}
  />
</svelte:head>

<div class="min-h-screen bg-light text-dark flex flex-col selection:bg-primary selection:text-light">
  <HeaderComponent title="Person Details" />

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
          <h2 class="text-base font-bold text-dark">Failed to load personality details</h2>
          <p class="text-xs text-red-600 mt-1">{error.message}</p>
        </div>
        <button
          type="button"
          class="px-5 py-2.5 bg-primary text-light text-xs font-bold rounded-xl shadow hover:bg-primary-dark transition focus:outline-none focus:ring-2 focus:ring-primary/40"
          on:click={() => getPersonDetails(id)}
        >
          Try Again
        </button>
      </div>
    </main>
  {:else if person}
    <!-- Hero Backdrop Banner -->
    <section
      class="relative bg-cover bg-center min-h-[460px] sm:min-h-[500px] flex items-center justify-center overflow-hidden border-b border-secondary/20"
      style="background-image: url('{person.image?.original || person.image?.medium || 'https://m.media-amazon.com/images/S/pv-target-images/830d8bb707f1461e700568a501ad23defef1dba40c697a0a29846edfb8a61f3d.png'}');"
    >
      <div class="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/95 pointer-events-none" />

      <div class="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-16 text-light space-y-5">
        
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-light border border-white/20 backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-light animate-pulse" />
          Industry Profile
        </div>

        <!-- Name Title -->
        <h1
          class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight"
          in:fly={{ y: 20, duration: 450 }}
        >
          {person.name}
        </h1>

        <!-- Key Metadata Pills -->
        <div
          class="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs sm:text-sm"
          in:fly={{ y: 20, duration: 450, delay: 150 }}
        >
          {#if person.birthday}
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-white font-mono">
              <Icon icon="mdi:cake-variant-outline" class="text-base text-primary-light" />
              Born: {new Date(person.birthday).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
              {#if person.deathday}
                &mdash; Died: {new Date(person.deathday).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              {/if}
            </span>
          {/if}

          {#if person.gender}
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-white font-semibold">
              <Icon icon="mdi:gender-male-female" class="text-base" />
              {person.gender}
            </span>
          {/if}

          {#if person.country?.name}
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-white font-semibold">
              <Icon icon="mdi:map-marker-outline" class="text-base" />
              {person.country.name}
              {#if person.country.code}
                ({person.country.code})
              {/if}
            </span>
          {/if}
        </div>
      </div>
    </section>

    <!-- Main Profile Breakdown Body -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <!-- Left Column: Portrait Card -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white border border-gray-200 rounded-3xl p-4 shadow-xl overflow-hidden">
            <div class="aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 shadow-inner relative">
              {#if person.image?.original || person.image?.medium}
                <img
                  src={person.image.original || person.image.medium}
                  alt={person.name}
                  class="w-full h-full object-cover"
                />
              {:else}
                <div class="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                  <Icon icon="mdi:account-outline" class="text-6xl text-gray-300 mb-2" />
                  <span class="text-xs font-mono uppercase tracking-wider text-gray-400">No Portrait Photo</span>
                </div>
              {/if}
            </div>

            <!-- Profile Actions -->
            <div class="pt-4 px-2 space-y-3">
              {#if person.url}
                <a
                  href={person.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full inline-flex items-center justify-center gap-2 bg-secondary hover:bg-primary active:bg-dark text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <span>Official TVmaze Record</span>
                  <Icon icon="mdi:open-in-new" class="text-sm" />
                </a>
              {/if}
            </div>
          </div>
        </div>

        <!-- Right Column: Biography & Career Attributes -->
        <div class="lg:col-span-2 space-y-6">
          <article class="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div class="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 class="text-xl sm:text-2xl font-black text-dark tracking-tight">
                Biography & Profile Overview
              </h2>
              <span class="text-2xs font-mono text-gray-400 uppercase tracking-wider">
                ID #{person.id}
              </span>
            </div>

            <!-- Biographical Specs Table -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Full Name
                </span>
                <span class="text-sm font-semibold text-dark">
                  {person.name}
                </span>
              </div>

              <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Nationality / Origin
                </span>
                <span class="text-sm font-semibold text-dark">
                  {person.country?.name ? `${person.country.name} (${person.country.timezone || "Global"})` : "Not specified"}
                </span>
              </div>

              <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Gender Identity
                </span>
                <span class="text-sm font-semibold text-dark">
                  {person.gender || "Not specified"}
                </span>
              </div>

              <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                <span class="text-2xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Status
                </span>
                <span class="text-sm font-semibold text-dark">
                  {#if person.deathday}
                    Deceased (Passed away {new Date(person.deathday).getFullYear()})
                  {:else}
                    Active
                  {/if}
                </span>
              </div>
            </div>

            <!-- Overview Text / Description Fallback -->
            <div class="space-y-3 pt-2">
              <h3 class="text-sm font-bold uppercase tracking-wider text-gray-700">
                Career Summary
              </h3>
              <p class="text-sm sm:text-base leading-relaxed text-gray-700">
                {person.name} is an acknowledged television personality recorded in the open TV registry. 
                {#if person.country?.name}
                  Originating from {person.country.name}, their profile links across multiple television credits and broadcast productions.
                {:else}
                  Their profile connects with episodic productions, broadcast series, and creative industry credits.
                {/if}
              </p>
            </div>

            <!-- Back Navigation -->
            <div class="pt-6 border-t border-gray-200 flex items-center justify-between">
              <a
                href="/people"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-secondary underline transition-colors"
              >
                <Icon icon="mdi:arrow-left" class="text-sm" />
                <span>Back to People Directory</span>
              </a>
            </div>
          </article>
        </div>

      </div>
    </main>
  {/if}

  <FooterComponent />
</div>