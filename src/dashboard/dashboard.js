async function cargarTareas() {
  try {
    const resp = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error('Error al traer tareas');
    const tareas = await resp.json();

    const container = document.getElementById('tasks-container');
    container.innerHTML = ''; 

    tareas.forEach(task => {
      const article = document.createElement('article');
      article.classList.add('task');
      article.innerHTML = `
        <div class="left">
          <input type="checkbox" aria-label="Completar tarea">
        </div>
        <div class="body">
          <h3>${task.title}</h3>
          <p>${task.description}</p>
          <div class="meta">Creada: ${task.createdAt}</div>
        </div>
        <div class="task-actions">
          <div class="buttons">
            <a href="/edit-task.html?id=${task._id}" class="edit-btn">✏️</a>
            <button class="delete-btn" data-id="${task._id}">🗑️</button>
          </div>
          <div class="task-status ${task.status.toLowerCase()}">${task.status}</div>
        </div>`;
      container.appendChild(article);
    });

    // Aquí seleccionas todos los botones de borrar recién renderizados
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const taskId = e.currentTarget.dataset.id;
        const confirmed = window.confirm('¿Estás seguro de que quieres borrar esta tarea?');
        if (confirmed) {
          await borrarTarea(taskId);
          cargarTareas(); // Recargar lista después de borrar
        }
      });
    });

  } catch (err) {
    console.error(err);
  }
}

/**
 * Deletes a task by ID.
 *
 * @async
 * @param {string} taskId - The unique identifier of the task.
 * @returns {Promise<void>} Refreshes the task list after deletion.
 */
async function borrarTarea(taskId) {
  try {
    const resp = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!resp.ok) throw new Error('Error al borrar tarea');
    const data = await resp.json();
    console.log(data.message);
  } catch (err) {
    console.error(err);
    alert('No se pudo borrar la tarea');
  }
}

const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    function toggleSidebar() {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('active');
    }

    menuToggle.addEventListener('click', toggleSidebar);
    backdrop.addEventListener('click', toggleSidebar);