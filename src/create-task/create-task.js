/**
 * Create Task page script: handles form submission and initial load.
 */
import { createTask, getTasks } from '../services/taskService.js';

/**
 * JWT token stored after user login.
 * @type {string|null}
 */
const token = localStorage.getItem('token');
if (!token) {
  alert('No token found. Please login first.');
  window.location.href = '/login/';
}

/**
 * Current list id, read from URL (?listId=...) or localStorage fallback.
 * @type {string|null}
 */
const params = new URLSearchParams(window.location.search);
const listId = params.get('listId') || localStorage.getItem('currentListId');

if (!listId) {
  alert('No se encontró la lista seleccionada.');
  window.location.href = '/dashboard/';
}


/**
 * Task creation form element.
 * @type {HTMLFormElement|null}
 */
const taskForm = document.getElementById('taskForm');


/**
 * Handle task form submission: builds payload and creates the task.
 * Redirects to dashboard on success.
 * @param {SubmitEvent} event
 */
taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();
  const dueDate = document.getElementById('task-date').value;
  const dueTime = document.getElementById('task-time').value;
  const status = document.getElementById('task-status').value;

  try {
    await createTask(token, listId, {
      title,
      description,
      dueDate: dueDate && dueTime ? `${dueDate}T${dueTime}` : null,
      status
    });

    window.location.href = '/dashboard/';
  } catch (err) {
    alert('Error creando tarea. Revisa consola.');
    console.error(err);
  }
});



/**
 * Optionally load tasks for the selected list (useful for validations or previews).
 * Currently fetches tasks and logs/handles errors.
 * @returns {Promise<void>}
 */
async function loadTasks() {
  try {
    await getTasks(token, listId);
  } catch (err) {
    console.error('Error cargando tareas:', err);
    if (taskList) taskList.innerHTML = '<li>Error cargando tareas (ver consola)</li>';
  }
}



window.addEventListener('DOMContentLoaded', loadTasks);