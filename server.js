var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io").listen(server);

var players = {};

var bomb;

var star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: (Math.random() * 400),
};

var bomb = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50,
};
var scores = {
  blue: 0,
  red: 0,
};

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  console.log("a user connected:" + socket.id);
  players[socket.id] = {}
  if (Object.keys(players).length > 2) {
    socket.emit("full room");
    delete players[socket.id];
  }

  socket.on("textures", () => {
    io.emit("textures", getTexturesAvailables(players));
  });

  socket.on("texture selected", (textureSelected) => {
    players[socket.id] = {
      x: Math.floor(Math.random() * 700) + 50,
      y: (Math.random() * 400),
      playerId: socket.id,
      team: Math.floor(Math.random() * 2) == 0 ? "red" : "blue",
      texture: textureSelected,
    };
    
    socket.emit("currentPlayers", players);
    socket.emit("starLocation", star);
    socket.emit("scoreUpdate", scores);
    socket.broadcast.emit("newPlayer", players[socket.id]);
    socket.broadcast.emit("textures", getTexturesAvailables(players));
  });

  socket.on("disconnect", function () {
    console.log("user disconnected:" + socket.id);
    delete players[socket.id];
    io.emit("disconnect", socket.id);
  });

  socket.on("playerMovement", function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });

  socket.on("starCollected", function () {
    if (players[socket.id].team === "red") {
      scores.red += 10;
    } else {
      scores.blue += 10;
    }
    star.x = Math.floor(Math.random() * 700) + 80;
    star.y = (Math.random() * 400);
    io.emit("starLocation", star);
    io.emit("bombLocation", bomb);
    io.emit("scoreUpdate", scores);
  });
});

function getTexturesAvailables(players) {
  let textures = [];

  for (let i = 0; i < 2; i++) {
    let used = false;
    let texture = "player" + i;

    for (let id in players) {
      if (players[id].texture == texture) {
        used = true;
      }
    }

    if (!used) {
      textures.push(texture);
    }
  }

  return textures;
}
/*
server.listen(8000, function () {
  console.log(`Listening on http://localhost:${server.address().port}`);
});*/

var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
server.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});
