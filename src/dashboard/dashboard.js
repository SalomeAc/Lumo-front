const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    function toggleSidebar() {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('active');
    }

    menuToggle.addEventListener('click', toggleSidebar);
    backdrop.addEventListener('click', toggleSidebar);