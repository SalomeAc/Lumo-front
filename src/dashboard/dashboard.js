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
const kanbanToggleBtn = document.getElementById('kanban-toggle-btn');
const kanbanBoard = document.getElementById('kanban-board');
const kanbanCols = {
  unassigned: document.getElementById('kanban-col-unassigned'),
  ongoing: document.getElementById('kanban-col-ongoing'),
  done: document.getElementById('kanban-col-done')
};

/**
 * Switch to the standard list/status task view (hide Kanban board).
 * Ensures task container is visible, Kanban board hidden and create task button visibility updated.
 */
function showListView() {
  if (kanbanBoard) {
    kanbanBoard.setAttribute('hidden', '');
    kanbanBoard.style.display = 'none';
  }
  if (tasksContainer) {
    tasksContainer.removeAttribute('hidden');
    tasksContainer.style.display = '';
  }
  if (kanbanToggleBtn) kanbanToggleBtn.textContent = 'Vista Kanban';
  if (listsContainer) listsContainer.style.display = '';
  updateCreateTaskBtnVisibility();
}

/**
 * Switch to the full Kanban board view (hide the linear task list).
 * Hides list task container, shows Kanban board and renders its content.
 */
function showKanbanView() {
  if (tasksContainer) {
    tasksContainer.setAttribute('hidden', '');
    tasksContainer.style.display = 'none';
  }
  if (kanbanBoard) {
    kanbanBoard.removeAttribute('hidden');
    kanbanBoard.style.display = '';
  }
  if (kanbanToggleBtn) kanbanToggleBtn.textContent = 'Ver Lista';
  if (createTaskBtn) createTaskBtn.style.display = 'none';
  if (currentListTitle) currentListTitle.textContent = 'Kanban';
  renderKanbanBoard();
}


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
 * Render all user lists into the sidebar. Falls back to an empty-state message if none.
 * @param {Array<{_id?:string,id?:string,title?:string,name?:string}>} lists - Raw list objects returned by API.
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
 * Handle list selection: persist IDs in localStorage, update active UI state and optionally load tasks.
 * Also forces exit from Kanban mode (always shows list view).
 * @param {string} listId - The list identifier.
 * @param {string} listTitle - The human readable title.
 * @param {{loadTasks?: boolean}} [options] - Optional flags (default: load tasks immediately).
 */
async function selectList(listId, listTitle, { loadTasks = true } = {}) {
  if (!listId) return;

  showListView();
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

/**
 * Load tasks filtered by a Kanban status (unassigned, ongoing, done) but display them in list view style.
 * Clears any selected list context and updates the header with the status indicator.
 * @param {"unassigned"|"ongoing"|"done"} status - Target status bucket.
 */
async function loadKanbanByStatus(status) {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    showListView();
    const data = await getKanbanTasks(token);
    const ongoingTasks = data.ongoingTasks || data.ongoing || [];
    const unassignedTasks = data.unassignedTasks || data.unassigned || [];
    const doneTasks = data.doneTasks || data.done || [];

    
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
 * Render a collection of tasks in the vertical list layout.
 * If Kanban is visible it is forcibly hidden to maintain exclusive view.
 * @param {Array<{_id?:string,id?:string,title?:string,description?:string,status?:string,dueDate?:string,createdAt?:string,list?:any,listId?:string,list_id?:string}>} tasks - Task objects for the current context.
 */
function renderTasks(tasks) {
  if (!tasksContainer) {
    tasksContainer.innerHTML = '';
    console.warn('No tasksContainer en DOM');
    return;
  }

  if (kanbanBoard && !kanbanBoard.hasAttribute('hidden')) {
    showListView();
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
 * Attach delegated handlers for list item interactions (selection, contextual menu open/close, deletion).
 * Uses event delegation to support dynamic list refreshes.
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

    const menuBtn = e.target.closest('.list-menu-btn');
    if (menuBtn) {
      e.preventDefault();
      const actions = menuBtn.closest('.list-actions');
      if (!actions) return;
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
 * Wire click events for create-list and new-task buttons, performing navigation.
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
 * Application bootstrap: validate token, fetch user + lists, restore previous selection or select first.
 * Also wires all interaction handlers (lists, tasks, kanban, buttons).
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
        const status = a.dataset.status; // board | unassigned | ongoing | done
        if (status === 'board') {
          localStorage.removeItem('currentListId');
          localStorage.removeItem('currentListTitle');
          showKanbanView();
        } else {
          showListView();
          await loadKanbanByStatus(status);
        }
      });
    });
  }

  try {
    setupListClickDelegation();
    setupButtons();
    setupTaskActionsDelegation();
  setupKanbanInteractions();

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

document.addEventListener('DOMContentLoaded', () => {
  const edited = localStorage.getItem('taskEdited');
  if (edited) {
    showToast(edited === 'success' ? 'Tarea actualizada con éxito' : 'Error actualizando tarea', edited === 'success' ? 'success' : 'error');
    localStorage.removeItem('taskEdited');
  }
});

/**
 * Show a transient toast notification.
 * @param {string} message - Text to display.
 * @param {"info"|"success"|"error"} [type="info"] - Visual style variant.
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
 * Delegate task list actions (edit / delete) within the linear tasks container.
 * Safely ignores interactions if token is missing.
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

/**
 * Toggle visibility of the "create task" button depending on whether a list context is active.
 */
function updateCreateTaskBtnVisibility() {
  const listId = localStorage.getItem('currentListId');
  if (createTaskBtn) {

    createTaskBtn.style.display = listId ? 'block' : 'none';
  }
}

/* ----------------- Kanban full board ----------------- */
/**
 * Remove all cards from each Kanban column.
 */
function clearKanban() {
  Object.values(kanbanCols).forEach(col => { if (col) clearChildren(col); });
}

/**
 * Build a Kanban card DOM element for a given task.
 * @param {{_id?:string,id?:string,title?:string,description?:string,dueDate?:string,createdAt?:string,list?:any}} task - Task object.
 * @returns {HTMLDivElement} The constructed card element.
 */
function buildKanbanCard(task) {
  const title = safeText(task.title || 'Sin título');
  const desc = safeText(task.description || '');
  const due = safeText(task.dueDate || task.createdAt || '');
  const taskId = task._id || task.id;
  const listId = (task.list && (task.list._id || task.list.id)) || task.list || task.listId || task.list_id || localStorage.getItem('currentListId') || '';
  const card = document.createElement('div');
  card.className = 'kanban-card';
  card.innerHTML = `
    <h4>${title}</h4>
    ${desc ? `<p>${desc}</p>` : ''}
    <div class="meta">${due ? `Fecha: ${due}` : ''}</div>
    <div class="card-actions">
      <a href="/edit-task/" class="edit" data-task-id="${taskId}" data-list-id="${listId}" aria-label="Editar tarea" title="Editar">
        ✏️
      </a>
      <button class="delete delete-card" data-task-id="${taskId}" aria-label="Borrar tarea" title="Borrar">
        🗑️
      </button>
    </div>
  `;
  return card;
}

/**
 * Fetch grouped tasks (by status) and render them into the Kanban columns.
 * Clears existing column content before inserting new cards.
 */
async function renderKanbanBoard() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    clearKanban();
    const { ongoingTasks = [], unassignedTasks = [], doneTasks = [] } = await getKanbanTasks(token);
    unassignedTasks.forEach(t => { if (kanbanCols.unassigned) kanbanCols.unassigned.appendChild(buildKanbanCard(t)); });
    ongoingTasks.forEach(t => { if (kanbanCols.ongoing) kanbanCols.ongoing.appendChild(buildKanbanCard(t)); });
    doneTasks.forEach(t => { if (kanbanCols.done) kanbanCols.done.appendChild(buildKanbanCard(t)); });
  } catch (err) {
    console.error('Error renderKanbanBoard:', err);
  }
}

/**
 * Legacy toggle function to switch between list and Kanban views when using the toggle button.
 * Maintained for backward compatibility if the button is present.
 */
function toggleKanbanView() {
  if (!kanbanBoard) return;
  const showingKanban = !kanbanBoard.hasAttribute('hidden');
  if (showingKanban) {
    kanbanBoard.setAttribute('hidden', '');
    tasksContainer?.removeAttribute('hidden');
    kanbanToggleBtn.textContent = 'Vista Kanban';
    if (listsContainer) listsContainer.style.display = '';
    updateCreateTaskBtnVisibility();
  } else {
    tasksContainer?.setAttribute('hidden', '');
    kanbanBoard.removeAttribute('hidden');
    kanbanToggleBtn.textContent = 'Ver Lista';

    if (createTaskBtn) createTaskBtn.style.display = 'none';
    if (currentListTitle) currentListTitle.textContent = 'Kanban';
    renderKanbanBoard();
  }
}

/**
 * Attach interaction handlers for Kanban board (edit/delete card) and optional toggle button.
 */
function setupKanbanInteractions() {
  if (kanbanToggleBtn) {
    kanbanToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleKanbanView();
    });
  }
  if (kanbanBoard) {
    kanbanBoard.addEventListener('click', async (e) => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const editLink = e.target.closest('a.edit');
      if (editLink) {
        e.preventDefault();
        const taskId = editLink.dataset.taskId;
        const listId = editLink.dataset.listId;
        if (taskId) localStorage.setItem('editTaskId', taskId);
        if (listId) localStorage.setItem('currentListId', listId);
        window.location.href = '/edit-task/';
        return;
      }
      const delBtn = e.target.closest('button.delete-card');
      if (delBtn) {
        e.preventDefault();
        const taskId = delBtn.dataset.taskId;
        if (!taskId) return;
        if (!confirm('¿Eliminar esta tarea?')) return;
        try {
          await deleteTask(token, taskId);
          showToast('Tarea eliminada', 'success');
          renderKanbanBoard();
        } catch (err) {
          console.error('Error eliminando tarea Kanban:', err);
          showToast('Error eliminando', 'error');
        }
      }
    });
  }
}
