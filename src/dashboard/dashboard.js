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

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Yzg5ZWZjOTAxMDc0YTEwMTA0MWFiNyIsImVtYWlsIjoic2Fsb21lQHRlc3QuY29tIiwiaWF0IjoxNzU3OTc4OTMyLCJleHAiOjE3NTc5ODI1MzJ9.SGg9ePKLsTSDn8bswV4Vpc4golM4NdKXX6V6bc7gl2s';

// Referencia al contenedor UL
const listsContainer = document.getElementById('lists-container');

// Función para renderizar listas
function renderLists(lists) {
  listsContainer.innerHTML = ''; // Limpiar primero

  lists.forEach(list => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="#/" data-list-id="${list.id}">
        <span class="list-name">${list.title}</span>
      </a>
    `;
    listsContainer.appendChild(li);
  });
}

// Al cargar documento
document.addEventListener('DOMContentLoaded', async () => {
  const lists = await getUserLists(token);
  renderLists(lists);
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