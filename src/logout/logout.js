// Elimina el token y muestra spinner de éxito antes de redirigir
localStorage.removeItem('token');
const overlay = document.getElementById('spinner-overlay');
if (overlay) {
	overlay.querySelector('.spinner-msg').textContent = '¡Sesión cerrada exitosamente!';
}
setTimeout(() => {
	window.location.href = '/';
}, 500);
