import http from "./request.js";
import { toast } from "./toast.js";
import { fetchChannelMessage, showCachedChannelMessage } from "./message.js";
import { clearDom } from "./main.js";

export function setCurrentChannelID(channelID) {
  localStorage.setItem("currentChannelID", channelID);
}

export function getCurrentChannelID() {
  return localStorage.getItem("currentChannelID");
}

export function fetchChannelList(selectedId) {
  window.__MESSAGE_START__ = 0;
  if (navigator.onLine) {
    http.get("/channel").then((res) => {
      localStorage.setItem("channelList", JSON.stringify(res.channels));
      if (selectedId) {
        setCurrentChannelID(selectedId);
        showChannelList(res.channels, "public", selectedId);
        showChannelList(res.channels, "private", selectedId);
        fetchChannelDetail(selectedId);
        fetchChannelMessage(selectedId);
      } else {
        showChannelList(res.channels, "public");
        showChannelList(res.channels, "private");
        fetchChannelDetail(getCurrentChannelID());
        fetchChannelMessage(getCurrentChannelID());
      }
    });
  } else {
    const cachedChannelId = getCurrentChannelID();
    const cachedChannels = JSON.parse(localStorage.getItem("channelList"));
    if (cachedChannels) {
      showChannelList(cachedChannels, "public", cachedChannelId);
      showChannelList(cachedChannels, "private", cachedChannelId);
      fetchChannelDetail(cachedChannelId);
      showCachedChannelMessage();
    } else {
      toast("No cached channel list data available for offline mode.", "error");
    }
  }
}

export function getUserInfo() {
  const userInfoString = localStorage.getItem("userInfo");
  try {
    const userInfo = JSON.parse(userInfoString);
    return userInfo || {};
  } catch (err) {
    toast(err.message, "error");
    return {};
  }
}

const generateRandomColor = () => {
  const getRandomValue = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);
  const r = getRandomValue(50, 200);
  const g = getRandomValue(50, 200);
  const b = getRandomValue(50, 200);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
};

export function fetchUserList() {
  if (navigator.onLine) {
    return http.get("/user").then((res) => {
      const { users } = res;
      localStorage.setItem("userData", JSON.stringify(res.users));
      const userWithColor = users.map((item) => ({
        ...item,
        color: generateRandomColor(),
      }));
      window.__USER_LIST__ = userWithColor;
    });
  } else {
    const users = JSON.parse(localStorage.getItem("userData"));
    if (users) {
      const userWithColor = users.map((item) => ({
        ...item,
        color: generateRandomColor(),
      }));
      window.__USER_LIST__ = userWithColor;
    } else {
      toast("No cached user data available for offline mode.", "error");
    }
  }
}

export function showChannelList(channelList, type, channelId) {
  const isPublicType = type === "public";
  const listDom = document.getElementById(
    isPublicType ? "publicChannelList" : "privateChannelList"
  );
  const userInfo = getUserInfo();
  const userId = userInfo.userId;

  clearDom(listDom);
  const filteredList = channelList.filter(
    (channel) => channel.private !== isPublicType
  );
  const joinedList = filteredList.filter((channel) =>
    channel.members.includes(userId)
  );
  const unjoinedList = isPublicType
    ? filteredList.filter((channel) => !channel.members.includes(userId))
    : [];

  let targetChannelId = channelId;
  if (!targetChannelId && joinedList.length && isPublicType) {
    targetChannelId = joinedList[0].id;
  }
  if (targetChannelId) {
    setCurrentChannelID(targetChannelId);
  }

  const appendChannelToDOM = (channel, isJoined, targetChannelId) => {
    const selectedChannel = channel.id === Number(targetChannelId);
    const channelDom = document.createElement("div");
    channelDom.className = selectedChannel
      ? "channel-item selected-channel"
      : "channel-item";

    channelDom.id = channel.id;
    channelDom.innerText = "# " + channel.name;

    if (isPublicType && !isJoined) {
      const joinBtn = document.createElement("button");
      joinBtn.className = "btn btn-success btn-sm join-btn";
      joinBtn.innerText = "+ Join";
      channelDom.appendChild(joinBtn);
    } else {
      const leaveBtn = document.createElement("button");
      leaveBtn.className = "btn btn-secondary btn-sm leave-btn";
      leaveBtn.innerText = "Leave";
      channelDom.appendChild(leaveBtn);
    }

    listDom.appendChild(channelDom);
  };

  joinedList.forEach((channel) =>
    appendChannelToDOM(channel, true, targetChannelId)
  );
  unjoinedList.forEach((channel) =>
    appendChannelToDOM(channel, false, targetChannelId)
  );
}

export function fetchChannelDetail(channelId) {
  if (navigator.onLine) {
    http.get(`/channel/${channelId}`).then((detail) => {
      localStorage.setItem("channelDetail", JSON.stringify(detail));
      showChannelHeader({
        ...detail,
        id: channelId,
      });
    });
  } else {
    const cachedChannelDetail = JSON.parse(
      localStorage.getItem("channelDetail")
    );
    if (cachedChannelDetail) {
      showChannelHeader({
        ...cachedChannelDetail,
        id: channelId,
      });
    } else {
      toast(
        "No cached channel detail data available for offline mode.",
        "error"
      );
    }
  }
}

function showChannelHeader(detail) {
  const channelHeaderDom = document.getElementById("channel-header");
  channelHeaderDom.innerText = "# " + detail.name;
}

export function formatDateToUserFriendly(isoString) {
  const dateObj = new Date(isoString);

  // Format the date part
  const dateOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Australia/Sydney",
  };
  const formattedDate = new Intl.DateTimeFormat("en-AU", dateOptions).format(
    dateObj
  );

  // Format the time part
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Australia/Sydney",
  };
  const formattedTime = dateObj.toLocaleTimeString("en-AU", timeOptions);

  return `${formattedDate} ${formattedTime}`;
}

export function getUserDetails(userId) {
  const isOnline = navigator.onLine;

  if (isOnline) {
    return http.get(`/user/${userId}`).then((res) => {
      localStorage.setItem(`user_${userId}`, JSON.stringify(res));
      return res;
    });
  } else {
    const cachedData = localStorage.getItem(`user_${userId}`);
    if (cachedData) {
      return Promise.resolve(JSON.parse(cachedData));
    } else {
      return Promise.reject(new Error("No data available in cache."));
    }
  }
}

document.querySelector("#create-channel-btn").onclick = function () {
  if (!navigator.onLine) {
    toast("You are offline. Cannot create a channel right now.", "error");
    return;
  }
  const name = document.querySelector("#new-channel-name").value;
  if (!name) {
    toast("please enter the name", "error");
    return;
  }
  const description = document.querySelector("#new-channel-description").value;
  const isPrivate = document.querySelector("#privateCheck").checked;
  const form = document.getElementById("channel-create-form");
  const dropdownBtn = document.getElementById("add-btn");

  http
    .post("/channel", {
      name,
      description,
      private: isPrivate,
    })
    .then((res) => {
      if (res?.channelId) {
        toast("create successfully!", "success");
        window.location.href = `#channel=${res.channelId}`;
        form.reset();
        let dropdownInstance = bootstrap.Dropdown.getInstance(dropdownBtn);
        if (dropdownInstance) {
          dropdownInstance.hide();
        }
      }
    });
};

function handleChannelListClick(event) {
  const item = event.target.closest(".channel-item");
  const itemId = item.id;
  if (item) {
    if (event.target.classList.contains("leave-btn")) {
      if (!navigator.onLine) {
        toast("You are offline. Cannot leave channel right now.", "error");
        return;
      }
      const isConfirmed = confirm(
        "Are you sure you want to leave this channel?"
      );
      if (!isConfirmed) return;
      http
        .post(`/channel/${itemId}/leave`)
        .then(toast("left the channel successfully!", "success"));
      return fetchChannelList();
    } else if (event.target.classList.contains("join-btn")) {
      if (!navigator.onLine) {
        toast("You are offline. Cannot join channel right now.", "error");
        return;
      }
      const isConfirmed = confirm(
        "Are you sure you want to join this channel?"
      );
      if (!isConfirmed) return;
      http
        .post(`/channel/${itemId}/join`)
        .then(toast("joined the channel successfully!", "success"));

      return fetchChannelList(itemId);
    } else if (event.target.classList.contains("selected-channel")) return;

    window.location.href = `#channel=${itemId}`;
  }
}

const logoutDom = document.getElementById("logoutBtn");
logoutDom.addEventListener("click", function (event) {
  event.preventDefault();
  const isConfirmed = confirm(
    "Are you sure you want to log out of your current account?"
  );
  if (!isConfirmed) return;

  http.post("/auth/logout").then((res) => {
    console.log(res);
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("currentChannelID");
    window.location.hash = "#login";
  });
});

const registerDom = document.getElementById("registerBtn");
registerDom.addEventListener("click", function (event) {
  event.preventDefault();
  const isConfirmed = confirm(
    "Are you sure you want to sign out of your existing account and proceed to the registration page?"
  );
  if (!isConfirmed) return;

  http.post("/auth/logout").then((res) => {
    console.log(res);
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("currentChannelID");
    window.location.hash = "#register";
  });
});

document
  .getElementById("publicChannelList")
  .addEventListener("click", handleChannelListClick);
document
  .getElementById("privateChannelList")
  .addEventListener("click", handleChannelListClick);

document.getElementById("edit-channel").addEventListener("click", function () {
  const channelId = getCurrentChannelID();
  if (navigator.onLine) {
    http.get(`/channel/${channelId}`).then((response) => {
      // Fill the modal with the response data
      document.getElementById("channel-name").value = response.name;
      document.getElementById("channel-description").value =
        response.description;
      document.getElementById("channel-privacy").textContent = response.private
        ? "Private"
        : "Public";
      document.getElementById("channel-created-at").textContent =
        formatDateToUserFriendly(response.createdAt);
      const creatorId = response.creator;

      getUserDetails(creatorId).then((creatorDetails) => {
        document.getElementById("channel-creator").textContent =
          creatorDetails.name;

        // Use Bootstrap's method to show the modal
        let myModal = new bootstrap.Modal(
          document.getElementById("channelDetailsModal")
        );
        myModal.show();
      });
    });
  } else {
    toast("You cannot edit channel details at offline mode.", "error");
  }
});

document
  .getElementById("change-channelInfo-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();

    const channelId = getCurrentChannelID();
    const channelName = document.getElementById("channel-name").value;
    const channelDescription = document.getElementById(
      "channel-description"
    ).value;

    if (!channelName.trim()) {
      // Check if channel name is empty and show error using toast
      toast("Channel name cannot be empty!", "error");
      return;
    }

    const requestData = {
      name: channelName,
      description: channelDescription,
    };

    http
      .put(`/channel/${channelId}`, requestData)
      .then(() => {
        toast("Channel information updated successfully!", "success");
        let modalElement = document.getElementById("channelDetailsModal");
        let modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        fetchChannelList(channelId);
      })
      .catch((err) => {
        // Use toast to display the error
        toast(err.message, "error");
      });
  });

document.getElementById("channel-info").addEventListener("click", function () {
  const channelId = getCurrentChannelID();

  http
    .get(`/channel/${channelId}`)
    .then((response) => {
      // Populate modal with channel details
      document.getElementById("view-channel-name").textContent = response.name;
      document.getElementById("view-channel-description").textContent =
        response.description;
      document.getElementById("view-channel-privacy").textContent =
        response.private ? "Private" : "Public";
      document.getElementById("view-channel-created-at").textContent =
        formatDateToUserFriendly(response.createdAt);
      const creatorId = response.creator;
      getUserDetails(creatorId).then((creatorDetails) => {
        document.getElementById("view-channel-creator").textContent =
          creatorDetails.name;
      });

      // Display the modal
      const modalElement = document.getElementById("viewChannelDetailsModal");
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    })
    .catch((err) => {
      toast(err.message, "error");
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const channelBar = document.getElementById("mb-channel-bar");
  const sidebar = document.querySelector(".sidebar");

  channelBar.addEventListener("click", function (event) {
    event.preventDefault();
    sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
  });
});

document.getElementById("message-list").onscroll = function (e) {
  const { scrollTop } = e.target;
  if (scrollTop === 0 && window.__CHANNEL_MESSAGE_LOADED__) {
    window.__MESSAGE_START__ += 25;
    fetchChannelMessage(getCurrentChannelID());
  }
};
