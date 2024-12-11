// Configuration
const API_URL = 'https://api.anthropic.com/v1/messages';
const STORAGE_KEY = 'dorks_history';

// System prompt for generating dorks
const SYSTEM_PROMPT = "You are an LLM designed to generate advanced Google search queries (“Google dorks”) based on a user’s description. Your response must follow these rules:\n\n1. Produce a set of multiple (e.g., 5 to 10) distinct and comprehensive Google dorks that leverage advanced operators and variations in keywords.\n2. Explore synonyms, related terms, and different search facets to provide a range of search angles.\n3. Make different combinations of the search terms\n4. Format the entire response as a single fenced code block in markdown with `txt` specified as the language.\n5. Output only the generated dorks, with no explanations or other content outside the code block.\n\nFor example:\n{{example_output}}\n\nDo not include any content outside the code block.";

async function getApiKey() {
  const data = await browser.storage.local.get('api_key');
  return data.api_key;
}

// Message handling
browser.runtime.onMessage.addListener(handleMessage);

async function handleMessage(message) {
  switch (message.type) {
    case 'SAVE_API_KEY':
      return await saveApiKey(message.apiKey);
    case 'GET_API_KEY':
      return await getApiKey();
    case 'GENERATE_DORKS':
      return await generateDorks(message.description);
    case 'SAVE_TO_HISTORY':
      return await saveToHistory(message.item);
    case 'GET_HISTORY':
      return await getHistory();
    case 'DELETE_HISTORY_ITEM':
      return await deleteHistoryItem(message.timestamp);
    case 'CLEAR_HISTORY':
      return await clearHistory();
    default:
      throw new Error('Invalid message type');
  }
}

async function saveApiKey(apiKey) {
  await browser.storage.local.set({ api_key: apiKey });
  return true;
}


async function generateDorks(description) {
  const apiKey = await getApiKey();
  
  if (!apiKey) {
    throw new Error('API key not set. Please configure your API key in settings.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },

    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: '<examples>\n<example>\n<example_output>\n```txt\nsite:example.com \"keyword\" intitle:\"login\"\n```\n</example_output>\n<ideal_output>\n```txt\nsite:linkedin.com/in/* \"bolt\" (\"technical recruiter\" OR \"talent acquisition\" OR \"talent manager\" OR \"sourcer\")\nsite:linkedin.com/in/* \"bolt\" (\"hiring\" OR \"recruiting\" OR \"staffing\") current\nsite:linkedin.com/in/* intitle:\"recruiter\" \"bolt\" -\"formerly\"\nsite:linkedin.com/in/* \"bolt\" (\"HR\" OR \"Human Resources\" OR \"People Operations\") (\"recruiting\" OR \"talent\")\nsite:linkedin.com/in/* \"bolt.com\" (\"recruiter\" OR \"talent acquisition\")\nsite:linkedin.com/in/* \"working at bolt\" (\"recruiter\" OR \"talent\")\nsite:linkedin.com/in/* \"@bolt\" (\"recruiter\" OR \"talent acquisition specialist\")\nsite:linkedin.com/in/* \"bolt payments\" (\"recruiter\" OR \"talent acquisition\")\nsite:linkedin.com/in/* intitle:\"talent\" \"bolt\" current\nsite:linkedin.com/in/* \"bolt\" (\"recruiting manager\" OR \"recruiting lead\" OR \"head of recruiting\")\n```\n</ideal_output>\n</example>\n</examples>\n\n'
        },
        {
          role: 'user',
          content: description
        }
      ]
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('API Error:', errorData);
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.content && Array.isArray(data.content) && data.content[0]) {
    return data.content[0].text;
  } else {
    throw new Error('Unexpected API response format');
  }
}

// Storage functions
async function getHistory() {
  const data = await browser.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] || [];
}

async function saveToHistory(item) {
  const history = await getHistory();
  history.unshift(item); // Add new item to the beginning
  
  // Keep only the last 50 items
  if (history.length > 50) {
    history.pop();
  }
  
  await browser.storage.local.set({ [STORAGE_KEY]: history });
  return history;
}

async function deleteHistoryItem(timestamp) {
  const history = await getHistory();
  const updatedHistory = history.filter(item => item.timestamp !== timestamp);
  await browser.storage.local.set({ [STORAGE_KEY]: updatedHistory });
  return updatedHistory;
}

async function clearHistory() {
  await browser.storage.local.remove(STORAGE_KEY);
  return [];
}

