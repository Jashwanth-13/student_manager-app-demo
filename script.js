function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const error = document.getElementById("error-msg");

  if (username === "" || password === "") {
    error.textContent = "Please enter both fields!";
    return;
  }

  localStorage.setItem("user", username);
  window.location.href = "home.html";
}

window.onload = () => {
  const userDisplay = document.getElementById("user-display");
  if (userDisplay) {
    const user = localStorage.getItem("user");
    userDisplay.textContent = user || "Guest";
  }
};
