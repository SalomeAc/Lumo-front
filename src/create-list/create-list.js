import { createList } from '../services/listService.js';
const listForm = document.getElementById('listForm');

const token = localStorage.getItem('token');
if (!token) {
  alert('No token found. Please login first.');
  window.location.href = '/login/';
}


listForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = document.getElementById('list-title').value.trim();
  if (!title) return;

  try {
    await createList(title, token);
    window.location.href = '/dashboard/';
  } catch (error) {
    alert('Error creando lista. Revisa la consola.');
    console.error(error);
  }
});