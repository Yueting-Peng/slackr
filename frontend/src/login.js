// script for login page

import http from "./request.js";
import { toast } from "./toast.js";
import { fetchUserInfo } from "./request.js";

function login(data) {
  http.post("/auth/login", data).then((res) => {
    localStorage.setItem("token", res.token);
    window.location.hash = "#channel";
    fetchUserInfo(res.userId);
  });
}

document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      toast("Please fill in both email and password.", "error");
      return;
    }

    login({ email, password });
  });
