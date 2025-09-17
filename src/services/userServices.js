import { http } from "../api/http.js";

/**
 * Register a new user in the system.
 *
 * Sends a POST request to the backend API (/api/users)
 * with the provided registration fields.
 *
 * @async
 * @function registerUser
 * @param {Object} params - User registration data.
 * @param {string} params.firstName - The user's first name.
 * @param {string} params.lastName - The user's last name.
 * @param {number} params.age - The user's age.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password.
 * @param {string} params.confirmPassword - The user's password confirmation.
 * @returns {Promise<Object>} The created user object returned by the API.
 * @throws {Error} If the API responds with an error status or message.
 *
 * @example
 * try {
 *   const user = await registerUser({ firstName: "Ana", lastName: "Pérez", age: 20, email: "ana@mail.com", password: "Secret123!", confirmPassword: "Secret123!" });
 *   console.log("User created:", user);
 * } catch (err) {
 *   console.error("Registration failed:", err.message);
 * }
 */
export async function registerUser({
  firstName,
  lastName,
  age,
  email,
  password,
  confirmPassword,
}) {
  return http.post("/api/users", {
    firstName,
    lastName,
    age,
    email,
    password,
    confirmPassword,
  });
}

/**
 * Log in a user.
 *
 * Sends a POST request to the backend API (/api/users/login)
 * with the provided username and password.
 *
 * @async
 * @function loginUser
 * @param {Object} params - User login data.
 * @param {string} params.email - The email of the user.
 * @param {string} params.password - The password of the user.
 * @returns {Promise<Object>} The user object or token returned by the API.
 * @throws {Error} If the API responds with an error status or message.
 *
 * @example
 * try {
 *   const user = await loginUser({ email: "alice@mail.com", password: "secret" });
 *   console.log("Logged in:", user);
 * } catch (err) {
 *   console.error("Login failed:", err.message);
 * }
 */
export async function loginUser({ email, password }) {
  return http.post("/api/users/login", { email, password });
}

/**
 * Fetches the authenticated user's profile data.
 * @param {string} token - JWT token for authorization
 * @returns {Promise<Object>}
 */
export async function getUserProfile({ token }) {
  return http.get("/api/users/user-profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Updates the authenticated user's profile data.
 * @param {string} token - JWT token for authorization
 * @returns {Promise<Object>}
 */
export async function updateUserProfile(body, token) {
  return http.put("/api/users/update-profile", body, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Deletes the authenticated user's profile data.
 * @param {string} token - JWT token for authorization
 * @returns {Promise<Object>}
 */
export async function deleteUserProfile({ token }) {
  return http.del("/api/users/delete-user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}