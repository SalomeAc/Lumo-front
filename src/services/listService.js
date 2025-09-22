const API_BASE_URL = 'https://lumo-back-1.onrender.com/api/lists'; 

/**
 * Get all lists for the current user.
 * @param {string} token - JWT token for authentication.
 * @returns {Promise<Array>} - Array of lists.
 */
export async function getUserLists(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/get-user-lists`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user lists:', error);
    return [];
  }
}

/**
 * Create a new list for the current user.
 * @param {string} title - The title of the list.
 * @param {string} token - JWT token for authentication.
 * @returns {Promise<Object>} The created list object.
 */
export async function createList(title, token) {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
}

/**
 * Delete a list by its identifier.
 * @param {string} token - JWT token for authentication.
 * @param {string} listId - The list identifier to delete.
 * @returns {Promise<Object>} API response JSON.
 */
export async function deleteList(token, listId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${listId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Error deleting list:', text);
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting list:', error);
    throw error;
  }
}