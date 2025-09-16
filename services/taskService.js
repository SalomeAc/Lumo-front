const TASKS_API_URL = "https://lumo-back-1.onrender.com/api/tasks";

/**
 * Crear tarea nueva
 */
export async function createTask(token, listId, taskData) {
  const response = await fetch(TASKS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      list: listId, // 👈 el backend espera este campo
      ...taskData
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("❌ Error creando tarea:", text);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Obtener tareas por lista
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
    console.error("❌ Error getTasks:", text);
    throw new Error(`Error ${response.status}`);
  }

  const data = await response.json();
  return data.tasks ?? data;
}
