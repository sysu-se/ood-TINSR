<script>
  import { aiLoading, aiError, aiResponse } from '@sudoku/ai';

  $: if ($aiLoading) {
    // Loading state handled in component
  }
</script>

{#if $aiLoading}
  <div class="flex items-center justify-center p-4">
    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
    <span class="ml-2 text-sm text-gray-500">AI is thinking...</span>
  </div>
{:else if $aiError}
  <div class="p-4 bg-red-50 border-l-4 border-red-500">
    <p class="text-sm text-red-700">Error: {$aiError}</p>
  </div>
{:else if $aiResponse}
  <div class="p-4">
    <div class="text-xs text-gray-400 mb-2 uppercase tracking-wide">
      AI Response
    </div>
    <div class="prose prose-sm max-w-none">
      {#if $aiResponse.type === 'hint'}
        <span class="text-blue-600 font-medium">💡 Hint</span>
      {:else if $aiResponse.type === 'tutor'}
        <span class="text-purple-600 font-medium">📚 Tutor</span>
      {:else if $aiResponse.type === 'solve'}
        <span class="text-green-600 font-medium">🔢 Solution</span>
      {:else if $aiResponse.type === 'explain'}
        <span class="text-orange-600 font-medium">📖 Explanation</span>
      {/if}
      <div class="mt-2 text-gray-700 whitespace-pre-wrap">{$aiResponse.content}</div>
    </div>
  </div>
{:else}
  <div class="p-4 text-center text-gray-400 text-sm">
    Select an AI feature to get started
  </div>
{/if}