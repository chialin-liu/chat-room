const socket = io();
socket.on("message", message => {
  console.log(message);
});
//retrieve the input
document.querySelector("#message-form").addEventListener("submit", e => {
  e.preventDefault();
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message);
});
//retrieve the location
document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Browser is too old to get geolocation");
  }
  navigator.geolocation.getCurrentPosition(position => {
    // console.log(position);
    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  });
});
