// DOM Elements
const descriptionInput = document.getElementById('description');
const generateButton = document.getElementById('generate');
const resultsContainer = document.getElementById('results');
const historyContainer = document.getElementById('history');
const clearHistoryButton = document.getElementById('clear-history');
const tabs = document.querySelectorAll('.tab');
const generateTab = document.getElementById('generate-tab');
const historyTab = document.getElementById('history-tab');
const settingsTab = document.getElementById('settings-tab');
const apiKeyInput = document.getElementById('api-key');
const apiKeyStatus = document.getElementById('api-key-status');
const saveApiKeyButton = document.getElementById('save-api-key');


// State management
let isGenerating = false;

// Event Handlers
generateButton.addEventListener('click', handleGenerate);
descriptionInput.addEventListener('input', validateInput);
clearHistoryButton.addEventListener('click', handleClearHistory);
tabs.forEach(tab => tab.addEventListener('click', handleTabChange));

// Tab handling
function handleTabChange(event) {
  const selectedTab = event.target.dataset.tab;
  
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === selectedTab);
  });
  
  generateTab.style.display = selectedTab === 'generate' ? 'block' : 'none';
  historyTab.style.display = selectedTab === 'history' ? 'block' : 'none';
  settingsTab.style.display = selectedTab === 'settings' ? 'block' : 'none';
  
  if (selectedTab === 'history') {
    loadHistory();
  } else if (selectedTab === 'settings') {
    loadApiKey();
  }
}

function validateApiKey(apiKey) {
  return apiKey.trim().startsWith('sk-ant-');
}

async function loadApiKey() {
  try {
    const apiKey = await browser.runtime.sendMessage({ type: 'GET_API_KEY' });
    if (apiKey) {
      apiKeyInput.value = apiKey;
      updateApiKeyStatus(true);
    }
  } catch (error) {
    console.error('Failed to load API key:', error);
  }
}

function updateApiKeyStatus(isValid) {
  apiKeyStatus.className = `api-key-status ${isValid ? 'valid' : 'invalid'}`;
  apiKeyStatus.textContent = isValid 
    ? '✓ Valid API key format'
    : '✗ Invalid API key format';
}

// API key input validation
apiKeyInput.addEventListener('input', () => {
  const apiKey = apiKeyInput.value.trim();
  const isValid = validateApiKey(apiKey);
  updateApiKeyStatus(isValid);
  saveApiKeyButton.disabled = !isValid;
});

// Save API key
saveApiKeyButton.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  
  if (!validateApiKey(apiKey)) {
    return;
  }
  
  try {
    await browser.runtime.sendMessage({
      type: 'SAVE_API_KEY',
      apiKey
    });
    
    // Show success message
    apiKeyStatus.className = 'api-key-status valid';
    apiKeyStatus.textContent = '✓ API key saved successfully';
  } catch (error) {
    apiKeyStatus.className = 'api-key-status invalid';
    apiKeyStatus.textContent = '✗ Failed to save API key';
  }
});

function validateInput() {
  const description = descriptionInput.value.trim();
  generateButton.disabled = description.length === 0;
}

async function handleGenerate() {
  if (isGenerating) return;
  
  const description = descriptionInput.value.trim();
  if (!description) return;
  
  try {
    isGenerating = true;
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';
    resultsContainer.innerHTML = '';
    
    const queries = await browser.runtime.sendMessage({
      type: 'GENERATE_DORKS',
      description
    });
    
    await saveToHistory(description, queries);
    displayResults(queries);
  } catch (error) {
    displayError(error.message);
    
    // If API key is missing, prompt to configure it
    if (error.message.includes('API key not set')) {
      const settingsTab = document.querySelector('[data-tab="settings"]');
      settingsTab.click();
    }
  } finally {
    isGenerating = false;
    generateButton.disabled = false;
    generateButton.textContent = 'Generate Dorks';
  }
}

async function saveToHistory(description, queries) {
  const timestamp = new Date().toISOString();
  const historyItem = {
    timestamp,
    description,
    queries: queries
      .replace(/```txt\n|\n```/g, '')
      .split('\n')
      .filter(q => q.trim())
  };
  
  await browser.runtime.sendMessage({
    type: 'SAVE_TO_HISTORY',
    item: historyItem
  });
}

async function loadHistory() {
  try {
    const history = await browser.runtime.sendMessage({ type: 'GET_HISTORY' });
    displayHistory(history);
  } catch (error) {
    displayError('Failed to load history');
  }
}

function displayHistory(history) {
  historyContainer.innerHTML = '';
  
  if (!history.length) {
    historyContainer.innerHTML = '<div class="error">No history found</div>';
    return;
  }
  
  history.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'history-item';
    
    itemElement.innerHTML = `
      <div class="history-header">
        <div class="history-description">${item.description}</div>
        <div class="history-actions">
          <button class="delete" data-timestamp="${item.timestamp}">Delete</button>
        </div>
      </div>
      <div class="history-queries">
        ${item.queries.map(query => `
          <a href="https://www.google.com/search?q=${encodeURIComponent(query)}"
             class="query-link"
             target="_blank">${query}</a>
        `).join('')}
      </div>
    `;
    
    // Add delete handler
    itemElement.querySelector('.delete').addEventListener('click', () => {
      handleDeleteHistoryItem(item.timestamp);
    });
    
    historyContainer.appendChild(itemElement);
  });
}

async function handleDeleteHistoryItem(timestamp) {
  try {
    await browser.runtime.sendMessage({
      type: 'DELETE_HISTORY_ITEM',
      timestamp
    });
    loadHistory();
  } catch (error) {
    displayError('Failed to delete history item');
  }
}

async function handleClearHistory() {
  if (!confirm('Are you sure you want to clear all history?')) return;
  
  try {
    await browser.runtime.sendMessage({ type: 'CLEAR_HISTORY' });
    loadHistory();
  } catch (error) {
    displayError('Failed to clear history');
  }
}

function displayResults(queries) {
  // Parse queries from code block format
  const queriesList = queries
    .replace(/```txt\n|\n```/g, '')
    .split('\n')
    .filter(q => q.trim());
    
  queriesList.forEach(query => {
    const link = document.createElement('a');
    link.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    link.className = 'query-link';
    link.textContent = query;
    link.target = '_blank';
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      browser.tabs.create({ url: link.href });
    });
    
    resultsContainer.appendChild(link);
  });
}

function displayError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  errorDiv.textContent = `Error: ${message}`;
  resultsContainer.appendChild(errorDiv);
}

// Initial setup
validateInput();