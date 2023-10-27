import { fileToDataUrl } from "./helpers.js";
import { getUserInfo, getUserDetails } from "./channel.js";
import http from "./request.js";
import { toast } from "./toast.js";

export function generateMyProfile() {
  const profileEditBox = document.querySelector(
    ".profile-body-item.profile-edit-block"
  );
  profileEditBox.style.display = "block";

  const specProfileBox = document.querySelector(
    ".profile-body-item.other-user-info"
  );
  specProfileBox.style.display = "none";

  const userInfo = getUserInfo();
  const userId = userInfo.userId;
  http.get(`/user/${userId}`).then((response) => {
    const userData = response;
    document.getElementById("avatar").src = userData.image
      ? userData.image
      : "./assets/default_avatar.svg";
    document.getElementById("my-user-name").textContent = userData.name;

    document.getElementById("profileUserName").value = userData.name;
    document.getElementById("userEmail").value = userData.email;
    document.getElementById("userBio").value = userData.bio;
    if (userData.image) {
      document.getElementById("displayImage").src = userData.image;
    } else {
      document.getElementById("displayImage").src =
        "./assets/default_avatar.svg";
    }
  });
}

function togglePasswordVisibility() {
  const passwordField = document.getElementById("userPassword");
  const confirmPasswordField = document.getElementById("confirmUserPassword");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    confirmPasswordField.type = "text";
  } else {
    passwordField.type = "password";
    confirmPasswordField.type = "password";
  }
}

function submitProfileForm() {
  const originalUserInfo = getUserInfo();

  const newUserData = {
    name: document.getElementById("profileUserName").value,
    bio: document.getElementById("userBio").value,
  };

  const newEmail = document.getElementById("userEmail").value;
  if (newEmail !== originalUserInfo.email) {
    newUserData.email = newEmail;
  }

  const newPassword = document.getElementById("userPassword").value;
  if (newPassword) {
    if (newPassword !== document.getElementById("confirmUserPassword").value) {
      toast("Passwords do not match!", "error");
      return;
    }
    newUserData.password = newPassword;
  }

  const userImage = document.getElementById("userImage").files[0];
  if (userImage) {
    fileToDataUrl(userImage).then((dataUrl) => {
      newUserData.image = dataUrl;
      updateUserData(newUserData);
    });
  } else {
    updateUserData(newUserData);
  }
}

function updateUserData(data) {
  http.put("/user", data).then(() => {
    toast("Profile updated successfully!", "success");
    window.location.href = "#profile";
    window.location.reload(true);
  });
}

const editProfileBtn = document.getElementById("edit-profile");

editProfileBtn.addEventListener("click", function () {
  window.location.href = "#profile";
});

document
  .getElementById("passwordToggleSwitch")
  .addEventListener("click", togglePasswordVisibility);

document
  .getElementById("saveProfileChangesBtn")
  .addEventListener("click", submitProfileForm);

const backToChannelsElement = document.getElementById("back-to-channels");

backToChannelsElement.addEventListener("click", function () {
  window.location.href = "#channel";
});

const signoutDom = document.getElementById("signout-profile");
signoutDom.addEventListener("click", function () {
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

const toRegister = document.getElementById("register-profile");
toRegister.addEventListener("click", function () {
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

export function generateUserProfile(userId) {
  const profileEditBox = document.querySelector(
    ".profile-body-item.profile-edit-block"
  );
  profileEditBox.style.display = "none";

  const specProfileBox = document.querySelector(
    ".profile-body-item.other-user-info"
  );
  specProfileBox.style.display = "flex";
  const userInfo = getUserInfo();
  const myUserId = userInfo.userId;
  http.get(`/user/${myUserId}`).then((response) => {
    document.getElementById("avatar").src = response.image
      ? response.image
      : "./assets/default_avatar.svg";
    document.getElementById("my-user-name").textContent = response.name;
  });
  getUserDetails(userId).then((userData) => {
    const titleDiv = document.getElementById("spec-user-title");
    titleDiv.textContent = `${userData.name}'s`
    const userNameDiv = document.getElementById("spec-user-name");
    userNameDiv.textContent = userData.name;

    const userEmailDiv = document.getElementById("spec-user-email");
    userEmailDiv.textContent = userData.email;

    const userBioDiv = document.getElementById("spec-user-bio");
    userBioDiv.textContent = userData.bio;

    const userIdDiv = document.getElementById("spec-user-id");
    userIdDiv.textContent = userId;

    const userImage = document.getElementById("spec-user-img");
    userImage.src = userData.image
      ? userData.image
      : "./assets/default_avatar.svg";
  });
}
