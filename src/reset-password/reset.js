// Lógica de "Restablecer contraseña"
// - Lee el token desde la URL (?token=...)
// - Valida las contraseñas (fuerza y coincidencia)
// - Hace fetch a: POST /api/users/reset-password/:token
// - Muestra mensajes de éxito/error en #reset-message

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetForm');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('reset-submit');
  const msgEl = document.getElementById('reset-message');

  // 🔑 Base fija de la API (antes estaba con import.meta.env)
  const API_BASE = "http://localhost:8080";
  const RESET_ENDPOINT_BASE = `${API_BASE}/api/users/reset-password`;

  // Captura token de la URL (?token=...)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  function clearMessage() {
    if (!msgEl) return;
    msgEl.textContent = '';
    Object.assign(msgEl.style, {
      background: 'transparent',
      border: 'none',
      color: '#333',
      padding: '0',
      borderRadius: '0',
      marginBottom: '0',
    });
  }

  function showError(message) {
    if (!msgEl) return;
    msgEl.textContent = message;
    Object.assign(msgEl.style, {
      background: '#f8d7da',
      border: '1px solid #f5c6cb',
      color: '#721c24',
      padding: '0.5em 1em',
      borderRadius: '8px',
      marginBottom: '1em',
    });
  }

  function showSuccess(message) {
    if (!msgEl) return;
    msgEl.textContent = message;
    Object.assign(msgEl.style, {
      background: '#d4edda',
      border: '1px solid #c3e6cb',
      color: '#155724',
      padding: '0.5em 1em',
      borderRadius: '8px',
      marginBottom: '1em',
    });
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Guardando...' : 'Guardar nueva contraseña';
  }

  // Validación de contraseña
  function validatePassword(pw) {
    const errors = [];
    if (pw.length < 8) errors.push('Debe tener al menos 8 caracteres.');
    if (!/[a-z]/.test(pw)) errors.push('Falta una letra minúscula.');
    if (!/[A-Z]/.test(pw)) errors.push('Falta una letra mayúscula.');
    if (!/[0-9]/.test(pw)) errors.push('Falta un número.');
    if (!/[^\w\s]/.test(pw)) errors.push('Falta un símbolo.');
    return errors;
  }

  // Si no hay token, bloqueo
  if (!token) {
    showError('Enlace inválido o vencido. Solicita uno nuevo desde "Olvidé mi contraseña".');
    [submitBtn, passwordInput, confirmInput].forEach(el => el && (el.disabled = true));
    return;
  }

  // Limpia mensaje al tipear
  [passwordInput, confirmInput].forEach(inp => inp && inp.addEventListener('input', clearMessage));

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessage();

      const password = (passwordInput?.value || '').trim();
      const confirm = (confirmInput?.value || '').trim();

      const pwErrors = validatePassword(password);
      if (pwErrors.length) {
        showError(`La contraseña no cumple los requisitos: ${pwErrors.join(' ')}`);
        return;
      }
      if (password !== confirm) {
        showError('Las contraseñas no coinciden.');
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(`${RESET_ENDPOINT_BASE}/${encodeURIComponent(token)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, confirmPassword: confirm }),
        });

        let data = null;
        try { data = await res.json(); } catch {}

        if (!res.ok) {
          const errMsg = data?.message || data?.error || 'No se pudo restablecer la contraseña.';
          throw new Error(errMsg);
        }

        showSuccess('Contraseña actualizada correctamente. Redirigiendo al login...');
        form.reset();
        setTimeout(() => { window.location.href = '/login/'; }, 1500);
      } catch (err) {
        showError(err?.message || 'Ocurrió un error inesperado. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    });
  }
});
