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