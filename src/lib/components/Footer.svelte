<script lang="ts">
  export let year: number = new Date().getFullYear();
  let menuItems = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
    { name: "Shows", url: "/shows" },
    { name: "People", url: "/people" },
    { name: "Updates", url: "/updates" },
  ];
</script>

<footer class="bg-secondary text-white py-6 border-t border-gray-700">
  <div class="container mx-auto text-center space-y-4">
    <nav class="flex justify-center space-x-6">
      {#each menuItems as item}
        <a href={item.url} class="text-sm hover:underline">
          {item.name}
        </a>
      {/each}
    </nav>
    <p class="text-sm">
      &copy; {year} Sveltekit TV Maze. All rights reserved.
    </p>
  </div>
</footer>
