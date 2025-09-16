import { updateTask, getTasks } from '../services/taskService.js';

/**
 * JWT token from localStorage.
 * @type {string|null}
 */
const token = localStorage.getItem('token');
if (!token) {
  alert('No token found. Please login first.');
  window.location.href = '/login/';
}

/**
 * Task id selected for editing, stored by the dashboard view.
 * @type {string|null}
 */
const taskId = localStorage.getItem('editTaskId');
if (!taskId) {
  alert('No se encontró la tarea a editar.');
  window.location.href = '/dashboard/';
}

/**
 * Current list id context for fetching related tasks.
 * @type {string|null}
 */
const listId = localStorage.getItem('currentListId');
if (!listId) {
  alert('No se encontró la lista asociada.');
  window.location.href = '/dashboard/';
}

/**
 * Edit form element.
 * @type {HTMLFormElement|null}
 */
const form = document.getElementById('EditTaskForm');

/**
 * Display a temporary toast notification.
 * @param {string} message
 * @param {"info"|"success"|"error"} [type="info"]
 */
function showToast(message, type = "info") {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Fetch tasks for the current list, find the one to edit, and populate the form.
 * Redirects back to dashboard if not found or on error.
 * @returns {Promise<void>}
 */
async function loadTask() {
  try {
    const tasks = await getTasks(token, listId);
    const task = tasks.find(t => (t._id || t.id) === taskId);

    if (!task) {
      showToast("No se encontró la tarea en la lista", "error");
      window.location.href = '/dashboard/';
      return;
    }

    // fill the form
    document.getElementById('task-title').value = task.title || '';
    document.getElementById('task-desc').value = task.description || '';

    if (task.dueDate) {
      const d = new Date(task.dueDate);
      document.getElementById('task-date').value = d.toISOString().split('T')[0];
      document.getElementById('task-time').value = d.toISOString().split('T')[1].substring(0, 5);
    }

    document.getElementById('task-status').value = task.status || 'unassigned';
  } catch (err) {
    console.error("Error cargando tarea:", err);
    showToast("Error cargando tarea", "error");
    window.location.href = '/dashboard/';
  }
}

/**
 * Handle edit form submission: builds update payload and calls API.
 * Shows toast and redirects on success.
 * @param {SubmitEvent} e
 */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();
  const dueDate = document.getElementById('task-date').value;
  const dueTime = document.getElementById('task-time').value;
  const status = document.getElementById('task-status').value;

  try {
    console.log("updateTask", taskId, {
      title, description,
      dueDate: (dueDate && dueTime) ? `${dueDate}T${dueTime}` : null,
      status
    });

    await updateTask(token, taskId, {
      title,
      description,
      dueDate: (dueDate && dueTime) ? `${dueDate}T${dueTime}` : null,
      status
    });

    showToast("Tarea actualizada con éxito", "success");

    localStorage.removeItem('editTaskId');

    setTimeout(() => {
      window.location.href = '/dashboard/';
    }, 1000);
  } catch (err) {
    console.error("Error actualizando tarea:", err);
    showToast("Error actualizando tarea", "error");
  }
});


window.addEventListener('DOMContentLoaded', loadTask);
