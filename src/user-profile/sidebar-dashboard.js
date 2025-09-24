import { getUserLists } from '../services/listService.js';
import { getTasks as getTasksByList, deleteTask, getKanbanTasks } from '../services/taskService.js';
import { getUserProfile } from '../services/userServices.js';

/* --------- Sidebar toggle --------- */
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebarBackdrop');

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

/* --------- Load user data --------- */
const userInfo = document.getElementById('user-info');
const listsContainer = document.getElementById('lists-container');
const listsToggle = document.getElementById('lists-toggle');
const kanbanStatuses = document.getElementById('kanban-statuses');
const createListBtn = document.getElementById('create-list-btn');

/* ----------------- Helpers ----------------- */
function safeText(v) { return v === undefined || v === null ? '' : String(v); }

function clearChildren(el) {
  if (!el) return;
  while (el.firstChild) el.removeChild(el.firstChild);
}

/* ----------------- Render lists ----------------- */
function renderLists(lists) {
  if (!listsContainer) {
    console.warn('No listsContainer en DOM');
    return;
  }
  console.log('renderLists -> listas recibidas:', lists);
  clearChildren(listsContainer);

  if (!Array.isArray(lists) || lists.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="list-name">No hay listas</span>`;
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

/* ----------------- Setup list click delegation ----------------- */
function setupListClickDelegation() {
  if (!listsContainer) return;

  listsContainer.addEventListener('click', (e) => {
    const a = e.target.closest('.list-link');
    if (!a) return;
    e.preventDefault();
    const id = a.dataset.listId;
    const title = a.dataset.listTitle || a.textContent.trim();
    
    // Save selection and redirect to dashboard
    localStorage.setItem('currentListId', id);
    localStorage.setItem('currentListTitle', title);
    window.location.href = '/dashboard/';
  });
}

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
        // Redirect to dashboard for kanban functionality
        window.location.href = '/dashboard/';
      });
    });
  }

  if (createListBtn) {
    createListBtn.addEventListener('click', () => {
      window.location.href = '/create-list/';
    });
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token en localStorage. Redirigiendo a login');
      window.location.href = '/login/';
      return;
    }

    try {
      const user = await getUserProfile({ token });

      if (userInfo) {
        const nameEls = userInfo.querySelectorAll('.name');
        const lastEls = userInfo.querySelectorAll('.last-time');

        if (nameEls[0]) {
          nameEls[0].textContent = 'Bienvenido/a,';
        }

        if (nameEls[1]) {
          nameEls[1].textContent = `${user.firstName} ${user.lastName}`;
        }

        if (lastEls[0]) {
          lastEls[0].textContent = 'Última actividad:';
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
        if (nameEls[0]) nameEls[0].textContent = 'Bienvenido/a,';
        if (nameEls[1]) nameEls[1].textContent = "Usuario";
      }
    }

    // Load user lists
    try {
      const lists = await getUserLists(token);
      renderLists(lists);
      setupListClickDelegation(); // Setup click handlers for lists
    } catch (err) {
      console.error("Error cargando listas:", err);
    }

  } catch (err) {
    console.error('Error en init sidebar:', err);
  }
});