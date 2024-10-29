const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on *:3000`);
});

var players = {};

io.on("connection", (socket) => {
  console.log("a user is connected: ", socket.id);
  players[socket.id] = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    c: (0xffffff * Math.random()) | 0,
  };
  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", players[socket.id]);
  socket.on("disconnect", function () {
    console.log("Joueur déconnecté: ", socket.id);
    delete players[socket.id];
    io.emit("disconnection", socket.id);
  });
  socket.on("playerMovement", function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
});
