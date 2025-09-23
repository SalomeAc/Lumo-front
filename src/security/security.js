import { updateUserProfile, getUserProfile } from "../services/userServices.js"; 

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector(".update-form");

  try {
    const token = localStorage.getItem("token");
    if (token) {
      const user = await getUserProfile({ token });

      const headerNameEl = document.querySelector(".header-name");
      const headerEmailEl = document.querySelector(".header-email");

      if (headerNameEl) headerNameEl.textContent = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
      if (headerEmailEl) headerEmailEl.textContent = user.email ?? "";
    }
  } catch (err) {
    console.error("Error cargando datos del usuario (precarga header):", err);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const password = document.getElementById("nueva").value.trim();
    const confirmPassword = document.getElementById("confirmar").value.trim();

    if (!password || !confirmPassword) {
      alert("⚠️ Debe ingresar y confirmar la nueva contraseña");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Las contraseñas no coinciden");
      return;
    }

    const body = {
      password,
      confirmPassword,
    };

    try {
      const res = await updateUserProfile(body, token);
      alert("✅ Contraseña actualizada con éxito");
      console.log("Respuesta del backend:", res);
      form.reset();
    } catch (err) {
      console.error("Error al actualizar contraseña:", err);
      alert("❌ Error al actualizar contraseña: " + err.message);
    }
  });
});