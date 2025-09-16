/**
 * Create List page script: handles form submission to create a new list.
 */
import { createList } from '../services/listService.js';

/**
 * The list creation form element.
 * @type {HTMLFormElement|null}
 */
const listForm = document.getElementById('listForm');

/**
 * JWT token retrieved from localStorage after login.
 * @type {string|null}
 */
const token = localStorage.getItem('token');
if (!token) {
  alert('No token found. Please login first.');
  window.location.href = '/login/';
}

/**
 * Handle list form submission: validates input and calls API service.
 * Redirects to dashboard on success.
 * @param {SubmitEvent} event
 */
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