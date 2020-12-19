class Full extends Phaser.Scene {
  constructor() {
    super("Full");
  }

  init(config) {
    this.config = config;
  }

  create() {
    this.add.image(400, 300, 'sky');
    this.add.text(
      this.config.width / 2 - 140,
      this.config.height / 2 - 40,
      "THE ROOM IS FULL\nTRY AGAIN LATER!",
      { font: "30px Arial", fill: "yellow", align: "center" }
    );
  }
}

export default Full;
