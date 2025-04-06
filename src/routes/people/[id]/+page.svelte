<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { page } from "$app/stores";
  import apiClient from "$lib/plugins/interceptor";
  import type { Person, ApiResponse } from "$lib/types/Person";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";
  import Loader from "$lib/components/Loader.svelte";

  let person: Person | null = null;
  let loading: boolean = true;
  let error: Error | null = null;

  // Extract the `id` parameter from the route
  let id: string;
  $: id = $page.params.id;

  async function getPersonDetails() {
    try {
      loading = true;
      const response: ApiResponse<Person> = await apiClient.get<Person>(
        `people/${id}`
      );
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      person = response.data; // Assuming the response data is a Person object
    } catch (err) {
      error =
        err instanceof Error ? err : new Error("An unknown error occurred");
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    getPersonDetails();
  });
</script>

<svelte:head>
  <title>{person ? person.name : "Loading..."} - TV Maze</title>
  <meta
    name="description"
    content="Explore details of your favorite TV personalities, including biography, birthday, and more."
  />
</svelte:head>

<HeaderComponent title="Person Details" />
{#if loading}
  <Loader />
{:else if error}
  <p class="text-red-500">Error loading person: {error.message}</p>
{:else if person}
  <div class="bg-accent-dark">
    <section
      class="relative h-[500px] bg-cover bg-center"
      style="background-image: url('{person.image?.original ||
        person.image?.medium ||
        ''}');"
    >
      <div
        class="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black via-transparent to-black"
        in:fly={{ x: -200, duration: 500 }}
      >
        <div class="text-center text-white">
          <h1 class="mb-4 text-4xl font-bold md:text-6xl">{person.name}</h1>
          <p
            class="mb-6 text-lg md:text-xl"
            in:fly={{ x: 500, duration: 500, delay: 200 }}
          >
            Birthday: {person.birthday} | Gender: {person.gender} | Country: {person.country.name}
          </p>
        </div>
      </div>
    </section>

    <div class="container mx-auto py-8">
      <h2 class="text-3xl font-bold mb-4">Biography</h2>
      <div class="bg-white rounded-lg shadow-lg p-4">
        {#if person.image?.medium}
          <img src={person.image.medium} alt={person.name} class="rounded-lg" />
        {:else}
          <p>No image available.</p>
        {/if}
      </div>
    </div>
  </div>
{/if}

<FooterComponent />
