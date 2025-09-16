import { updateTask, getTasks } from '../services/taskService.js';

const token = localStorage.getItem('token');
if (!token) {
  alert('No token found. Please login first.');
  window.location.href = '/login/';
}

const params = new URLSearchParams(window.location.search);
const taskId = params.get('taskId');
if (!taskId) {
  alert('No se encontró la tarea a editar.');
  window.location.href = '/dashboard/';
}

const listId = localStorage.getItem('currentListId');
if (!listId) {
  alert('No se encontró la lista asociada.');
  window.location.href = '/dashboard/';
}

const form = document.getElementById('EditTaskForm');

// función de toast
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

// cargar tarea desde la lista actual
async function loadTask() {
  try {
    const tasks = await getTasks(token, listId);
    const task = tasks.find(t => (t._id || t.id) === taskId);

    if (!task) {
      showToast("No se encontró la tarea en la lista", "error");
      window.location.href = '/dashboard/';
      return;
    }

    // rellenar el formulario
    document.getElementById('task-title').value = task.title || '';
    document.getElementById('task-desc').value = task.description || '';

    if (task.dueDate) {
      const d = new Date(task.dueDate);
      document.getElementById('task-date').value = d.toISOString().split('T')[0];
      document.getElementById('task-time').value = d.toISOString().split('T')[1].substring(0, 5);
    }

    document.getElementById('task-status').value = task.status || 'Unassigned';
  } catch (err) {
    console.error("Error cargando tarea:", err);
    showToast("Error cargando tarea", "error");
    window.location.href = '/dashboard/';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();
  const dueDate = document.getElementById('task-date').value;
  const dueTime = document.getElementById('task-time').value;
  const status = document.getElementById('task-status').value;

  try {
    await updateTask(token, taskId, {
      title,
      description,
      dueDate: (dueDate && dueTime) ? `${dueDate}T${dueTime}` : null,
      status
    });

    showToast("Tarea actualizada con éxito", "success");
    setTimeout(() => {
      window.location.href = '/dashboard/';
    }, 1000);
  } catch (err) {
    console.error("Error actualizando tarea:", err);
    showToast("Error actualizando tarea", "error");
  }
});

window.addEventListener('DOMContentLoaded', loadTask);



// función toast
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
  setTimeout(() => toast.remove(), 3000);
}

// guardar cambios
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();
  const dueDate = document.getElementById('task-date').value;
  const dueTime = document.getElementById('task-time').value;
  const status = document.getElementById('task-status').value;

  try {
    await updateTask(token, taskId, {
      title,
      description,
      dueDate: dueDate && dueTime ? `${dueDate}T${dueTime}` : null,
      status
    });

    showToast("Tarea actualizada", "success");

    // limpiar el taskId para evitar inconsistencias
    localStorage.removeItem('editTaskId');

    window.location.href = '/dashboard/';
  } catch (err) {
    console.error(err);
    showToast("Error actualizando tarea", "error");
  }
});
