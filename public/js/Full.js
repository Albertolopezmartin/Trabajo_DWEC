class Full extends Phaser.Scene {
  constructor() {
    super("Full");
  }

  init(config) {
    this.config = config;
  }

  create() {
    this.add.text(
      this.config.width / 2 - 180,
      this.config.height / 2 - 40,
      "There are already 2 players\nTry later!",
      { font: "30px Arial", fill: "yellow", align: "center" }
    );
  }
}

export default Full;
