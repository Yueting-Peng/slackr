// HTTP Utility: A utility module for making HTTP requests
// This module provides a simplified API for making GET, POST, PUT and DELETE
import { toast } from "./toast.js";

const BASE_URL = "http://localhost:5005";

function getHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        "Content-Type": "application/json",
      };
}

function handleResponse(response) {
  return response.json().then((data) => {
    if (!response.ok) {
      throw new Error(data.error || "Server error");
    }
    return data;
  });
}

function get(url) {
  return fetch(`${BASE_URL}${url}`, {
    method: "GET",
    headers: getHeaders(),
  })
    .then(handleResponse)
    .catch((err) => toast(err.message, "error"));
}

function post(url, data) {
  return fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
    .then(handleResponse)
    .catch((err) => toast(err.message, "error"));
}

function put(url, data) {
  return fetch(`${BASE_URL}${url}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
    .then(handleResponse)
    .catch((err) => toast(err.message, "error"));
}

function deleteRequest(url) {
  return fetch(`${BASE_URL}${url}`, {
    method: "DELETE",
    headers: getHeaders(),
  })
    .then(handleResponse)
    .catch((err) => toast(err.message, "error"));
}

const http = {
  get,
  post,
  put,
  deleteRequest,
};

export function fetchUserInfo(userId) {
  http.get(`/user/${userId}`).then((res) => {
    const userInfo = {
      ...res,
      userId,
    };
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  });
}

export default http;
