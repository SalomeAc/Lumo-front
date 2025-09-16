import { registerUser } from "../services/userServices.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const submitBtn = document.getElementById("register-submit");
  if (!form || !submitBtn) return;

  function validateFields() {
    var fn = form.firstName.value.trim();
    var ln = form.lastName.value.trim();
    var ageVal = Number(form.age.value);
    var emailVal = form.email.value.trim();
    var pw = form.password.value.trim();
    var cpw = form.confirmPassword.value.trim();
    if (!fn) return "El nombre es obligatorio.";
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(fn))
      return "El nombre solo puede contener letras.";
    if (fn.length > 10) return "El nombre no puede tener más de 10 caracteres.";
    if (!ln) return "El apellido es obligatorio.";
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(ln))
      return "El apellido solo puede contener letras.";
    if (ln.length > 10)
      return "El apellido no puede tener más de 10 caracteres.";
    if (!form.age.value) return "La edad es obligatoria.";
    if (!/^\d+$/.test(form.age.value)) return "La edad debe ser un número.";
    if (ageVal < 13 || ageVal > 112) return "La edad debe ser entre 13 y 112.";
    if (!emailVal) return "El correo electrónico es obligatorio.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal))
      return "El correo electrónico no es válido.";
    if (!pw) return "La contraseña es obligatoria.";
    let errores = [];
    if (pw.length < 8) errores.push("al menos 8 caracteres");
    if (!/[A-Z]/.test(pw)) errores.push("una letra mayúscula");
    if (!/[a-z]/.test(pw)) errores.push("una letra minúscula");
    if (!/\d/.test(pw)) errores.push("un número");
    if (!/[^\w\s]/.test(pw)) errores.push("un carácter especial");
    if (errores.length > 0)
      return "La contraseña debe contener: " + errores.join(", ") + ".";
    if (!cpw) return "Debes confirmar la contraseña.";
    if (pw !== cpw) return "Las contraseñas no coinciden.";
    return null;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const age = Number(form.age.value);
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    const errorMsg = validateFields();
    if (errorMsg) {
      showMessage(errorMsg, "error");
      return;
    }

    showSpinner("Registrando...");
    try {
      const data = await registerUser({
        firstName,
        lastName,
        age,
        email,
        password,
        confirmPassword,
      });
      showSpinner("¡Registrado exitosamente! Redirigiendo...");
      setTimeout(() => {
        window.location.href = "/login/";
      }, 200);
    } catch (err) {
      hideSpinner();
      showMessage(err.message || "No se pudo conectar al servidor.", "error");
    }
  });

  function showMessage(msg, type) {
    let el = document.getElementById("register-message");
    if (!el) {
      el = document.createElement("div");
      el.id = "register-message";
      el.style.margin = "1em 0";
      el.style.padding = "0.5em 1em";
      el.style.borderRadius = "5px";
      el.style.fontWeight = "bold";
      form.parentNode.insertBefore(el, form);
    }
    // Mostrar mensaje como texto plano (igual que login)
    el.textContent = msg;
    el.style.background = type === "success" ? "#d4edda" : "#f8d7da";
    el.style.color = type === "success" ? "#155724" : "#721c24";
    el.style.border =
      type === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb";
  }

  function showSpinner(msg) {
    let overlay = document.getElementById("spinner-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "spinner-overlay";
      overlay.innerHTML = `
				<div class="spinner-center">
					<img src="/spinner.gif" alt="Loading..." class="spinner-img" />
					<div class="spinner-msg"></div>
				</div>
			`;
      document.body.appendChild(overlay);
    }
    overlay.querySelector(".spinner-msg").textContent = msg;
    overlay.style.display = "flex";
    form.style.display = "none";
  }
  function hideSpinner() {
    let overlay = document.getElementById("spinner-overlay");
    if (overlay) overlay.style.display = "none";
    form.style.display = "";
  }
});
