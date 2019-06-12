const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const filter = require("bad-words");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.port | 3900;
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));
let count = 0;
io.on("connection", socket => {
  console.log("new websocket connecting");

  socket.emit("message", "Welcome!");
  socket.broadcast.emit("message", "A new user has joined");
  socket.on("sendMessage", (message, callback) => {
    const filter_words = new filter();
    if (filter_words.isProfane(message)) {
      return callback("foul words are not allowed****");
    }
    io.emit("message", message);
    callback();
  });
  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "message",
      `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    );
    callback();
  });
  socket.on("disconnect", () => {
    io.emit("message", "A user has left");
  });
});
server.listen(port, () => {
  console.log(`server is running on ${port}`);
});
