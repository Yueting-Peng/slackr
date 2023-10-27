import {
  fetchChannelDetail,
  fetchChannelList,
  fetchUserList,
} from "./channel.js";
import { BACKEND_PORT } from "./config.js";
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from "./helpers.js";
import { generateMyProfile, generateUserProfile } from "./profile.js";

const loginStatus = () => {
  return localStorage.getItem("token") !== null;
};

const triggerLoading = () => {
  const loadingEle = document.getElementById("loading-dom");
  setTimeout(() => {
    loadingEle.style.display = "none";
  }, 500);
};

const showPage = (pageName) => {
  const pages = ["channel", "login", "profile", "register"];

  pages.forEach((page) => {
    document.querySelector(`.page.${page}`).style.display =
      page === pageName ? "flex" : "none";
  });

  const bannerElement = document.querySelector(".banner");
  if (pageName === "channel") {
    bannerElement.style.display = "none";
    document.body.classList.remove("profile-background");
    document.body.classList.add("green-background");
  } else if (pageName === "profile") {
    bannerElement.style.display = "none";
    document.body.classList.remove("green-background");
    document.body.classList.add("profile-background");
  } else {
    bannerElement.style.display = "flex";
    document.body.classList.remove("green-background");
    document.body.classList.remove("profile-background");
  }
};

//handle the changes of hash
const handleHashChange = () => {
  const hash = window.location.hash;
  const logined = loginStatus();
  const isOnline = navigator.onLine;

  if (!logined && hash !== "#login" && hash !== "#register") {
    window.location.hash = "#login";
    return;
  }

  const channelPattern = /^#channel=(\w+)$/;
  const profilePattern = /^#profile=(\w+)$/;

  if (channelPattern.test(hash)) {
    const channelId = hash.match(channelPattern)[1];
    showPage("channel");
    if (isOnline) {
      fetchUserList().then(() => {
        window.__MESSAGE_START__ = 0;
        fetchChannelList(channelId);
      });
    } else {
      fetchUserList();
      fetchChannelList(channelId);
    }
  } else if (profilePattern.test(hash)) {
    const userId = hash.match(profilePattern)[1];
    showPage("profile");
    generateUserProfile(userId);
  } else {
    switch (hash) {
      case "#channel":
        showPage("channel");
        if (isOnline) {
          fetchUserList().then(() => {
            window.__MESSAGE_START__ = 0;
            fetchChannelList();
          });
        } else {
          fetchUserList();
          fetchChannelList();
        }

        break;
      case "#profile":
        showPage("profile");
        generateMyProfile();
        break;
      case "#login":
        showPage("login");
        break;
      case "#register":
        showPage("register");
        break;
      default:
        showPage("channel");
        if (isOnline) {
          fetchUserList().then(() => {
            window.__MESSAGE_START__ = 0;
            fetchChannelList();
          });
        } else {
          fetchUserList();
          fetchChannelList();
        }
        break;
    }
  }
};

window.onhashchange = handleHashChange;
window.onload = () => {
  triggerLoading();
  handleHashChange();
};

export const clearDom = (dom) => {
  while (dom.firstChild) {
    dom.removeChild(dom.firstChild);
  }
};
