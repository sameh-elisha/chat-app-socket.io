const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./views/js/utils/message");

const port = process.env.PORT || 3000;
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("views"));

app.get("/", (req, res) => {
  return res.render("index.html");
});

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.emit("message", generateMessage("Welcome!"));
  socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) return callback("Profanity is not allowed!");
    if (message == "") {
      callback();
      return;
    }
    io.emit("message", generateMessage(message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit("locationMessage", generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left!"));
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
