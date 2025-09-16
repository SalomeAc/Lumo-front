/**
 * Element that toggles the sidebar menu.
 * @type {HTMLElement}
 */
const menuToggle = document.getElementById('menuToggle');

/**
 * Sidebar element.
 * @type {HTMLElement}
 */
const sidebar = document.getElementById('sidebar');

/**
 * Backdrop element for the sidebar.
 * @type {HTMLElement}
 */
const backdrop = document.getElementById('sidebarBackdrop');

/**
 * Toggles the sidebar and backdrop visibility.
 * Also prevents body scroll when sidebar is open.
 */
function toggleSidebar() {
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('active');
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

/**
 * Handles click event on menuToggle to open/close sidebar.
 * @param {MouseEvent} e
 */
menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleSidebar();
});

/**
 * Handles click event on backdrop to close sidebar.
 * @param {MouseEvent} e
 */
backdrop.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleSidebar();
});

/**
 * Closes sidebar when clicking outside of it on mobile devices.
 * @param {MouseEvent} e
 */
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 640 && 
        sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        e.target !== menuToggle) {
        toggleSidebar();
    }
});

/**
 * Closes sidebar when resizing window to desktop size.
 */
window.addEventListener('resize', function() {
    if (window.innerWidth > 640) {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
});

/*---------------------------------------------------*/

import { getUserLists } from '../../services/listService.js';


// Referencia al contenedor UL
const listsContainer = document.getElementById('lists-container');

function renderLists(lists) {
  console.log('Listas recibidas:', lists);
  listsContainer.innerHTML = ''; 
  lists.forEach(list => {
    const title = list.title || list.name || 'Sin título';
    const id = list._id || list.id;
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="#" class="list-link" data-list-id="${id}" data-list-title="${title}">
        <span class="list-name">${title}</span>
      </a>
    `;
    listsContainer.appendChild(li);
  });

  // Evento para cada lista
  document.querySelectorAll('.list-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedListId = link.dataset.listId;
      const selectedListTitle = link.dataset.listTitle;

      console.log('Click en lista:', selectedListId, selectedListTitle);

      localStorage.setItem('currentListId', selectedListId);
      localStorage.setItem('currentListTitle', selectedListTitle);

      if (currentListTitle) {
        currentListTitle.textContent = selectedListTitle;
      } else {
        console.warn('No se encontró currentListTitle en el DOM');
      }
    });
  });
}

// Botón + Nueva tarea
document.getElementById('new-task-btn').addEventListener('click', () => {
  const listId = localStorage.getItem('currentListId');
  if (!listId) {
    alert('Selecciona primero una lista para crear tarea.');
    return;
  }
  window.location.href = `/create-task/?listId=${listId}`;
});

// Al cargar documento
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        const lists = await getUserLists(token);
        renderLists(lists);
    }
});

const createListBtn = document.getElementById('create-list-btn');

if (createListBtn) {
  createListBtn.addEventListener('click', function(e) {
    // Prevent default to avoid form submit or unexpected behaviour
    e.preventDefault();
    // Redirect to the create-list page 
    window.location.href = '/create-list/';
    
  });
} else {
  console.warn('create-list-btn not found in DOM (dashboard.js)');
}

const currentListTitle = document.getElementById('current-list-title');

// Renderizar listas en sidebar


// Al cargar documento, si ya hay list seleccionada, mostrar su título
document.addEventListener('DOMContentLoaded', async () => {
  const lists = await getUserLists(token);
  renderLists(lists);

  // Si hay título guardado de sesión anterior
  const savedTitle = localStorage.getItem('currentListTitle');
  if (savedTitle) {
    currentListTitle.textContent = savedTitle;
  }
});

