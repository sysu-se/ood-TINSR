<script>
  import { apiKey } from '@sudoku/stores/settings';

  function saveKey() {
    localStorage.setItem('ai_api_key', $apiKey);
    alert('API Key 已保存!');
  }
</script>

<div class="api-key-config p-4 border-b border-gray-200">
  <div class="flex items-center gap-2">
    <span class="text-sm font-medium text-gray-600">千问 API Key:</span>
  </div>

  <div class="mt-2">
    <input
      type="password"
      bind:value={apiKey}
      placeholder="输入你的API Key..."
      class="w-full text-sm px-2 py-1 border rounded"
    />
    <button
      on:click={saveKey}
      class="mt-2 w-full text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      保存并使用
    </button>
  </div>

  <p class="mt-2 text-xs text-gray-500">
    请从 <a href="https://dashscope.console.aliyun.com" target="_blank" class="text-blue-500 hover:underline">阿里云百炼</a> 获取 API Key
  </p>
</div>