document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recoverForm");
  const emailInput = document.getElementById("email");
  const messageBox = document.getElementById("recover-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // evitar que recargue la página

    const email = emailInput.value.trim();

    if (validateEmail(email)) {
      // Llamar al backend para recuperar contraseña
      fetch("https://lumo-back-1.onrender.com/api/users/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      })
        .then(async (response) => {
          if (response.ok) {
            messageBox.textContent = `Se ha enviado un enlace de recuperación a ${email}`;
            messageBox.style.color = "green";
            form.reset();
          } else {
            const data = await response.json().catch(() => ({}));
            messageBox.textContent = data.message || "Error al enviar el correo de recuperación.";
            messageBox.style.color = "red";
          }
        })
        .catch(() => {
          messageBox.textContent = "No se pudo conectar con el servidor.";
          messageBox.style.color = "red";
        });
    } else {
      // Mostrar mensaje de error
      messageBox.textContent = "Por favor ingresa un correo válido.";
      messageBox.style.color = "red";
    }
  });

  // Función de validación 
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
});
