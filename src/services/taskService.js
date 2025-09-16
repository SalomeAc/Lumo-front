/**
 * Base API endpoint for task-related operations.
 * @type {string}
 */
const TASKS_API_URL = "https://lumo-back-1.onrender.com/api/tasks";


/**
 * Create a new task in a specific list.
 *
 * @param {string} token - JWT token for authorization.
 * @param {string} listId - The ID of the list where the task belongs.
 * @param {{title:string, description?:string, status?:string, dueDate?:string, [key:string]:any}} taskData - Task payload. `dueDate` should be an ISO-like string (e.g., "2025-09-16T10:30").
 * @returns {Promise<Object>} Resolves with the created task object from the API.
 * @throws {Error} If the API responds with a non-OK status code.
 */
export async function createTask(token, listId, taskData) {
  const response = await fetch(TASKS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      list: listId, 
      ...taskData
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Error creando tarea:", text);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}


/**
 * Retrieve all tasks for a given list.
 *
 * @param {string} token - JWT token for authorization.
 * @param {string} listId - The ID of the list to fetch tasks for.
 * @returns {Promise<Array>} Resolves with an array of task objects.
 * @throws {Error} If the API responds with a non-OK status code.
 */
export async function getTasks(token, listId) {
  const response = await fetch(
    `https://lumo-back-1.onrender.com/api/lists/get-tasks/${listId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("Error getTasks:", text);
    throw new Error(`Error ${response.status}`);
  }

  const data = await response.json();
  return data.tasks ?? data;
}

/** Update task by id */
export async function updateTask(token, taskId, taskData) {
  const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error actualizando tarea:', text);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/** Delete task by id */
export async function deleteTask(token, taskId) {
  const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error eliminando tarea:', text);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}