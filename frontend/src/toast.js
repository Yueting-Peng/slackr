export const toast = (message, type) => {
  // Get the toast element
  const toastElement = document.getElementById("myToast");

  // Get the toast body and time element
  const toastBody = toastElement.querySelector(".toast-body");
  const toastTime = toastElement.querySelector(".toast-time");
  const typeEle = toastElement.querySelector(".me-auto");

  // Update the toast message and time
  toastBody.textContent = message;
  toastTime.textContent = new Date().toLocaleTimeString();
  typeEle.textContent = type;

  // Update the toast type (if you want to modify its style based on the type)
  toastElement.classList.remove("success", "error"); // Assuming you have these classes defined
  toastElement.classList.add(type);

  // Using Bootstrap's Toast method to show the toast
  const bsToast = new bootstrap.Toast(toastElement, {
    autohide: true, // Hide it automatically
    delay: 5000, // Hide it after 5 seconds
  });

  bsToast.show();
};
