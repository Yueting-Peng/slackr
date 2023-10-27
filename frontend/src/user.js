import http from "./request.js";
import { toast } from "./toast.js";
import {
  getUserDetails,
  formatDateToUserFriendly,
  setCurrentChannelID,
  getCurrentChannelID,
} from "./channel.js";
import { clearDom } from "./main.js";

document.getElementById("invite-to-channel").addEventListener("click", () => {
  if (navigator.onLine) {
    const channelId = getCurrentChannelID();
    const userList = window.__USER_LIST__;

    const userPromises = userList.map((user) => {
      return http.get(`/user/${user.id}`).then((userData) => {
        return {
          id: user.id,
          name: userData.name,
        };
      });
    });

    Promise.all(userPromises).then((usersInfo) => {
      usersInfo.sort((a, b) => a.name.localeCompare(b.name)); // Alphabetically sort by name

      http.get(`/channel/${channelId}`).then((channelData) => {
        const memberIds = channelData.members;

        const modalBody = document.getElementById("userList");
        clearDom(modalBody);

        usersInfo.forEach((userInfo) => {
          const userDiv = document.createElement("div");

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "user-checkbox";
          checkbox.value = userInfo.id;
          checkbox.id = `user_${userInfo.id}`;

          if (memberIds.includes(userInfo.id)) {
            checkbox.checked = true;
            checkbox.disabled = true;
          }

          const label = document.createElement("label");
          label.textContent = userInfo.name;
          label.htmlFor = `user_${userInfo.id}`;

          userDiv.appendChild(checkbox);
          userDiv.appendChild(label);

          modalBody.appendChild(userDiv);
        });
      });
    });
  } else {
    toast("You cannot invite users at offline mode.", "error");
  }
});

document.getElementById("inviteSelectedUsers").addEventListener("click", () => {
  const checkboxes = document.querySelectorAll(
    "#userList .user-checkbox:not(:disabled)"
  );
  const selectedUserIds = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => Number(checkbox.value)); // Convert string to number.

  const channelId = getCurrentChannelID();

  selectedUserIds.forEach((userId) => {
    http
      .post(`/channel/${channelId}/invite`, { userId: userId })
      .then((response) => {
        // Handle the response as needed, e.g., refresh the channel member list
      });
  });

  // Close the modal
  const modalInstance = bootstrap.Modal.getInstance(
    document.getElementById("inviteUsersModal")
  );
  modalInstance.hide();
});
