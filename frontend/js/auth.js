function signup() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const error = document.getElementById("signupError");

  error.textContent = "";

  if (!name || !email || !password) {
    error.textContent = "All fields are required";
    return;
  }

  const nameRegex = /^[A-Za-z ]{3,}$/;
  if (!nameRegex.test(name)) {
    error.textContent = "Name must contain only letters and be at least 3 characters long";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    error.textContent = "Invalid email format";
    return;
  }

  const passwordRegex = /^(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    error.textContent = "Password must be at least 8 characters and contain a number";
    return;
  }


  fetch("http://localhost:3000/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("justSignedUp", "true");
        window.location.href = "confirmation.html";
      } else {
        error.textContent = data.message || "Signup failed";
      }
    })
    .catch(() => {
      error.textContent = "Server error. Try again later.";
    });
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const error = document.getElementById("loginError");

  if (!email || !password) {
    error.textContent = "All fields are required";
    return;
  }

  fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("userId", data.userId);
        localStorage.removeItem("justSignedUp");
        window.location.href = "todo.html";
      } else {
        error.textContent = data.message || "Invalid email or password";
      }
    })
    .catch(() => {
      error.textContent = "Server error. Try again later.";
    });
}

function confirmLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const error = document.getElementById("confirmationError");

  if (!email || !password) {
    error.textContent = "All fields are required";
    return;
  }

  fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        error.textContent = "Invalid email or password";
        return;
      }

      localStorage.setItem("userId", data.userId);
      localStorage.removeItem("justSignedUp");

      window.location.href = "todo.html";
    })
    .catch(() => {
      error.textContent = "Invalid email or password";
    });
}
