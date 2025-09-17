// Bloquear acceso si ya está logeado
if (localStorage.getItem('token')) {
  alert('Ya tienes una sesión activa. Cierra sesión para acceder al login.');
  window.location.href = '/dashboard/';
}
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
<<<<<<< HEAD
      showSpinner("¡Login exitoso! Redirigiendo...");
      setTimeout(() => {
        window.location.href = "/";
      }, 200);
=======
      // Forzar overlay visible y centrado
      let overlay = document.getElementById("spinner-overlay");
      if (overlay) {
        overlay.style.display = "flex";
        overlay.style.position = "fixed";
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.right = 0;
        overlay.style.bottom = 0;
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.background = "rgba(255,255,255,0.85)";
        overlay.style.zIndex = 1000;
        const spinnerImg = overlay.querySelector('.spinner-img');
        if (spinnerImg) {
          spinnerImg.style.width = '60px';
          spinnerImg.style.height = '60px';
          spinnerImg.style.objectFit = 'contain';
        }
        const spinnerMsg = overlay.querySelector('.spinner-msg');
        if (spinnerMsg) {
          spinnerMsg.style.fontSize = '1.2em';
          spinnerMsg.style.color = '#333';
          spinnerMsg.style.textAlign = 'center';
          spinnerMsg.textContent = '¡Login exitoso! Redirigiendo...';
        }
      }
  setTimeout(() => { window.location.href = '/dashboard/'; }, 500);
>>>>>>> testing
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
      overlay.style.position = "fixed";
      overlay.style.top = 0;
      overlay.style.left = 0;
      overlay.style.right = 0;
      overlay.style.bottom = 0;
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.background = "rgba(255,255,255,0.85)";
      overlay.style.zIndex = 1000;
      overlay.innerHTML = `
        <div class="spinner-center" style="display:flex;flex-direction:column;align-items:center;gap:1.5em;">
          <img src="/spinner.gif" alt="Loading..." class="spinner-img" style="width:60px;height:60px;object-fit:contain;" />
          <div class="spinner-msg" style="font-size:1.2em;color:#333;text-align:center;"></div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    const spinnerMsg = overlay.querySelector(".spinner-msg");
    if (spinnerMsg) spinnerMsg.textContent = msg;
    overlay.style.display = "flex";
    form.style.display = "none";
  }
  function hideSpinner() {
    let overlay = document.getElementById("spinner-overlay");
    if (overlay) overlay.style.display = "none";
    form.style.display = "";
  }
});
