class Menu extends Phaser.Scene {
  constructor() {
    super("Menu");
  }
  preload() {
    this.load.image("lego", "assets/img/lego.png");
  }
  create() {
    this.add.image(800, 600, "lego");
    this.add
      .text(250, 150, "Jeu Lego", {
        font: "32px Arial",
        fill: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    this.clickButton = this.add
      .text(200, 400, "Start Game", { fill: "#0f0" })
      .setInteractive()
      .on("pointerdown", () => {
        this.scene.start("Game");
      });
  }

  update(time, delta) {}
  buttonClickDown() {
    this.scene.start("Game");
  }
  enterButtonHoverState() {
    this.clickButton.setStyle({ fill: "#ff0" });
  }
  enterButtonRestState() {
    this.clickButton.setStyle({ fill: "#0f0" });
  }
}
export default Menu;
