
/**
 * Simulate user login by saving user info to localStorage
 * @param {Object} user - { id, name, email, phone }
 */
export function loginUser(user) {
  localStorage.setItem("tajii_user", JSON.stringify(user));
}

/**
 * Log out the current user
 */
export function logoutUser() {
  localStorage.removeItem("tajii_user");
}

/**
 * Get the currently logged-in user
 * @returns {Object|null} - { id, name, email, phone } or null if not logged in
 */
export function getLoggedInUser() {
  const user = localStorage.getItem("tajii_user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (err) {
    console.error("Failed to parse logged-in user", err);
    return null;
  }
}

/**
 * Update logged-in user info
 * @param {Object} updatedFields - { name?, email?, phone? }
 */
export function updateLoggedInUser(updatedFields) {
  const user = getLoggedInUser() || {};
  const updatedUser = { ...user, ...updatedFields };
  loginUser(updatedUser);
  return updatedUser;
}
