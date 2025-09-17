import { getUserProfile, deleteUserProfile } from "../services/userServices.js";

/**
 * DOM elements for displaying user profile data.
 * @type {HTMLElement}
 */
const nombreUsuario = document.getElementById("nombreUsuario");
const edadUsuario = document.getElementById("edadUsuario");
const correoUsuario = document.getElementById("correoUsuario");

/**
 * Renders the user profile data into the DOM.
 * @param {Object} user
 */
function renderUserProfile(user) {
  nombreUsuario.innerHTML = `<strong>Nombre completo:</strong><br>${user.firstName} ${user.lastName}`;
  edadUsuario.innerHTML = `<strong>Edad:</strong><br>${user.age}`;
  correoUsuario.innerHTML = `<strong>Correo:</strong><br>${user.email}`;
}

/**
 * Initializes the profile view by loading and rendering user data.
 */
async function initProfile() {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const user = await getUserProfile({ token });

    renderUserProfile(user);
  } catch (error) {
    console.error("Error loading profile:", error);
    nombreUsuario.innerHTML = `<strong>Nombre completo:</strong><br><em>Error al cargar</em>`;
    edadUsuario.innerHTML = `<strong>Edad:</strong><br><em>Error al cargar</em>`;
    correoUsuario.innerHTML = `<strong>Correo:</strong><br><em>Error al cargar</em>`;
  }
}

/**
 * Configura el botón de borrar perfil
 */
function setupDeleteProfile() {
  const deleteProfileBtn = document.querySelector(".profile-link.danger");

  if (!deleteProfileBtn) {
    console.error("No se encontró el botón de eliminar perfil");
    return;
  }

  deleteProfileBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const confirmDelete = confirm(
      "¿Está seguro de que desea eliminar su perfil? Esta acción no se puede deshacer.",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await deleteUserProfile({ token });

      alert("Perfil eliminado con éxito.");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Hubo un error al eliminar el perfil.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initProfile();
  setupDeleteProfile();
});
