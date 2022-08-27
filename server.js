const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const filterBadWords = require("bad-words");
const { generateMessage } = require("./views/js/utils/message");

const port = process.env.PORT || 3000;
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("views"));

app.get("/", (req, res) => {
  return res.render("index.html");
});

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.emit("message", generateMessage("welcome"));
  socket.broadcast.emit("message", generateMessage("A new user has joined"));

  socket.on("messageSend", (message, callback) => {
    const filter = new filterBadWords();
    // Validate message
    if (filter.isProfane(message)) return callback("Profanity is not allowed");
    if (message === "") return callback("Message is empty");
    io.emit("message", generateMessage(message));
    callback();
  });

  // listen fo send location event
  socket.on("sendLocation", (message, callback) => {
    // emit location message
    io.emit("locationMessage", generateMessage(`https://www.google.com/maps?q=${message.latitude},${message.longitude}`));
    callback();
  });

  socket.on("disconnect", (socket) => {
    io.emit("message", generateMessage("A user has left"));
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
