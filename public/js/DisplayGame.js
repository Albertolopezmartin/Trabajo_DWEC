var platforms;

class DisplayGame extends Phaser.Scene {
  constructor() {
    super("DisplayGame");
  }

  init(data) {
    this.config = data.config;
    this.socket = data.socket;

    this.socket.emit("texture selected", data.texture);
  }

  preload()
	{
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('ground', 'assets/platform.png');
	}

  create() {
    var self = this;
    this.add.image(400, 300, 'sky');
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    this.otherPlayers = this.physics.add.group();

    this.socket.on("currentPlayers", function (players) {
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === self.socket.id) {
          
          addPlayer(self, players[id]);
        } else {
          addOtherPlayers(self, players[id]);
        }
      });
    });

    this.socket.on("newPlayer", function (playerInfo) {
      addOtherPlayers(self, playerInfo);
    });

    this.socket.on("disconnect", function (playerId) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });

    this.socket.on("playerMoved", function (playerInfo) {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });

    this.blueScoreText = this.add.text(16, 16, "", {
      fontSize: "32px",
      fill: "#0000FF",
    });
    this.redScoreText = this.add.text(584, 16, "", {
      fontSize: "32px",
      fill: "#FF0000",
    });

    this.socket.on("scoreUpdate", function (scores) {
      self.blueScoreText.setText("Blue: " + scores.blue);
      self.redScoreText.setText("Red: " + scores.red);
    });

    this.youLooseText = this.add.text(this.config.width / 2 - 140, this.config.height / 2 - 40, "", {
      font: "30px Arial",
      fill: "yellow",
      align: "center",
    });
    
    this.socket.on("bombLocation", function (bombLocation) {
      if (self.bomb) self.bomb.destroy();
      self.bomb = self.physics.add.image(bombLocation.x, bombLocation.y, "bomb");
      self.physics.add.collider(self.bomb, platforms);
      self.bomb.setBounce(1);
      self.bomb.setCollideWorldBounds(true);
      self.bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      self.allowGravity = false;
      self.physics.add.overlap(
        self.char,
        self.bomb,
        function () {
          self.bomb.destroy();
          self.char.setTint(0xff0000);
          self.youLooseText.setText("You Loose!");
          self.physics.pause();
          self.youLooseText.setInteractive().on("pointerdown", () => {
            self.scene.start("Menu");
          });
        },
        null,
        self
      );
    
    });

    this.socket.on("starLocation", function (starLocation) {
      if (self.star) self.star.destroy();
      self.star = self.physics.add.image(starLocation.x, starLocation.y, "star");
      self.star.setBounce(0.35);
      self.physics.add.collider(self.star, platforms);
      self.physics.add.overlap(
        self.char,
        self.star,
        function () {
          this.socket.emit("starCollected");
        },
        null,
        self
      );
    
    });

    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.physics.add.collider(this.otherPlayers, platforms);

    
  } //CREATE

  update() {
    if (this.char) {

      if (
        this.cursors.left.isDown ||
        this.cursors.right.isDown ||
        this.cursors.up.isDown
      ) {

        if (this.cursors.left.isDown)
        {
          this.char.setVelocityX(-160);
        }
        else if (this.cursors.right.isDown)
        {
          this.char.setVelocityX(160);
        }

        if (this.cursors.up.isDown && this.char.body.touching.down)
        {
          this.char.setVelocityY(-530);
        }

      } else {
        this.char.setVelocityX(0);
      }

      this.char.setBounce(0.2);
      this.char.setCollideWorldBounds(true);

      var x = this.char.x;
      var y = this.char.y;

      if (
        this.char.oldPosition &&
        (x !== this.char.oldPosition.x || y !== this.char.oldPosition.y)
      ) {
        this.socket.emit("playerMovement", {
          x: this.char.x,
          y: this.char.y,
        });
      }

      this.char.oldPosition = {
        x: this.char.x,
        y: this.char.y,
      };
    }
  }
}

function addPlayer(self, playerInfo) {
  self.char = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, playerInfo.texture)
    .setOrigin(0.5, 0.5);
  self.physics.add.collider(self.char, platforms);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add
    .sprite(playerInfo.x, playerInfo.y, playerInfo.texture)
    .setOrigin(0.5, 0.5);
  
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

export default DisplayGame;
