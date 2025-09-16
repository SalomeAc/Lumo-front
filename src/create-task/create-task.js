import { createTask, getTasks } from '../services/taskService.js';

const token = localStorage.getItem('token');
if (!token) {
  alert('No token found. Please login first.');
  window.location.href = '/login/';
}

// Obtiene listId de la URL (?listId=xxxx)
const params = new URLSearchParams(window.location.search);
const listId = params.get('listId') || localStorage.getItem('currentListId');

if (!listId) {
  alert('No se encontró la lista seleccionada.');
  window.location.href = '/dashboard/';
}


const taskForm = document.getElementById('taskForm');


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

    // 👇 después de crear, vuelve al dashboard
    window.location.href = '/dashboard/';
  } catch (err) {
    alert('Error creando tarea. Revisa consola.');
    console.error(err);
  }
});



/** Carga inicial/refresh de tareas */
async function loadTasks() {
  try {
    const tasks = await getTasks(token, listId);
  } catch (err) {
    console.error('Error cargando tareas:', err);
    if (taskList) taskList.innerHTML = '<li>Error cargando tareas (ver consola)</li>';
  }
}



// cargar al inicio
window.addEventListener('DOMContentLoaded', loadTasks);