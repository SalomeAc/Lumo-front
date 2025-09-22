import { getUserLists, deleteList as apiDeleteList } from '../services/listService.js';
import { getTasks as getTasksByList, deleteTask, getKanbanTasks } from '../services/taskService.js';
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
const listsToggle = document.getElementById('lists-toggle');
const kanbanStatuses = document.getElementById('kanban-statuses');
const createTaskBtn = document.getElementById('new-task-btn');


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
      <div class="list-actions">
        <button class="list-menu-btn" aria-haspopup="true" aria-expanded="false" aria-label="Abrir menú">⋯</button>
        <div class="list-menu" role="menu">
          <button class="list-menu-item delete" role="menuitem" data-list-id="${id}">Borrar</button>
        </div>
      </div>
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
    updateCreateTaskBtnVisibility();
  }
}

async function loadKanbanByStatus(status) {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const { ongoingTasks, unassignedTasks, doneTasks } = await getKanbanTasks(token);

    
    let tasks = [];
    if (status === 'unassigned') tasks = unassignedTasks;
    if (status === 'ongoing') tasks = ongoingTasks;
    if (status === 'done') tasks = doneTasks;

    renderTasks(tasks);

    let circleClass = '';
    switch (status) {
      case 'unassigned': circleClass = 'status-dot todo'; break;
      case 'ongoing': circleClass = 'status-dot doing'; break;
      case 'done': circleClass = 'status-dot done'; break;
    }

    if (currentListTitle) {
      // clean text
      const label =
        status === 'unassigned'
          ? 'Por hacer'
          : status === 'ongoing'
            ? 'Haciendo'
            : 'Completadas';
      currentListTitle.innerHTML = `<span class="${circleClass}"></span> ${label}`;
    }


    // Unmark any selected list in the sidebar
    if (listsContainer) {
      listsContainer.querySelectorAll('.list-link').forEach(a => {
        a.classList.remove('active');
        if (a.parentElement) a.parentElement.classList.remove('active');
      });
    }

    // Clear current list selection
    localStorage.removeItem('currentListId');
    localStorage.removeItem('currentListTitle');
    updateCreateTaskBtnVisibility();
  } catch (err) {
    console.error('Error en loadKanbanByStatus:', err);
    if (tasksContainer) tasksContainer.innerHTML = '<p>Error cargando tareas.</p>';
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
    const listIdForTaskRaw = (task && typeof task.list === 'object')
      ? (task.list._id || task.list.id || '')
      : (task.list || task.listId || task.list_id || '');
    const listIdForTask = listIdForTaskRaw || localStorage.getItem('currentListId') || '';

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
      <div class="left"></div>
      <div class="body">
        <h3>${title}</h3>
        <p>${desc}</p>
        <div class="meta">Fecha: ${due}</div>
      </div>
      <div class="task-actions">
        <div class="buttons">
          <a href="/edit-task/" class="edit-btn" data-task-id="${task._id || task.id}" data-list-id="${listIdForTask}">✏️</a>
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
      const listId = btn.dataset.listId;
      localStorage.setItem('editTaskId', taskId);
      if (listId) {
        localStorage.setItem('currentListId', listId);
      }
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
    // Close any open menus if clicking outside of actions
    const insideActions = e.target.closest('.list-actions');
    if (!insideActions) {
      listsContainer.querySelectorAll('.list-actions.open').forEach(act => {
        act.classList.remove('open');
        const btn = act.querySelector('.list-menu-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    // Open/close menu
    const menuBtn = e.target.closest('.list-menu-btn');
    if (menuBtn) {
      e.preventDefault();
      const actions = menuBtn.closest('.list-actions');
      if (!actions) return;
      // close others
      listsContainer.querySelectorAll('.list-actions.open').forEach(act => {
        if (act !== actions) {
          act.classList.remove('open');
          const b = act.querySelector('.list-menu-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
      const isOpen = actions.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      return;
    }

    // Delete from menu item
    const delItem = e.target.closest('.list-menu-item.delete');
    if (delItem) {
      e.preventDefault();
      const listId = delItem.dataset.listId;
      if (!listId) return;
      if (!confirm('¿Seguro que deseas eliminar esta lista?\nSe eliminarán también sus tareas.')) return;
      const token = localStorage.getItem('token');
      if (!token) return alert('Sesión inválida. Inicia sesión.');
      (async () => {
        try {
          await apiDeleteList(token, listId);
          showToast('Lista eliminada', 'success');
          // If deleted current, clear
          const current = localStorage.getItem('currentListId');
          if (current === listId) {
            localStorage.removeItem('currentListId');
            localStorage.removeItem('currentListTitle');
            if (currentListTitle) currentListTitle.textContent = 'Selecciona una lista';
            clearChildren(tasksContainer);
          }
          // Refresh lists and select first if any
          const refreshed = await getUserLists(token);
          renderLists(refreshed);
          if (refreshed && refreshed.length) {
            const first = refreshed[0];
            await selectList(first._id || first.id, first.title || first.name || 'Sin título', { loadTasks: true });
          } else {
            if (currentListTitle) currentListTitle.textContent = 'No hay listas';
            if (tasksContainer) clearChildren(tasksContainer);
          }
        } catch (err) {
          console.error('Error eliminando lista:', err);
          showToast('Error eliminando lista', 'error');
        }
      })();
      return;
    }

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
  
  if (listsToggle && listsContainer) {
    listsToggle.addEventListener('click', () => {
      const isOpen = listsContainer.classList.toggle('open');
      listsToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (kanbanStatuses) {
    kanbanStatuses.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', async (e) => {
        e.preventDefault();
        const status = a.dataset.status; // unassigned / ongoing / done
        await loadKanbanByStatus(status);
      });
    });
  }

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
      updateCreateTaskBtnVisibility();
    } else {
      if (currentListTitle) currentListTitle.textContent = 'No hay listas';
      if (tasksContainer) tasksContainer.innerHTML = '<p>No hay listas para mostrar tareas.</p>';
    }

  } catch (err) {
    console.error('Error en init dashboard:', err);
  }
  updateCreateTaskBtnVisibility();

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
      const listId = editBtn.dataset.listId;
      localStorage.setItem('editTaskId', taskId);
      if (listId) {
        localStorage.setItem('currentListId', listId);
      }
      window.location.href = '/edit-task/';
    }
  });
}

function updateCreateTaskBtnVisibility() {
  const listId = localStorage.getItem('currentListId');
  if (createTaskBtn) {
    // If there is a listId → we are in a normal list → show
    // If there is NO listId → we are in Kanban → hide
    createTaskBtn.style.display = listId ? 'block' : 'none';
  }
}
