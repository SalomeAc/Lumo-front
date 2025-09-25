// JavaScript para la página de Mapa del Sitio

document.addEventListener('DOMContentLoaded', function() {
    // Configurar la barra de navegación
    setupBarnav();
    
    // Configurar eventos para links protegidos
    setupProtectedLinks();
    
    // Configurar modal
    setupModal();
});

/**
 * Configura la barra de navegación con los botones apropiados
 */
function setupBarnav() {
    const btnDiv = document.getElementById("barnav-auth-btn");
    const btnContainer = document.getElementById("barnav-auth-btn-container");
    
    if (btnDiv && btnContainer) {
        if (localStorage.getItem("token")) {
            // Botón Dashboard
            const dashboardBtn = document.createElement("a");
            dashboardBtn.href = "/dashboard/";
            dashboardBtn.textContent = "Dashboard";
            dashboardBtn.style.background = "#ffffff";
            dashboardBtn.style.border = "1px solid #222";
            dashboardBtn.style.color = "#222";
            dashboardBtn.style.fontWeight = "bold";
            dashboardBtn.style.padding = "8px 1.2rem";
            dashboardBtn.style.borderRadius = "4px";
            dashboardBtn.style.textDecoration = "none";
            dashboardBtn.style.marginRight = "0.5em";
            dashboardBtn.style.transition = "background 0.2s";
            dashboardBtn.onmouseover = () => (dashboardBtn.style.background = "#f0f0f0ff");
            dashboardBtn.onmouseout = () => (dashboardBtn.style.background = "#ffffff");
            btnContainer.insertBefore(dashboardBtn, btnDiv);

            // Botón Ver perfil
            const profileBtn = document.createElement("a");
            profileBtn.href = "/user-profile/";
            profileBtn.textContent = "Ver perfil";
            profileBtn.style.background = "#ffffff";
            profileBtn.style.border = "1px solid #222";
            profileBtn.style.color = "#222";
            profileBtn.style.fontWeight = "bold";
            profileBtn.style.padding = "8px 1.2rem";
            profileBtn.style.borderRadius = "4px";
            profileBtn.style.textDecoration = "none";
            profileBtn.style.marginRight = "0.5em";
            profileBtn.style.transition = "background 0.2s";
            profileBtn.onmouseover = () => (profileBtn.style.background = "#f0f0f0ff");
            profileBtn.onmouseout = () => (profileBtn.style.background = "#ffffff");
            btnContainer.insertBefore(profileBtn, btnDiv);

            btnDiv.innerHTML = '<a href="/logout/" role="button">Cerrar sesión</a>';
        } else {
            btnDiv.innerHTML = '<a href="/login/" role="button">Iniciar sesión</a>';
        }
    }
}

/**
 * Configura los event listeners para los links protegidos
 */
function setupProtectedLinks() {
    const protectedLinks = document.querySelectorAll('.protected-link[data-requires-auth="true"]');
    
    protectedLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Verificar si el usuario está autenticado
            if (!isUserAuthenticated()) {
                showAuthErrorModal();
                return false;
            }
            
            // Si está autenticado, permitir la navegación
            window.location.href = this.getAttribute('href');
        });
    });
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si está autenticado, false en caso contrario
 */
function isUserAuthenticated() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return false;
    }
    
    try {
        // Verificar si el token no ha expirado
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp < currentTime) {
            // Token expirado, removerlo
            localStorage.removeItem('token');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('token');
        return false;
    }
}

/**
 * Muestra el modal de error de autenticación
 */
function showAuthErrorModal() {
    const modal = document.getElementById('auth-error-modal');
    if (modal) {
        modal.style.display = 'block';
        
        // Animación de entrada
        setTimeout(() => {
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
            modal.querySelector('.modal-content').style.opacity = '1';
        }, 10);
    }
}

/**
 * Oculta el modal de error de autenticación
 */
function hideAuthErrorModal() {
    const modal = document.getElementById('auth-error-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.querySelector('.modal-content').style.transform = 'scale(0.7)';
        modal.querySelector('.modal-content').style.opacity = '0';
    }
}

/**
 * Configura los event listeners del modal
 */
function setupModal() {
    const modal = document.getElementById('auth-error-modal');
    const closeBtn = document.querySelector('.close-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const goToLoginBtn = document.getElementById('go-to-login');
    
    // Cerrar modal al hacer click en la X
    if (closeBtn) {
        closeBtn.addEventListener('click', hideAuthErrorModal);
    }
    
    // Cerrar modal al hacer click en el botón Cerrar
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideAuthErrorModal);
    }
    
    // Ir a login al hacer click en el botón correspondiente
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', function() {
            hideAuthErrorModal();
            window.location.href = '/login/';
        });
    }
    
    // Cerrar modal al hacer click fuera de él
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideAuthErrorModal();
            }
        });
    }
    
    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideAuthErrorModal();
        }
    });
}

/**
 * Función para actualizar el estado de autenticación de los cards
 */
function updateAuthStatus() {
    const protectedCards = document.querySelectorAll('.sitemap-card.protected');
    const isAuthenticated = isUserAuthenticated();
    
    protectedCards.forEach(card => {
        const link = card.querySelector('.protected-link');
        if (link) {
            if (isAuthenticated) {
                link.classList.remove('protected-link');
                link.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                link.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                
                // Cambiar el ícono del candado por un check
                const lockIcon = card.querySelector('::before');
                if (lockIcon) {
                    card.style.setProperty('--before-content', '"✓"');
                }
            }
        }
    });
}

// Actualizar el estado de autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateAuthStatus, 500); // Pequeño delay para asegurar que todo esté cargado
});

// Escuchar cambios en el localStorage para actualizar el estado en tiempo real
window.addEventListener('storage', function(e) {
    if (e.key === 'token') {
        updateAuthStatus();
    }
});