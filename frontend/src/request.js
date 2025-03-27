// HTTP Utility: A utility module for making HTTP requests
// This module provides a simplified API for making GET, POST, PUT and DELETE
import { toast } from "./toast.js";

const BASE_URL = "http://localhost:5005";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        "Content-Type": "application/json",
      };
};

const handleResponse = (response) => {
  return response.json().then((data) => {
    if (!response.ok) {
      throw new Error(data.error || "Server error");
    }
    return data;
  });
};

const get = async (url) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (err) {
    return toast(err.message, "error");
  }
};

const post = async (url, data) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (err) {
    return toast(err.message, "error");
  }
};

const put = async (url, data) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (err) {
    return toast(err.message, "error");
  }
};

const deleteRequest = async (url) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (err) {
    return toast(err.message, "error");
  }
};

const http = {
  get,
  post,
  put,
  deleteRequest,
};

export const fetchUserInfo = (userId) => {
  http.get(`/user/${userId}`).then((res) => {
    const userInfo = {
      ...res,
      userId,
    };
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  });
};

export default http;
