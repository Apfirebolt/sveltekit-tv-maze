<script lang="ts">
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { goto } from '$app/navigation';
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
  
    async function getPeople(query: string = "") {
      try {
        loading = true;
        const endpoint = query ? `search/people?q=${query}` : "people";
        const response: ApiResponse<SearchResult[]> =
          await apiClient.get<SearchResult[]>(endpoint);
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        people = query
          ? response.data.map((item: any) => item.person)
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
  
    const goToDetails = (person: SearchResult) => {
      goto(`/people/${person.id}`);
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
      getPeople(searchQuery);
    }
  </script>
  
  <svelte:head>
    <title>TV Maze - Browse People</title>
    <meta
      name="description"
      content="Explore a collection of people in the TV industry. Find your favorite actors, directors, and more!"
    />
  </svelte:head>
  
  <HeaderComponent title="People" />
  
  {#if loading}
    <Loader />
  {:else if error}
    <p class="text-red-500">Error loading people: {error.message}</p>
  {:else}
    <div class="bg-accent-dark">
      <section
        class="relative h-[500px] bg-cover bg-center"
        style="background-image: url('https://m.media-amazon.com/images/S/pv-target-images/830d8bb707f1461e700568a501ad23defef1dba40c697a0a29846edfb8a61f3d.png');"
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
              Discover your favorite people in the TV industry
            </p>
            <div
              class="flex items-center space-x-4 mb-6 min-w-xl bg-primary rounded-lg p-4"
            >
              <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search for people..."
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
      {#if people.length > 0}
        <h2 class="text-3xl font-bold mb-4">Search Results</h2>
      {:else}
        <p class="text-lg text-gray-500">No results found. Try a different search query.</p>
      {/if}
        <div class="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
          {#each people as person}
            <div
              class="break-inside-avoid bg-white rounded-lg shadow-lg p-4 transition-transform transform hover:scale-105"
            >
              <img
                src={person.image?.medium}
                alt={person.name}
                class="rounded-t-lg w-full h-auto"
              />
              <h3 class="text-xl font-semibold mt-2">{person.name}</h3>
              <button
                on:click={() => goToDetails(person)}
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
