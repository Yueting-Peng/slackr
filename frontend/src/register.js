import http from "./request.js";
import { toast } from "./toast.js";

const signupForm = document.getElementById("signup-form");

const register = (data) => {
  http.post("/auth/register", data).then((res) => {
    localStorage.setItem("token", res.token);
    window.location.hash = "#channel";
  });
};

signupForm.addEventListener("submit", (event) => {
  // Prevent the form from submitting in the traditional way
  event.preventDefault();

  const email = document.getElementById("signupEmail").value;
  const name = document.getElementById("userName").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validate the form fields
  if (!email || !name || !password || !confirmPassword) {
    toast("All fields are required!", "error");
    return;
  }

  if (password !== confirmPassword) {
    toast("Passwords do not match!", "error");
    return;
  }

  // Send the signup request
  register({ email, password, name });
});
