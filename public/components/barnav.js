// barnav.js: Cambia el botón de login/logout según el token
const btnDiv = document.getElementById("barnav-auth-btn");
const btnContainer = document.getElementById("barnav-auth-btn-container");
if (btnDiv && btnContainer) {
  if (localStorage.getItem("token")) {
    // Botón Dashboard
    const dashboardBtn = document.createElement("a");
    dashboardBtn.href = "/dashboard/";
    dashboardBtn.textContent = "Dashboard";
    dashboardBtn.style.background = "#e0e0e0";
    dashboardBtn.style.color = "#222";
    dashboardBtn.style.fontWeight = "bold";
    dashboardBtn.style.padding = "10px 1.5rem";
    dashboardBtn.style.borderRadius = "4px";
    dashboardBtn.style.textDecoration = "none";
    dashboardBtn.style.marginRight = "0.5em";
    dashboardBtn.style.transition = "background 0.2s";
    dashboardBtn.onmouseover = () => (dashboardBtn.style.background = "#bdbdbd");
    dashboardBtn.onmouseout = () => (dashboardBtn.style.background = "#e0e0e0");
    btnContainer.insertBefore(dashboardBtn, btnDiv);

    // Botón Editar perfil
    const profileBtn = document.createElement("a");
    profileBtn.href = "/edit-profile/";
    profileBtn.textContent = "Ver  perfil";
    profileBtn.style.background = "#e0e0e0";
    profileBtn.style.color = "#222";
    profileBtn.style.fontWeight = "bold";
    profileBtn.style.padding = "10px 1.5rem";
    profileBtn.style.borderRadius = "4px";
    profileBtn.style.textDecoration = "none";
    profileBtn.style.marginRight = "0.5em";
    profileBtn.style.transition = "background 0.2s";
    profileBtn.onmouseover = () => (profileBtn.style.background = "#bdbdbd");
    profileBtn.onmouseout = () => (profileBtn.style.background = "#e0e0e0");
    btnContainer.insertBefore(profileBtn, btnDiv);

    btnDiv.innerHTML = '<a href="/logout/" role="button">Cerrar sesión</a>';
  } else {
    btnDiv.innerHTML = '<a href="/login/" role="button">Iniciar sesión</a>';
  }
}