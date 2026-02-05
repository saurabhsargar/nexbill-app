export function setSession(token: string) {
  localStorage.setItem("access_token", token);
}

export function getSession() {
  return localStorage.getItem("access_token");
}

export function clearSession() {
  localStorage.removeItem("access_token");
}

export function logout() {
  localStorage.removeItem("access_token")
}