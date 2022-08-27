const socket = io();

const formSelector = document.querySelector("#myForm");
const messageFormBtn = document.querySelector("#btn-message");
const sendLocationBtn = document.querySelector("#location");
const messagesElement = document.querySelector("#messages");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    message,
  });
  messagesElement.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (url) => {
  const html = Mustache.render(locationTemplate, {
    url,
  });
  messagesElement.insertAdjacentHTML("beforeend", html);
});

formSelector.addEventListener("submit", function (e) {
  e.preventDefault(); //stop form from submitting
  messageFormBtn.setAttribute("disabled", "disabled"); //disable button while sending message
  const messageFormInput = document.getElementById("message");
  // Save message
  const message = messageFormInput.value;
  // clear input field
  messageFormInput.value = "";

  socket.emit("messageSend", message, (error) => {
    messageFormBtn.removeAttribute("disabled"); //enable button after sending message
    messageFormInput.focus(); //focus on input field
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});

sendLocationBtn.addEventListener("click", function (e) {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  sendLocationBtn.setAttribute("disabled", "disabled"); //disable button while sending message

  navigator.geolocation.getCurrentPosition(function (position) {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        sendLocationBtn.removeAttribute("disabled"); //enable button after sending message
      },
    );
  });
});

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("Clicked");
//   socket.emit("increment");
// });
