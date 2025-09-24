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

/**
 * Update a task by its identifier.
 *
 * @param {string} token - JWT token for authorization.
 * @param {string} taskId - The task identifier to update.
 * @param {Partial<Pick<Task, 'title' | 'description' | 'status' | 'dueDate'>> & Record<string, any>} taskData - Fields to update.
 * @returns {Promise<Task>} Resolves with the updated task object.
 * @throws {Error} If the API responds with a non-OK status code.
 */
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

/**
 * Delete a task by its identifier.
 *
 * @param {string} token - JWT token for authorization.
 * @param {string} taskId - The task identifier to delete.
 * @returns {Promise<Object>} Resolves with API response JSON (may include the deleted task or a status payload).
 * @throws {Error} If the API responds with a non-OK status code.
 */
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

/**
 * Get all tasks grouped by status (Kanban view).
 * Calls GET /api/tasks on the backend which returns:
 * { ongoingTasks, unassignedTasks, doneTasks }
 *
 * @param {string} token - JWT token for authorization.
 * @returns {Promise<{ongoingTasks:Array, unassignedTasks:Array, doneTasks:Array}>}
 */

export async function getKanbanTasks(token) {
  const res = await fetch(TASKS_API_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const text = await res.text();
  console.log('[getKanbanTasks] status:', res.status, 'body:', text);

  if (!res.ok) {
    throw new Error(`Kanban API error ${res.status}: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('[getKanbanTasks] JSON parse error:', err);
    throw new Error('Invalid JSON from Kanban endpoint');
  }
}

/**
 * Find a task by id. Intenta usar el endpoint Kanban (GET /api/tasks)
 * que devuelve arrays agrupados, y busca dentro de ellos.
 * @param {string} token
 * @param {string} taskId
 * @returns {Promise<Object|null>} la tarea o null si no existe
 */
export async function getTaskById(token, taskId) {
  if (!token) throw new Error('No token provided to getTaskById');
  // Llamamos al endpoint que ya tienes: GET /api/tasks (kanban)
  const data = await getKanbanTasks(token); // devuelve { ongoingTasks, unassignedTasks, doneTasks } u otro formato
  // normalizar a array plano
  let all = [];
  if (Array.isArray(data)) {
    all = data;
  } else if (Array.isArray(data.tasks)) {
    all = data.tasks;
  } else {
    // posibles keys
    all = [
      ...(data.ongoingTasks || data.ongoing || []),
      ...(data.unassignedTasks || data.unassigned || []),
      ...(data.doneTasks || data.done || []),
    ];
  }
  const found = all.find(t => (t._id || t.id) === taskId);
  return found || null;
}