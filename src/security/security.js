import { updateUserProfile } from "../services/userServices.js"; // ajusta la ruta según tu proyecto

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".update-form");

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
