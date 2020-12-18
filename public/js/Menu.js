
class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  init(config) {
    this.config = config;
  }

  create() {
    this.socket = io();

    this.socket.on("full room", () => {
      this.scene.start("Full", this.config);
    });
    this.socket.emit("textures");

    let sprite = [];

    this.socket.on("textures", (textures) => {
      this.add.text(this.config.width / 2 - 140, this.config.height / 2 - 40, "Star Collector", {
        font: "30px Arial",
        fill: "yellow",
        align: "center",
      });

      sprite.forEach((sp) => {
        sp.destroy();
      });

      console.log(sprite);

      for (let i = 0; i < textures.length; i++) {
        sprite[i] = this.add
          .sprite(i * 40 + 140, this.config.height - 200, textures[i])
          .setOrigin(0, 0);

        sprite[i].setInteractive().on("pointerdown", () => {
          this.scene.start("DisplayGame", {
            config: this.config,
            texture: sprite[i].texture.key,
            socket: this.socket,
          });
        });
      }
    });
  }
}

export default Menu;
