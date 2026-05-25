<script>
  import { grid, userGrid } from '@sudoku/stores/grid';
  import { ai } from '@sudoku/ai';
  import APIKeyConfig from './APIKeyConfig.svelte';
  import AIMessage from './AIMessage.svelte';

  let isOpen = false;
  let currentMode = null;
  let tutorQuestion = '';

  async function requestHint() {
    currentMode = 'hint';
    await ai.getHint($grid, $userGrid);
  }

  async function requestTutor() {
    currentMode = 'tutor';
    const question = tutorQuestion || 'How should I approach this puzzle?';
    await ai.getTutor(question, $grid, $userGrid);
  }

  async function requestSolve() {
    currentMode = 'solve';
    await ai.getSolve($grid, $userGrid);
  }

  async function requestExplain() {
    currentMode = 'explain';
    await ai.getExplain($grid, $userGrid);
  }

  function togglePanel() {
    isOpen = !isOpen;
  }
</script>

<!-- Toggle Button -->
<button
  on:click={togglePanel}
  class="fixed right-0 top-1/2 transform -translate-y-1/2 z-50 bg-blue-500 hover:bg-blue-600 text-white px-2 py-4 rounded-l-lg shadow-lg transition-all duration-300 {isOpen ? 'translate-x-64' : ''}"
  style="writing-mode: vertical-rl;"
>
  {isOpen ? '→' : '←'} AI
</button>

<!-- Sidebar Panel -->
<div
  class="fixed right-0 top-0 h-full w-64 bg-white shadow-2xl z-40 transform transition-transform duration-300"
  class:translate-x-full={!isOpen}
>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 flex items-center justify-between">
      <h2 class="font-bold text-gray-700">🤖 AI Sudoku</h2>
      <button
        on:click={togglePanel}
        class="text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>

    <!-- API Key Config -->
    <APIKeyConfig />

    <!-- AI Buttons -->
    <div class="flex-1 overflow-auto p-4 space-y-3">
      <button
        on:click={requestHint}
        class="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-left transition-colors"
      >
        <span class="block font-medium">💡 AI Hint</span>
        <span class="text-xs text-blue-500">Get strategic hint</span>
      </button>

      <button
        on:click={requestTutor}
        class="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-left transition-colors"
      >
        <span class="block font-medium">📚 AI Tutor</span>
        <span class="text-xs text-purple-500">Ask questions</span>
      </button>

      <div class="pt-2 border-t border-gray-200">
        <input
          type="text"
          bind:value={tutorQuestion}
          placeholder="Ask a question..."
          class="w-full px-3 py-2 text-sm border rounded mb-2"
        />
      </div>

      <button
        on:click={requestSolve}
        class="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-left transition-colors"
      >
        <span class="block font-medium">🔢 AI Solve</span>
        <span class="text-xs text-green-500">Show solution</span>
      </button>

      <button
        on:click={requestExplain}
        class="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-left transition-colors"
      >
        <span class="block font-medium">📖 AI Explain</span>
        <span class="text-xs text-orange-500">Analyze board</span>
      </button>
    </div>

    <!-- AI Response -->
    <div class="border-t border-gray-200 bg-gray-50 overflow-auto flex-1">
      <AIMessage />
    </div>
  </div>
</div>