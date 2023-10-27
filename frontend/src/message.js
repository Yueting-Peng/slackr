import http from "./request.js";
import { toast } from "./toast.js";
import {
  getUserDetails,
  formatDateToUserFriendly,
  setCurrentChannelID,
  getCurrentChannelID,
  getUserInfo,
} from "./channel.js";
import { fileToDataUrl } from "./helpers.js";
import { clearDom } from "./main.js";

const getLatestTimestamp = (message) => {
  if (!message.editedAt && !message.sentAt) {
    return null;
  }
  if (!message.editedAt) {
    return "Sent at: " + formatDateToUserFriendly(message.sentAt);
  }

  return "Edited at: " + formatDateToUserFriendly(message.editedAt);
};

const timeAgo = (timestamp) => {
  const currentTime = new Date();
  const time = new Date(timestamp);

  const seconds = Math.floor((currentTime - time) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return `${seconds} secs ago`;
  if (minutes < 60) return `${minutes} mins ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  if (weeks < 4) return `${weeks} weeks ago`;
  if (months < 12) return `${months} months ago`;
  return `${years} years ago`;
};

const createEmptyMessageElement = () => {
  const emptyDom = document.createElement("div");
  const emptyLogo = document.createElement("img");
  emptyLogo.src = "./assets/chat-fill.svg";
  emptyLogo.alt = "chat-icon";
  emptyDom.className = "empty-message";
  emptyDom.innerText = "No Message";
  emptyDom.appendChild(emptyLogo);
  return emptyDom;
};

//left block is user img
const createUserImageElement = (senderDetails, senderId) => {
  const messageLeftDom = document.createElement("div");
  messageLeftDom.className = "message-left-dom";
  messageLeftDom.setAttribute("sender-id", senderId);

  if (senderDetails.image) {
    const imgDom = document.createElement("img");
    imgDom.className = "message-photo";
    imgDom.src = senderDetails.image;
    imgDom.alt = "User's image";
    messageLeftDom.appendChild(imgDom);
  } else {
    fetch("./assets/person-square.svg")
      .then((response) => response.text())
      .then((svgData) => {
        const parser = new DOMParser();
        const svg = parser.parseFromString(
          svgData,
          "image/svg+xml"
        ).documentElement;
        const userColor =
          window.__USER_LIST__.find((user) => user.id === senderId)?.color ||
          "#000000";
        svg.style.fill = userColor;
        messageLeftDom.appendChild(svg);
      });
  }
  return messageLeftDom;
};

//right: header:(name, time)
const createRightDomHeader = (item, senderDetails) => {
  const msgRightDomHeader = document.createElement("div");
  msgRightDomHeader.className = "msg-right-header";

  const senderName = document.createElement("h5");
  senderName.innerText = senderDetails.name;
  msgRightDomHeader.appendChild(senderName);

  const messageTime = document.createElement("div");
  messageTime.className = "message-time";
  messageTime.innerText = getLatestTimestamp(item);
  msgRightDomHeader.appendChild(messageTime);

  const reactContainer = createMsgReact(item);
  msgRightDomHeader.appendChild(reactContainer);

  return msgRightDomHeader;
};

//right: body:(msg contents with two icons)
const createMsgRightBody = (item, senderDetails) => {
  const messageContentDom = document.createElement("div");
  messageContentDom.className = "right-msg-content-dom";

  if (item.message) {
    const msgContent = document.createElement("div");
    msgContent.className = "message-content";
    msgContent.innerText = item.message;
    messageContentDom.appendChild(msgContent);
  }
  if (item.image) {
    const imgMsg = document.createElement("img");
    imgMsg.src = item.image;
    imgMsg.className = "img-thumbnail";
    imgMsg.setAttribute("data-toggle", "modal");
    imgMsg.setAttribute("data-target", "#carouselModal");
    messageContentDom.appendChild(imgMsg);
  }

  let userInfo = localStorage.getItem("userInfo");
  let parsedUserInfo = JSON.parse(userInfo);
  let myId = parsedUserInfo.userId;
  if (myId === item.sender) {
    const senderEditBox = document.createElement("div");
    senderEditBox.className = "senderEditBox";

    const msgEditIcon = document.createElement("img");
    msgEditIcon.className = "msg-edit-icon";
    msgEditIcon.src = "./assets/pen.svg";
    msgEditIcon.alt = "pen-icon";
    msgEditIcon.title = "Edit";
    msgEditIcon.setAttribute("editable-msg-id", item.id);
    senderEditBox.appendChild(msgEditIcon);

    const msgDeleteIcon = document.createElement("img");
    msgDeleteIcon.className = "msg-delete-icon";
    msgDeleteIcon.alt = "delete-icon";
    msgDeleteIcon.src = "./assets/trash.svg";
    msgDeleteIcon.title = "Delete";
    msgDeleteIcon.setAttribute("message-id", item.id);
    senderEditBox.appendChild(msgDeleteIcon);
    messageContentDom.appendChild(senderEditBox);
  }
  const messageFooterDom = generateReactInfo(item, myId);
  messageContentDom.appendChild(messageFooterDom);

  return messageContentDom;
};

const createMsgReact = (item) => {
  const reactContainer = document.createElement("div");
  reactContainer.className = "react-container";

  const emojis = [
    "\uD83D\uDC4D",
    "\uD83D\uDE42",
    "\uD83D\uDE4C",
    "\uD83D\uDC94",
  ];
  const emojiIds = ["thumbs-up", "smiling-face", "raised-hands", "heart"];

  const userInfo = getUserInfo();
  const userId = userInfo.userId;

  for (let i = 0; i < emojis.length; i++) {
    const emojiDiv = document.createElement("div");
    emojiDiv.id = emojiIds[i];
    emojiDiv.innerText = emojis[i];
    emojiDiv.setAttribute("message-id", item.id);

    const userReacted = item.reacts.some(
      (react) => react.user === userId && react.react === emojis[i]
    );

    if (userReacted) {
      emojiDiv.className = "react-emoji cur-user-reacted";
      emojiDiv.title = "unreact to the message";
      emojiDiv.addEventListener("click", () => {
        unreactMessage(emojis[i], item.id);
      });
    } else {
      emojiDiv.className = "react-emoji";
      emojiDiv.title = "react to the message";
      emojiDiv.addEventListener("click", () => {
        reactMessage(emojis[i], item.id);
      });
    }

    reactContainer.appendChild(emojiDiv);
  }

  const pinMsg = document.createElement("img");
  if (item.pinned) {
    pinMsg.className = "to-pin selected";
    pinMsg.title = "Unpin this message";
    pinMsg.src = "./assets/pinned.svg";
  } else {
    pinMsg.className = "to-pin";
    pinMsg.title = "Pin to channel";
    pinMsg.src = "./assets/pin-angle.svg";
  }

  pinMsg.alt = "pin-icon";
  pinMsg.setAttribute("message-id", item.id);
  reactContainer.appendChild(pinMsg);

  return reactContainer;
};

const createRightMsgDom = (item, senderDetails) => {
  const messageRightDom = document.createElement("div");
  messageRightDom.className = "message-right-box";

  const headerElement = createRightDomHeader(item, senderDetails);
  messageRightDom.appendChild(headerElement);

  const bodyElement = createMsgRightBody(item, senderDetails);
  messageRightDom.appendChild(bodyElement);

  return messageRightDom;
};

export const fetchChannelMessage = (channelId) => {
  window.__CHANNEL_MESSAGE_LOADED__ = false;
  const messageListEle = document.getElementById("message-list");
  if (window.__MESSAGE_START__ === 0) {
    clearDom(messageListEle);
  }

  setCurrentChannelLastMessageId(channelId);

  http
    .get(`/message/${channelId}?start=${window.__MESSAGE_START__}`)
    .then((res) => {
      if (window.__MESSAGE_START__ === 0 && !res?.messages?.length) {
        const emptyDom = createEmptyMessageElement();
        messageListEle.appendChild(emptyDom);
      } else {
        const { messages } = res;
        if (window.__MESSAGE_START__ === 0) {
          try {
            localStorage.setItem("channelMessages", JSON.stringify(messages));
          } catch (error) {
            if (
              error instanceof DOMException &&
              error.name === "QuotaExceededError"
            ) {
              console.error(
                "Local storage reached its limit; can't store more messages for offline use!",
                error
              );
            } else {
              console.error(
                "An unknown error occurred while saving messages:",
                error
              );
            }
          }
        }
        const processedMessages = new Array(messages.length);

        const messagePromises = messages.map((item, index) => {
          const senderId = item.sender;
          return getUserDetails(senderId).then((senderDetails) => {
            // console.log(item);
            const messageContainer = document.createElement("div");
            messageContainer.className = item.pinned
              ? "message-block pinned"
              : "message-block";

            //left: user image
            const userImageElement = createUserImageElement(
              senderDetails,
              senderId
            );
            messageContainer.appendChild(userImageElement);

            //right: header and content
            const messageContentElement = createRightMsgDom(
              item,
              senderDetails
            );
            messageContainer.appendChild(messageContentElement);

            processedMessages[index] = messageContainer;
          });
        });

        Promise.all(messagePromises).then(() => {
          processedMessages.forEach((messageElem) => {
            if (messageListEle.children.length) {
              messageListEle.insertBefore(
                messageElem,
                messageListEle.children[0]
              );
            } else {
              messageListEle.appendChild(messageElem);
            }
          });
          if (window.__MESSAGE_START__ === 0) {
            messageListEle.scrollTop = messageListEle.scrollHeight;
          }
        });
      }
      window.__CHANNEL_MESSAGE_LOADED__ = true;
    });
};
export const showCachedChannelMessage = () => {
  const messageListEle = document.getElementById("message-list");
  const messages = JSON.parse(localStorage.getItem("channelMessages"));
  if (messages && messages.length) {
    const processedMessages = new Array(messages.length);

    const messagePromises = messages.map((item, index) => {
      const senderId = item.sender;
      return getUserDetails(senderId)
        .then((senderDetails) => {
          const messageContainer = document.createElement("div");
          messageContainer.className = item.pinned
            ? "message-block pinned"
            : "message-block";

          const userImageElement = createUserImageElement(
            senderDetails,
            senderId
          );
          messageContainer.appendChild(userImageElement);

          const messageContentElement = createRightMsgDom(item, senderDetails);
          messageContainer.appendChild(messageContentElement);

          processedMessages[index] = messageContainer;
        })
        .catch((error) => {
          console.error("Failed to get user details from cache:", error);
          return null;
        });
    });

    Promise.all(messagePromises).then(() => {
      const fragment = document.createDocumentFragment();
      processedMessages.forEach((messageElem) => {
        if (messageElem) {
          fragment.appendChild(messageElem);
        }
      });
      messageListEle.appendChild(fragment);
      messageListEle.scrollTop = messageListEle.scrollHeight;
    });
  } else {
    toast(
      "No cached channel message data available for offline mode.",
      "error"
    );
  }
};

const messageTextarea = document.getElementById("message-textarea");
const showEmojiPicker = document.getElementById("showEmojiPicker");
const emojiPicker = document.getElementById("emojiPicker");
const uploadImageIcon = document.getElementById("UploadImage");
const fileInput = document.getElementById("fileInput");
const sendBtn = document.querySelector(".send-btn");
let selectedImageFile = null;

emojiPicker.addEventListener("emoji-click", (event) => {
  messageTextarea.value += event.detail.emoji.unicode;
  emojiPicker.style.display = "none";
});

showEmojiPicker.addEventListener("click", () => {
  if (emojiPicker.style.display === "none" || !emojiPicker.style.display) {
    emojiPicker.style.display = "block";
  } else {
    emojiPicker.style.display = "none";
  }
});

document.addEventListener("click", (event) => {
  if (
    event.target.closest("#emojiPicker") ||
    event.target.closest("#showEmojiPicker")
  ) {
    return;
  }
  emojiPicker.style.display = "none";
});
const messageTypeSelector = document.getElementById("messageTypeSelector");

messageTypeSelector.onchange = () => {
  currentMessageType = messageTypeSelector.value;
  toggleMessageType();
};

const messagesContainer = document.querySelector("#message-list");
let currentMessageType = "";
messagesContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("msg-delete-icon")) {
    handleDeleteClick(event.target);
  } else if (event.target.classList.contains("msg-edit-icon")) {
    document.getElementById("editImagePreview").src = "";
    document.getElementById("editMessageTextArea").value = "";
    handleEditClick(event.target);
  }
});

const handleDeleteClick = (icon) => {
  const isConfirmed = confirm("Are you sure you want to delete this message?");
  if (!isConfirmed) return;

  const channelId = getCurrentChannelID();
  const messageId = icon.getAttribute("message-id");

  http.deleteRequest(`/message/${channelId}/${messageId}`).then((res) => {
    toast("The message has been deleted successfully!", "success");
    window.__MESSAGE_START__ = 0;
    fetchChannelMessage(channelId);
  });
};

const handleEditClick = (icon) => {
  const messageId = icon.getAttribute("editable-msg-id");
  const messageBlock = icon.closest(".message-block");

  if (messageBlock.querySelector(".message-content")) {
    handleEditText(messageBlock);
  } else if (messageBlock.querySelector(".img-thumbnail")) {
    handleEditImage(messageBlock);
  }

  messageTypeSelector.value = currentMessageType;
  toggleMessageType();

  showModalAndSetupSave(messageId, messageBlock);
};

const handleEditText = (messageBlock) => {
  currentMessageType = "text";
  const textArea = document.getElementById("editMessageTextArea");
  const messageContent =
    messageBlock.querySelector(".message-content").textContent;
  textArea.value = messageContent.trim();
};

const handleEditImage = (messageBlock) => {
  currentMessageType = "image";
  const currentImageSrc = messageBlock.querySelector(".img-thumbnail").src;
  const editImagePreview = document.getElementById("editImagePreview");
  const editImageInput = document.getElementById("editImageInput");
  if (currentImageSrc) {
    editImagePreview.src = currentImageSrc;
    editImagePreview.style.display = "block";
  }
  editImageInput.style.display = "block";
  editImageInput.onchange = (event) => {
    handleImageInputChange(event);
  };
};
let newImgChange = "";
const handleImageInputChange = (event) => {
  const file = event.target.files[0];
  const editImagePreview = document.getElementById("editImagePreview");

  if (file) {
    fileToDataUrl(file)
      .then((dataUrl) => {
        editImagePreview.src = dataUrl;
        newImgChange = dataUrl;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
};

const showModalAndSetupSave = (messageId, messageBlock) => {
  const modal = new bootstrap.Modal(
    document.getElementById("editMessageModal")
  );
  modal.show();

  const saveButton = document.getElementById("saveEditedMessage");
  saveButton.onclick = () => {
    handleSaveChanges(messageId, messageBlock, modal);
  };
};

const handleSaveChanges = (messageId, messageBlock, modal) => {
  const channelId = localStorage.getItem("currentChannelID");
  const textArea = document.getElementById("editMessageTextArea");
  const editImagePreview = document.getElementById("editImagePreview");
  let newContent = "";

  if (messageTypeSelector.value === "text") {
    newContent = textArea.value.trim();
    if (
      currentMessageType === "text" &&
      messageBlock.querySelector(".message-content") &&
      newContent ===
        messageBlock.querySelector(".message-content").textContent.trim()
    ) {
      toast(
        "The edited message is same as the original. Please make some changes.",
        "error"
      );
      return;
    }
  } else {
    newContent = newImgChange;
    if (
      currentMessageType === "image" &&
      messageBlock.querySelector(".img-thumbnail") &&
      newContent === messageBlock.querySelector(".img-thumbnail").src
    ) {
      toast(
        "The edited image is same as the original. Please choose a different image.",
        "error"
      );
      return;
    }
  }

  if (!newContent) {
    toast("Please enter a message or choose an image.", "error");
    return;
  }

  let data =
    currentMessageType === "text"
      ? { message: newContent, image: "" }
      : { message: "", image: newContent };
  http.put(`/message/${channelId}/${messageId}`, data).then(() => {
    window.__MESSAGE_START__ = 0;
    fetchChannelMessage(channelId);
    textArea.value = "";
    editImagePreview.src = "";
    newImgChange = "";
    modal.hide();
  });
};

uploadImageIcon.addEventListener("click", () => {
  fileInput.click();
});

sendBtn.addEventListener("click", () => {
  if (!navigator.onLine) {
    toast("You are offline. Cannot send message right now.", "error");
    return;
  }
  let channelId = getCurrentChannelID();
  const trimmedMessage = messageTextarea.value.trim();

  if (!trimmedMessage && !selectedImageFile) {
    toast("Please enter a message or upload an image.", "error");
    return;
  }

  if (trimmedMessage) {
    const textRequestBody = {
      message: trimmedMessage,
    };

    http.post(`/message/${channelId}`, textRequestBody).then(() => {
      messageTextarea.value = "";
      window.__MESSAGE_START__ = 0;
      fetchChannelMessage(channelId);
    });
  }

  if (selectedImageFile) {
    fileToDataUrl(selectedImageFile).then((dataUrl) => {
      const imageRequestBody = {
        image: dataUrl,
      };

      http.post(`/message/${channelId}`, imageRequestBody).then(() => {
        selectedImageFile = null;
        fileInput.value = "";
        document.getElementById("uploadedImagePreview").src = "";
        window.__MESSAGE_START__ = 0;
        fetchChannelMessage(channelId);
      });
    });
  }
});

messageTextarea.addEventListener("keyup", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendBtn.click();
  }
});

const uploadedImagePreview = document.getElementById("uploadedImagePreview");
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    selectedImageFile = fileInput.files[0];

    const imageUrl = URL.createObjectURL(selectedImageFile);
    uploadedImagePreview.src = imageUrl;
    uploadedImagePreview.style.display = "block";
  }
});

document.getElementById("pinned-msg-btn").addEventListener("click", () => {
  let channelId = getCurrentChannelID();
  let allMessages = [];
  let start = 0;

  const getAllMessages = () => {
    if (navigator.onLine) {
      http.get(`/message/${channelId}?start=${start}`).then((data) => {
        if (data.messages && data.messages.length > 0) {
          allMessages = allMessages.concat(data.messages);
          start += data.messages.length;
          getAllMessages();
        } else {
          processMessages(allMessages);
        }
      });
    } else {
      const messages = JSON.parse(localStorage.getItem("channelMessages"));
      processMessages(messages);
    }
  };

  const processMessages = (messages) => {
    console.log(messages.length);
    try {
      localStorage.setItem("channelMessages", JSON.stringify(messages));
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        console.error(
          "LocalStorage quota exceeded while saving channel messages"
        );
      } else {
        console.error(
          "An unexpected error occurred while saving channel messages",
          error
        );
      }
    }

    let pinnedMessagesBody = document.getElementById("pinnedMessagesBody");

    while (pinnedMessagesBody.firstChild) {
      pinnedMessagesBody.removeChild(pinnedMessagesBody.firstChild);
    }

    // Iterate over each message and append to the modal body
    messages.forEach((item) => {
      if (item.pinned) {
        let pinnedMsgContainer = document.createElement("div");
        pinnedMsgContainer.className = "pinned-msg-container";
        const userId = item.sender;

        getUserDetails(userId).then((authorDetails) => {
          const nameAndTime = document.createElement("div");
          nameAndTime.className = "name-and-time";

          const authorName = document.createElement("div");
          authorName.textContent = authorDetails.name;
          authorName.className = "pinned-auth-name";

          const msgTime = document.createElement("div");
          msgTime.textContent = getLatestTimestamp(item);
          msgTime.className = "pinned-msg-time";
          let pinnedContent;

          if (item.message) {
            pinnedContent = document.createElement("div");
            pinnedContent.textContent = item.message;
            pinnedContent.className = "pinned-content";
          } else if (item.image) {
            pinnedContent = document.createElement("img");
            pinnedContent.src = item.image;
            pinnedContent.className = "pinned-image";
          }

          const unpinIcon = document.createElement("img");
          unpinIcon.src = "./assets/x.svg";
          unpinIcon.alt = "x icon";
          unpinIcon.title = "Unpin the message";
          unpinIcon.className = "pin-remove";
          unpinIcon.setAttribute("message-id", item.id);

          nameAndTime.appendChild(authorName);
          nameAndTime.appendChild(msgTime);
          pinnedMsgContainer.appendChild(nameAndTime);
          pinnedMsgContainer.appendChild(pinnedContent);
          pinnedMsgContainer.appendChild(unpinIcon);

          pinnedMessagesBody.appendChild(pinnedMsgContainer);
        });
      }
    });
  };

  getAllMessages();
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("to-pin")) {
    if (!navigator.onLine) {
      toast("You are offline. Cannot pin/unpin right now.", "error");
      return;
    }
    const img = event.target;
    const messageId = img.getAttribute("message-id");
    const channelId = getCurrentChannelID();
    let url;

    if (img.classList.contains("selected")) {
      url = `/message/unpin/${channelId}/${messageId}`;
      img.classList.remove("selected");
    } else {
      url = `/message/pin/${channelId}/${messageId}`;
      img.classList.add("selected");
    }

    http.post(url).then(() => {
      window.__MESSAGE_START__ = 0;
      fetchChannelMessage(channelId);
    });
  }
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("pin-remove")) {
    if (!navigator.onLine) {
      toast("You are offline. Cannot unpin right now.", "error");
      return;
    }
    const img = event.target;
    const messageId = img.getAttribute("message-id");
    const channelId = getCurrentChannelID();
    const url = `/message/unpin/${channelId}/${messageId}`;
    const isConfirmed = confirm("Are you sure you want to unpin this message?");
    if (!isConfirmed) return;

    http.post(url).then(() => {
      const parentContainer = img.closest(".pinned-msg-container");
      if (parentContainer) {
        parentContainer.remove();
        window.__MESSAGE_START__ = 0;
        fetchChannelMessage(channelId);
      }
    });
  }
});

const messageList = document.getElementById("message-list");

messageList.addEventListener("click", (event) => {
  let targetElement = event.target;

  while (
    targetElement &&
    !targetElement.classList.contains("message-left-dom")
  ) {
    targetElement = targetElement.parentElement;
  }

  if (targetElement) {
    const senderId = targetElement.getAttribute("sender-id");
    http.get(`/user/${senderId}`).then((response) => {
      displayUserProfile(response, senderId);
    });
  }
});

const displayUserProfile = (userData) => {
  document.getElementById("profileImage").src = userData.image;
  document.getElementById("profileImage").src = userData.image
    ? userData.image
    : "./assets/default_avatar.svg";
  document.getElementById("profileName").textContent = userData.name;
  document.getElementById("profileEmail").textContent = userData.email;
  document.getElementById("profileBio").textContent = userData.bio;
  const profileModal = new bootstrap.Modal(
    document.getElementById("profileModal")
  );
  profileModal.show();
};

const reactMessage = (emojiCode, messageId) => {
  if (!navigator.onLine) {
    toast("You are offline. Cannot add reaction right now.", "error");
    return;
  }
  const url = `/message/react/${getCurrentChannelID()}/${messageId}`;
  const data = {
    react: emojiCode,
  };

  http.post(url, data).then(() => {
    window.__MESSAGE_START__ = 0;
    fetchChannelMessage(getCurrentChannelID());
  });
};

const unreactMessage = (emojiCode, messageId) => {
  if (!navigator.onLine) {
    toast("You are offline. Cannot unreact message right now.", "error");
    return;
  }
  const url = `/message/unreact/${getCurrentChannelID()}/${messageId}`;
  const data = {
    react: emojiCode,
  };

  http.post(url, data).then(() => {
    window.__MESSAGE_START__ = 0;
    fetchChannelMessage(getCurrentChannelID());
  });
};

const generateReactInfo = (message, userId) => {
  const emojiCodes = [
    "\uD83D\uDC4D",
    "\uD83D\uDE42",
    "\uD83D\uDE4C",
    "\uD83D\uDC94",
  ];
  const reactContainer = document.createElement("div");
  reactContainer.classList.add("react-info");

  emojiCodes.forEach((emojiCode) => {
    const reactCount = message.reacts.filter(
      (item) => item.react === emojiCode
    ).length;

    if (reactCount === 0) return;
    const hasCurrentUserReacted = message.reacts.some(
      (item) => item.react === emojiCode && item.user === userId
    );

    const reactInfoDiv = document.createElement("span");
    reactInfoDiv.className = "react-info-item";
    reactInfoDiv.setAttribute("message-id", message.id);
    if (hasCurrentUserReacted) {
      reactInfoDiv.classList.add("cur-user-reacted");
      reactInfoDiv.title = "unreact to message";
      reactInfoDiv.addEventListener("click", () =>
        unreactMessage(emojiCode, message.id)
      );
    } else {
      reactInfoDiv.title = "react to message";
      reactInfoDiv.addEventListener("click", () =>
        reactMessage(emojiCode, message.id)
      );
    }
    reactInfoDiv.textContent = emojiCode + "  " + reactCount;

    reactContainer.appendChild(reactInfoDiv);
  });

  return reactContainer;
};

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("img-thumbnail")) {
    const carouselInner = document.querySelector(".carousel-inner");
    clearDom(carouselInner);

    const clickedImageSrc = event.target.src;
    let activeIndex = 0;

    const imagesInChannel = document.querySelectorAll(".img-thumbnail");
    imagesInChannel.forEach((img, index) => {
      if (img.src === clickedImageSrc) {
        activeIndex = index;
      }
    });

    imagesInChannel.forEach((img, index) => {
      const slide = document.createElement("div");
      slide.className =
        index === activeIndex ? "carousel-item active" : "carousel-item";

      const slideImage = document.createElement("img");
      slideImage.src = img.src;
      slideImage.className = "d-block w-100";

      slide.appendChild(slideImage);
      carouselInner.appendChild(slide);
    });

    let carouselModal = new bootstrap.Modal(
      document.getElementById("carouselModal")
    );
    carouselModal.show();
  }
});

const toggleMessageType = () => {
  const selector = document.getElementById("messageTypeSelector");
  const textArea = document.getElementById("editMessageTextArea");
  const imageUploadDiv = document.getElementById("imageUploadDiv");
  currentMessageType = selector.value;

  if (selector.value === "text") {
    textArea.style.display = "";
    imageUploadDiv.style.display = "none";
  } else {
    textArea.style.display = "none";
    imageUploadDiv.style.display = "";
  }
};

document.body.addEventListener("change", (event) => {
  if (event.target.id === "editImageInput") {
    handleImageInputChange(event);
  }
});

const getLastMessageIdForChannel = (channelId) => {
  return localStorage.getItem(`lastMessageId_${channelId}`);
};

const setLastMessageIdForChannel = (channelId, messageId) => {
  localStorage.setItem(`lastMessageId_${channelId}`, String(messageId));
};

const setCurrentChannelLastMessageId = (channelId) => {
  http.get(`/message/${channelId}?start=0`).then((response) => {
    const latestMessage = response.messages[0];
    if (latestMessage) {
      setLastMessageIdForChannel(channelId, latestMessage.id);
    }
  });
};

const checkForNewMessages = (channelId) => {
  let lastMessageIdStored = getLastMessageIdForChannel(channelId);
  let lastMessageId = lastMessageIdStored
    ? parseInt(lastMessageIdStored, 10)
    : null;

  http.get(`/message/${channelId}?start=0`).then((response) => {
    const latestMessage = response.messages[0];
    if (!lastMessageIdStored) {
      if (latestMessage) {
        setLastMessageIdForChannel(channelId, latestMessage.id);
      }
    } else if (latestMessage && latestMessage.id > lastMessageId) {
      showNotification(latestMessage);
      setLastMessageIdForChannel(channelId, latestMessage.id);
    }
  });
};

const showNotification = (message) => {
  getUserDetails(message.sender).then((senderDetails) => {
    const toastElement = document.getElementById("show-newmsg-toast");
    const toastBody = document.getElementById("newmsg-toast-body");
    const toastTime = document.getElementById("newmsg-toast-time");

    if (message.message) {
      toastBody.textContent = `${senderDetails.name}: ${message.message}`;
    } else if (message.image) {
      toastBody.textContent = `${senderDetails.name} sent a new image.`;
    }

    toastTime.textContent = timeAgo(message.sentAt);

    const bsToast = new bootstrap.Toast(toastElement, {
      autohide: true,
      delay: 5000,
    });

    bsToast.show();

    toastElement.addEventListener(
      "hidden.bs.toast",
      () => {
        fetchChannelMessage(getCurrentChannelID());
      },
      { once: true }
    );
  });
};

setInterval(() => {
  if (navigator.onLine) {
    const channelId = getCurrentChannelID();
    if (channelId) {
      checkForNewMessages(channelId);
    }
  }
}, 1500);
