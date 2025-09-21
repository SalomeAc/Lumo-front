import { getUserLists } from '../services/listService.js';
import { getTasks as getTasksByList, deleteTask } from '../services/taskService.js';
import { getUserProfile } from '../services/userServices.js'; 

/* --------- Sidebar toggle --------- */
/**
 * Toggle button element for opening/closing the sidebar.
 * @type {HTMLElement|null}
 */
const menuToggle = document.getElementById('menuToggle');
/**
 * Sidebar container element.
 * @type {HTMLElement|null}
 */
const sidebar = document.getElementById('sidebar');
/**
 * Backdrop overlay element behind the sidebar.
 * @type {HTMLElement|null}
 */
const backdrop = document.getElementById('sidebarBackdrop');

/**
 * Toggles sidebar visibility and page scrollability.
 * Adds/removes CSS classes and locks body scroll when open.
 */
function toggleSidebar() {
  if (!sidebar || !backdrop) return;
  sidebar.classList.toggle('open');
  backdrop.classList.toggle('active');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

if (menuToggle) menuToggle.addEventListener('click', e => { e.stopPropagation(); toggleSidebar(); });
if (backdrop) backdrop.addEventListener('click', e => { e.stopPropagation(); toggleSidebar(); });
document.addEventListener('click', function (e) {
  if (window.innerWidth <= 640 && sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggle) {
    toggleSidebar();
  }
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 640 && sidebar) {
    sidebar.classList.remove('open');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
});
/* ------------------------------------------------------- */

/** @type {HTMLElement|null} */
const listsContainer = document.getElementById('lists-container');
/** @type {HTMLElement|null} */
const currentListTitle = document.getElementById('current-list-title');
/** @type {HTMLElement|null} */
const tasksContainer = document.getElementById('tasks-container');
/** @type {HTMLButtonElement|null} */
const createListBtn = document.getElementById('create-list-btn');
/** @type {HTMLButtonElement|null} */
const newTaskBtn = document.getElementById('new-task-btn');
const userInfo = document.getElementById('user-info');


/* ----------------- Helpers ----------------- */
/**
 * Safely convert a value to string, avoiding 'null'/'undefined'.
 * @param {unknown} v
 * @returns {string}
 */
function safeText(v) { return v === undefined || v === null ? '' : String(v); }

/**
 * Remove all child nodes from an element.
 * @param {HTMLElement|null} el
 * @returns {void}
 */
function clearChildren(el) {
  if (!el) return;
  while (el.firstChild) el.removeChild(el.firstChild);
}

/* ----------------- Render lists ----------------- */
/**
 * Render the list of user lists into the sidebar container.
 * @param {Array<{_id?:string,id?:string,title?:string,name?:string}>} lists
 */
function renderLists(lists) {
  if (!listsContainer) {
    console.warn('No listsContainer en DOM');
    return;
  }
  console.log('renderLists -> listas recibidas:', lists);
  clearChildren(listsContainer);

  if (!Array.isArray(lists) || lists.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="list-name" >No hay listas</span>`;
    listsContainer.appendChild(li);
    return;
  }

  const fragment = document.createDocumentFragment();
  lists.forEach(list => {
    const title = safeText(list.title || list.name || 'Sin título');
    const id = list._id || list.id || '';
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="#" class="list-link" data-list-id="${id}" data-list-title="${title}">
        <span class="list-name">${title}</span>
      </a>
    `;
    fragment.appendChild(li);
  });
  listsContainer.appendChild(fragment);
}

/**
 * Select a list, persist selection, update header and active styles, and optionally load tasks.
 * @param {string} listId
 * @param {string} listTitle
 * @param {{loadTasks?: boolean}} [options]
 */
async function selectList(listId, listTitle, { loadTasks = true } = {}) {
  if (!listId) return;
  localStorage.setItem('currentListId', listId);
  localStorage.setItem('currentListTitle', listTitle || '');

  if (currentListTitle) currentListTitle.textContent = listTitle || 'Lista seleccionada';

  if (listsContainer) {
    listsContainer.querySelectorAll('.list-link').forEach(a => {
      if (a.dataset.listId === listId) {
        a.classList.add('active');
        if (a.parentElement) a.parentElement.classList.add('active');
      } else {
        a.classList.remove('active');
        if (a.parentElement) a.parentElement.classList.remove('active');
      }
    });
  }

  if (loadTasks) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token para cargar tareas');
      return;
    }
    try {
      const tasks = await getTasksByList(token, listId);
      renderTasks(tasks);
    } catch (err) {
      console.error('Error al cargar tareas de la lista:', err);
      if (tasksContainer) tasksContainer.innerHTML = '<p>Error cargando tareas.</p>';
    }
  }
}

/* ----------------- Render tasks ----------------- */
/**
 * Render tasks for the currently selected list.
 * @param {Array<{_id?:string,id?:string,title?:string,description?:string,status?:string,dueDate?:string,createdAt?:string}>} tasks
 */
function renderTasks(tasks) {
  if (!tasksContainer) {
    tasksContainer.innerHTML = '';
    console.warn('No tasksContainer en DOM');
    return;
  }

  clearChildren(tasksContainer);
  if (!Array.isArray(tasks) || tasks.length === 0) {
    tasksContainer.innerHTML = '<p style="color: gray; text-align: center;">¡Crea una tarea! </p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  tasks.forEach(task => {
    const title = safeText(task.title || 'Sin título');
    const desc = safeText(task.description || '');
    const status = safeText(task.status || '');
    const due = safeText(task.dueDate || task.createdAt || '');

    const article = document.createElement('article');
    article.classList.add('task');
    function mapStatus(status) {
      switch (status.toLowerCase()) {
        case 'unassigned':
          return { label: 'Por hacer', css: 'todo' };
        case 'ongoing':
          return { label: 'Haciendo', css: 'doing' };
        case 'done':
          return { label: 'Completada', css: 'done' };
        default:
          return { label: status, css: '' }; 

      }
    }
    
    const { label, css } = mapStatus(status);

    article.innerHTML = `
      <div class="left"><input type="checkbox" aria-label="Completar tarea"></div>
      <div class="body">
        <h3>${title}</h3>
        <p>${desc}</p>
        <div class="meta">Fecha: ${due}</div>
      </div>
      <div class="task-actions">
        <div class="buttons">
          <a href="/edit-task/" class="edit-btn" data-task-id="${task._id || task.id}">✏️</a>
          <button class="delete-btn" data-task-id="${task._id || task.id}">🗑️</button>
        </div>
        <div class="task-status ${css}">${label}</div>
      </div>
    `;

    fragment.appendChild(article);
  });
  tasksContainer.appendChild(fragment);
  tasksContainer.querySelectorAll('.edit-btn').forEach(btn => {
    /** On edit click, store task id and navigate to edit page. */
    btn.addEventListener('click', (e) => {
      const taskId = btn.dataset.taskId;
      localStorage.setItem('editTaskId', taskId); 
      window.location.href = '/edit-task/';       
    });
  });

}

/* ----------------- Delegated events: list click ----------------- */
/**
 * Setup delegated click handling on the lists container to select lists.
 */
function setupListClickDelegation() {
  if (!listsContainer) return;

  listsContainer.addEventListener('click', (e) => {
    const a = e.target.closest('.list-link');
    if (!a) return;
    e.preventDefault();
    const id = a.dataset.listId;
    const title = a.dataset.listTitle || a.textContent.trim();
    selectList(id, title);
  });
}

/* ----------------- Setup buttons create/new task ----------------- */
/**
 * Attach handlers for creating lists and starting new task creation.
 */
function setupButtons() {
  if (createListBtn) {
    createListBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/create-list/';
    });
  }
  if (newTaskBtn) {
    newTaskBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const listId = localStorage.getItem('currentListId');
      if (!listId) return alert('Selecciona primero una lista para crear tarea.');
      window.location.href = `/create-task/?listId=${listId}`;
    });
  }
}

/**
 * Wire events, validate token, fetch and render lists, restore selection.
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    setupListClickDelegation();
    setupButtons();
    setupTaskActionsDelegation();

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token en localStorage. Redirigiendo a login');

      return;
    }

    try {
      const user = await getUserProfile({ token });

      if (userInfo) {
        const nameEls = userInfo.querySelectorAll('.name');
        const lastEls = userInfo.querySelectorAll('.last-time');

        if (nameEls[1]) {
          nameEls[1].textContent = `${user.firstName} ${user.lastName}`;
        }

        if (lastEls[1]) {
          const now = new Date();
          const formatted = now.toLocaleDateString("es-ES", {
            day: "2-digit", month: "2-digit", year: "2-digit",
            hour: "2-digit", minute: "2-digit"
          });
          lastEls[1].textContent = formatted;
        }

      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
      if (userInfo) {
        const nameEls = userInfo.querySelectorAll('.name');
        if (nameEls[1]) nameEls[1].textContent = "Usuario";
      }
    }

    let lists = [];
    try {
      lists = await getUserLists(token);
    } catch (err) {
      console.error('Error getUserLists:', err);
      if (listsContainer) listsContainer.innerHTML = '<li>Error cargando listas</li>';
      return;
    }

    renderLists(lists);

    // If there is a saved currentListId, restore it; otherwise select the first available list
    const savedListId = localStorage.getItem('currentListId');
    const savedListTitle = localStorage.getItem('currentListTitle');

    if (savedListId) {
      const exists = lists.find(l => (l._id || l.id) === savedListId);
      if (exists) {
        await selectList(savedListId, savedListTitle || (exists.title || exists.name), { loadTasks: true });
        return;
      } else {
        localStorage.removeItem('currentListId');
        localStorage.removeItem('currentListTitle');
      }
    }

    if (Array.isArray(lists) && lists.length > 0) {
      const first = lists[0];
      const id = first._id || first.id;
      const title = first.title || first.name || 'Sin título';
      await selectList(id, title, { loadTasks: true });
    } else {
      if (currentListTitle) currentListTitle.textContent = 'No hay listas';
      if (tasksContainer) tasksContainer.innerHTML = '<p>No hay listas para mostrar tareas.</p>';
    }

  } catch (err) {
    console.error('Error en init dashboard:', err);
  }


});

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


/* ----------------- Delegated events: task actions ----------------- */
/**
 * Setup delegated task action handlers (delete/edit) on the tasks container.
 */
function setupTaskActionsDelegation() {
  if (!tasksContainer) return;

  tasksContainer.addEventListener('click', async (e) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // DELETE
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      e.preventDefault();
      const taskId = deleteBtn.dataset.taskId;
      if (!taskId) return;

      if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return;

      try {
        await deleteTask(token, taskId);
        deleteBtn.closest('article.task').remove();
        showToast("Tarea eliminada ", "success");
      } catch (err) {
        showToast("Error eliminando tarea.", "error");
        console.error(err);
      }
      return;
    }

    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      e.preventDefault();
      const taskId = editBtn.dataset.taskId;
      if (!taskId) return;

      window.location.href = `/edit-task/?taskId=${taskId}`;
    }
  });
}