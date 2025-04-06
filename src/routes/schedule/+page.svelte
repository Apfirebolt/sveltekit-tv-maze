<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import apiClient from "$lib/plugins/interceptor";
  import type { Schedule } from "$lib/types/Schedule";
  import HeaderComponent from "$lib/components/Header.svelte";
  import FooterComponent from "$lib/components/Footer.svelte";
  import Loader from "$lib/components/Loader.svelte";

  let countries = ["US", "UK", "CA", "IN", "AU"]; // Add more countries as needed
  let selectedCountry = "US";
  let selectedDate: string = new Date().toISOString().split("T")[0]; // Default to today's date
  let loading: boolean = false;
  let items: Schedule[] = [];
  let error: Error | null = null;

  const fetchSchedule = async () => {
    loading = true;
    error = null;
    items = [];
    try {
      const response = await apiClient.get<Schedule[]>(
        `/schedule?country=${selectedCountry}&date=${selectedDate}`
      );
      items = response.data;
    } catch (err) {
      error = err as Error;
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    fetchSchedule();
  });
</script>

<svelte:head>
  <title>TV Maze - Schedule</title>
  <meta
    name="description"
    content="View the TV schedule for your selected country and date!"
  />
</svelte:head>

<HeaderComponent title="TV Schedule" />

<div class="p-4">
  <div class="mb-4 flex flex-col gap-4 md:flex-row">
    <div
      class="transition-all w-1/3 duration-300 p-4 bg-light rounded-lg shadow-md hover:shadow-lg"
    >
      <label for="country" class="block mb-2 font-bold text-gray-700"
        >Select Country:</label
      >
      <select
        id="country"
        bind:value={selectedCountry}
        class="p-2 border rounded w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        on:change={fetchSchedule}
      >
        {#each countries as country}
          <option value={country}>{country}</option>
        {/each}
      </select>
    </div>

    <div
      class="transition-all w-1/3 duration-300 p-4 bg-light rounded-lg shadow-md hover:shadow-lg"
    >
      <label for="date" class="block mb-2 font-bold text-gray-700"
        >Select Date:</label
      >
      <input
        id="date"
        type="date"
        bind:value={selectedDate}
        class="p-2 border rounded w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        on:change={fetchSchedule}
      />
    </div>
  </div>

  {#if loading}
    <Loader />
  {:else if error}
    <p class="text-red-500">Error loading schedule: {error.message}</p>
  {:else if items.length === 0}
    <p class="text-gray-500">
      No shows found for the selected date and country.
    </p>
  {:else}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each items as show}
        <div class="p-4 border rounded bg-white shadow">
          <h2 class="text-lg font-bold">{show.show.name}</h2>
          <p>
            Air Date: {show.airdate} | Time: {show.airtime}
          </p>
          <p>Season: {show.season}</p>
          {@html show.summary}
          <a href={show.url} target="_blank" class="text-blue-500 underline"
            >More Info</a
          >
          {#if show.image}
            <img src={show.image.medium} alt={show.name} class="mt-2 rounded" />
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<FooterComponent />
