document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recoverForm");
  const emailInput = document.getElementById("email");
  const messageBox = document.getElementById("recover-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // evitar que recargue la página

    const email = emailInput.value.trim();

    if (validateEmail(email)) {
      // Mostrar mensaje de éxito
      messageBox.textContent = `Se ha enviado un enlace de recuperación a ${email}`;
      messageBox.style.color = "green";
      form.reset();
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
