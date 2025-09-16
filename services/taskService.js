const API_BASE_URL = 'https://lumo-back-1.onrender.com/api/lists';

/**
 * Create a new task inside a specific list.
 * @param {string} token - JWT token.
 * @param {string} listId - ID of the list where the task will be added.
 * @param {Object} taskData - Task fields (title, description, etc.).
 * @returns {Promise<Object>} - Created task object.
 */
export async function createTask(token, listId, taskData) {
  const response = await fetch(`${API_BASE_URL}/${listId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Backend response:', text);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all tasks for a list.
 * @param {string} token - JWT token.
 * @param {string} listId - ID of the list.
 * @returns {Promise<Array>} - Array of tasks.
 */
export async function getTasks(token, listId) {
  const response = await fetch(`${API_BASE_URL}/get-tasks/${listId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Backend response:', text);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}
