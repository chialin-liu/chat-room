const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
socket.on("message", message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createAt: moment(message.createAt).format("H:mm")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});
//retrieve the input
$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, error => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("message delivered");
  });
});
socket.on("locationMessage", message => {
  // console.log(url);
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    createAt: moment(message.createAt).format("H:mm")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});
//retrieve the location
$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Browser is too old to get geolocation");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition(position => {
    // console.log(position);
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("location received");
      }
    );
  });
});
