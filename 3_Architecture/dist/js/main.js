import Menu from "./scenes/menu.js";
import Game from "./scenes/game.js";
window.config = {
  width: window.innerWidth / 1.5,
  height: window.innerHeight,
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  type: Phaser.AUTO,
  scene: [Menu, Game],
  backgroundColor: "#2d2d2d",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
      debug: false,
    },
  },
};
const game = new Phaser.Game(window.config);
