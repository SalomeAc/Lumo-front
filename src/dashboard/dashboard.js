const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebarBackdrop');

function toggleSidebar() {
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('active');
    
    // Prevenir scroll del body cuando el sidebar está abierto
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleSidebar();
});

backdrop.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleSidebar();
});

// Cerrar sidebar al hacer clic fuera en móviles
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 640 && 
        sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        e.target !== menuToggle) {
        toggleSidebar();
    }
});

// Cerrar sidebar al cambiar tamaño de ventana si se hace más grande
window.addEventListener('resize', function() {
    if (window.innerWidth > 640) {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
});