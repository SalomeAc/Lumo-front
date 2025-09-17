import { updateUserProfile } from "../services/userServices.js"; // ajusta la ruta según tu proyecto

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".update-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const firstName = document.getElementById("nombre").value.trim();
    const lastName = document.getElementById("apellidos").value.trim();
    const age = parseInt(document.getElementById("edad").value.trim(), 10);
    const email = document.getElementById("correo").value.trim();

    const body = {};
    if (firstName) body.firstName = firstName;
    if (lastName) body.lastName = lastName;
    if (age) body.age = age;
    if (email) body.email = email;

    try {
      const res = await updateUserProfile(body, token);

      alert("Perfil actualizado con éxito ✅");
      console.log("Respuesta del backend:", res);
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      alert("❌ Error al actualizar el perfil: " + err.message);
    }
  });
});


