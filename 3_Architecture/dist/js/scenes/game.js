class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }
  preload() {
    this.sky;
    this.clouds = [];
    this.grass;
    this.sounds;
    this.anims;
    this.player;
    this.particles;
    this.steps;
    this.isJumping;
    this.cursors;

    this.load.image("sky_23x23", "dist/assets/img/sky.png");
    this.load.image("grass_23x23", "dist/assets/img/grass.png");
    this.load.image("piece", "dist/assets/img/piece.png");
    this.load.image("cloud_300x159", "dist/assets/img/cloud.png");
    this.load.spritesheet("player", "dist/assets/img/spritesheet.png", {
      frameWidth: 300,
      frameHeight: 300,
      endFrame: 8,
    });
    this.load.audio("step_left_1", "dist/assets/sounds/boots_step_left_1.wav");
    this.load.audio("step_left_2", "dist/assets/sounds/boots_step_left_2.wav");
    this.load.audio("step_left_3", "dist/assets/sounds/boots_step_left_3.wav");
    this.load.audio(
      "step_right_1",
      "dist/assets/sounds/boots_step_right_1.wav"
    );
    this.load.audio(
      "step_right_2",
      "dist/assets/sounds/boots_step_right_2.wav"
    );
    this.load.audio(
      "step_right_3",
      "dist/assets/sounds/boots_step_right_3.wav"
    );
    this.load.audio("jump", "dist/assets/sounds/boots_jump.wav");
    this.load.audio("land", "dist/assets/sounds/boots_land.wav");
    this.load.audio("flying", "dist/assets/sounds/flying.wav");

    this.load.audio("music", "dist/assets/sounds/music.mp3");
  }

  create() {
    this.sounds = {
      step_left: [
        this.sound.add("step_left_1"),
        this.sound.add("step_left_2"),
        this.sound.add("step_left_3"),
      ],
      step_right: [
        this.sound.add("step_right_1"),
        this.sound.add("step_right_2"),
        this.sound.add("step_right_2"),
      ],
      jump: this.sound.add("jump"),
      land: this.sound.add("land", { volume: 2 }),
      flying: this.sound.add("flying", { volume: 1.5 }),
      music: this.sound.add("music", { volume: 0.5 }),
    };

    this.anims = {
      jumping: this.anims.create({
        key: "jumping",
        frames: this.anims.generateFrameNumbers("player", { start: 7, end: 6 }),
        frameRate: 10,
        repeat: 0,
      }),
      falling: this.anims.create({
        key: "falling",
        frames: this.anims.generateFrameNumbers("player", { start: 4, end: 5 }),
        frameRate: 5,
        repeat: -1,
      }),
      running: this.anims.create({
        key: "running",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
      }),
    };

    this.sky = this.add
      .tileSprite(
        0,
        0,
        window.config.width / 2,
        window.config.height / 2,
        "sky_23x23"
      )
      .setOrigin(0, 0)
      .setScale(2);
    this.grass = this.add
      .tileSprite(
        0,
        window.config.height - 46,
        window.config.width / 2,
        window.config.height / 4,
        "grass_23x23"
      )
      .setOrigin(0, 0)
      .setScale(2);

    for (let couche = 1; couche <= 3; couche++) {
      for (let t = 0; t < 5; t++) {
        let cloud = this.add
          .image(
            Math.random() * window.config.width - 300 * 0.2 * couche,
            (Math.random() * window.config.height - 159 * 0.2 * couche) / 3,
            "cloud_300x159" // Texture du nuage
          )
          .setOrigin(0, 0)
          .setScale((Math.random() * 0.05 + 0.05) * couche);

        cloud.alpha = 0.9;
        this.clouds.push(cloud);
      }
    }

    this.player = this.physics.add
      .sprite(300 * 0.4, window.config.height - 46 - 300 * 0.4, "player")
      .setScale(0.4);
    this.particles = this.add.particles("piece").createEmitter({
      speed: 1000,
      scale: { start: 0.05, end: 0.05 },
      lifespan: 1000,
      angle: { min: 110, max: 120 },
      quantity: { min: 10, max: 50 },
      tint: [0xcc0000, 0xcc5a00, 0xccab00],
      on: false,
    });
    this.steps = { leftStep: false, lastSoundTime: 0 };
    this.isJumping = false;
    this.particles.startFollow(this.player, -20, 15);
    this.player.anims.play("running", true);
    this.physics.add.existing(this.grass, true);
    this.physics.add.collider(this.player, this.grass);
    this.sounds.music.loop = true;
    this.sounds.music.play();
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    this.sky.tilePositionX = time / 20;
    this.grass.tilePositionX = time / 7.5;
    this.clouds.forEach((cloud) => {
      cloud.x -= ((delta * 30) / 100) * cloud.scale;

      if (cloud.x < 0 - cloud.width) {
        cloud.x = window.config.width;
      }
    });

    if (this.cursors.space.isDown || this.input.activePointer.isDown) {
      this.particles.start();
      this.player.body.velocity.y -= 20;
      this.player.anims.play("jumping", false);
      if (!this.sounds.flying.isPlaying) {
        this.sounds.flying.play();
      }
      if (!this.isJumping) {
        this.player.body.velocity.y = -100;
        this.sounds.jump.play();
        this.isJumping = true;
      }
    } else if (this.player.body.touching.down) {
      this.particles.stop();
      if (this.isJumping) {
        this.sounds.land.play();
        this.isJumping = false;
      }
      if (time / 400 > this.steps.lastSoundTime) {
        this.steps.lastSoundTime = time / 400 + 0.4;
        const rand = Math.floor(Math.random() * 3);
        this.sounds.step_right[rand].play();
        this.steps.leftStep
          ? this.sounds.step_left[rand].play()
          : this.sounds.step_right[rand].play();
        this.steps.leftStep = !this.steps.leftStep;
      }
      if (this.player.flipX === true) {
        this.player.x -= 0.5 * delta;
      }

      this.player.anims.play("running", true);
    } else {
      if (this.sounds.flying.isPlaying) {
        this.sounds.flying.stop();
      }
      this.particles.stop();
      if (this.player.body.velocity.y > 10) {
        this.player.anims.play("falling", true);
      } else {
        this.player.anims.play("jumping", false);
      }
    }

    if (this.cursors.left.isDown) {
      this.player.flipX = true;
      this.player.x -= 0.3 * delta;
      this.particles.setAngle({ min: 30, max: 40 });
      this.particles.startFollow(this.player, 20, 15);
    } else if (this.cursors.right.isDown) {
      this.player.flipX = false;
      this.player.x += 0.3 * delta;
      this.particles.setAngle({ min: 110, max: 120 });
      this.particles.startFollow(this.player, -20, 15);
    } else {
    }

    if (this.player.y < 50) {
      this.player.body.velocity.y = 0;
      this.player.y = 50;
    }
  }
}
export default Game;
