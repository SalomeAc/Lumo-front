import { loginUser } from "../services/userServices.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const submitBtn = document.getElementById("login-submit");
  if (!form || !submitBtn) return;

  function allFieldsValid() {
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) return false;
    if (!/^.+@.+\..+$/.test(email)) return false;
    if (password.length < 1) return false;
    return true;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!allFieldsValid()) {
      showMessage(
        "Por favor, completa todos los campos correctamente.",
        "error",
      );
      return;
    }
    showSpinner("Iniciando sesión...");
    try {
      const data = await loginUser({ email, password });
      if (data && data.token) {
        localStorage.setItem("token", data.token);
      }
      showSpinner("¡Login exitoso! Redirigiendo...");
      setTimeout(() => {
        window.location.href = "/";
      }, 200);
    } catch (err) {
      hideSpinner();
      showMessage(err.message || "No se pudo conectar al servidor.", "error");
    }
  });

  function showMessage(msg, type) {
    let el = document.getElementById("login-message");
    if (!el) {
      el = document.createElement("div");
      el.id = "login-message";
      el.style.margin = "1em 0";
      el.style.padding = "0.5em 1em";
      el.style.borderRadius = "5px";
      el.style.fontWeight = "bold";
      form.parentNode.insertBefore(el, form);
    }
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
