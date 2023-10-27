// script for login page

import http from "./request.js";
import { toast } from "./toast.js";
import { fetchUserInfo } from "./request.js";
import { startInterval } from "./message.js";

const login = (data) => {
  http.post("/auth/login", data).then((res) => {
    localStorage.setItem("token", res.token);
    startInterval();
    window.location.hash = "#channel";
    fetchUserInfo(res.userId);
  });
};

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    toast("Please fill in both email and password.", "error");
    return;
  }

  login({ email, password });
});
