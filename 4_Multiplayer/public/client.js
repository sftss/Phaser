var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};
var game = new Phaser.Game(config);
var player, cursors, otherPlayers, socket;

function preload() {
  this.load.spritesheet("dude", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  var self = this;
  socket = io();
  otherPlayers = this.physics.add.group();

  socket.on("currentPlayers", function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  socket.on("newPlayer", function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  socket.on("disconnection", function (playerId) {
    otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  socket.on("playerMoved", function (playerInfo) {
    otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  cursors = this.input.keyboard.createCursorKeys();

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });
}
function update() {
  if (player) {
    player.setVelocity(0);
    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play("right", true);
    }
    if (cursors.up.isDown) {
      player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
      player.setVelocityY(160);
    }
    if (
      !cursors.left.isDown &&
      !cursors.right.isDown &&
      !cursors.up.isDown &&
      !cursors.down.isDown
    ) {
      player.anims.play("turn");
    }
    var x = player.x;
    var y = player.y;
    socket.emit("playerMovement", { x: x, y: y });
  }
}
function addPlayer(self, playerInfo) {
  player = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, "dude", 4)
    .setTint(playerInfo.c);
  player.setCollideWorldBounds(true);
}
function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, "dude", 4)
    .setTint(playerInfo.c);
  otherPlayer.playerId = playerInfo.playerId;
  otherPlayers.add(otherPlayer);
}
