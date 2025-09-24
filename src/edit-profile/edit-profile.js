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

      const nombreInput = document.getElementById("nombre");
      const apellidosInput = document.getElementById("apellidos");
      const edadInput = document.getElementById("edad");
      const correoInput = document.getElementById("correo");

      if (nombreInput) nombreInput.value = user.firstName ?? "";
      if (apellidosInput) apellidosInput.value = user.lastName ?? "";
      if (edadInput) edadInput.value = user.age ?? "";
      if (correoInput) correoInput.value = user.email ?? "";
    }
  } catch (err) {
    console.error("Error cargando datos del usuario (precarga header/inputs):", err);
  }

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