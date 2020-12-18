import Menu from "./Menu.js";
import DisplayGame from "./DisplayGame.js";
import Full from "./Full.js";


const config = {

  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 600 },
    },
  },
  scene: [
    {
      preload: preload,
      create: create,
    },
    Menu,
    DisplayGame,
    Full,
  ],
};
const game = new Phaser.Game(config);

/****************************************************************************
 *  PRELOAD                                                                 ***
 *****************************************************************************/
function preload() {
  this.load.image('ground', 'assets/platform.png');
  this.load.image("star", "assets/star.png");
  this.load.image('bomb', 'assets/bomb.png');
  this.load.image('sky', 'assets/sky.png')

  // Players spritesheets
  this.load.spritesheet("player0", "assets/dude.png", {
    frameWidth: 32,
    frameHeight: 32,
  });
  this.load.spritesheet("player1", "assets/male.png", {
    frameWidth: 32,
    frameHeight: 32,
  });
}

function create() {
  this.add.text(20, 50, "Loading game...");

  this.scene.start("Menu", config);
}
