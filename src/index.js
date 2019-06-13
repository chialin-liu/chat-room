const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const {
  getUser,
  removeUser,
  addUser,
  getUsersInRoom
} = require("./utils/users");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 3900;
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));
let count = 0;
io.on("connection", socket => {
  console.log("new websocket connecting");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined in`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    callback();
  });
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter_words = new filter();
    if (filter_words.isProfane(message)) {
      return callback("foul words are not allowed****");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} user has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

server.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
