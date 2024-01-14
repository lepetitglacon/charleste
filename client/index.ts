import Phaser from "phaser";
import pika from "./assets/img/pika.png"
import wall from "./assets/img/wall.png"
import snail from "./assets/img/snail.png"
import grenade from "./assets/img/grenade.png"
import explosion from "./assets/img/explosion.png"
import explosionAudio from "./assets/sound/explosion.mp3"
import jumpAudio from "./assets/sound/jump.mp3"
import throwAudio from "./assets/sound/throw.mp3"

// custom scene class
export class GameScene extends Phaser.Scene {
    private pikachu: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private wall: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursorKeys: object;
    private inputPayload = {
        left: false,
        right: false,
        up: false,
        down: false,
    };
    private platforms: Phaser.Physics.Arcade.StaticGroup;
    private canJump: boolean;
    private wall2: any;
    private wall3: any;
    private isFacingLeft: Boolean = true;
    private grenades: any[];
    private grenade: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors: object;
    private playerToCursorLine: Phaser.GameObjects.Line;

    preload() {
        this.load.image('snail', snail);
        this.load.image('pika', pika);
        this.load.image('wall', wall);
        this.load.image('grenade', grenade);
        this.load.spritesheet('explosion', explosion, { frameWidth: 64, frameHeight: 64 });

        this.load.audio('audio/explosion', explosionAudio);
        this.load.audio('audio/jump', jumpAudio);
        this.load.audio('audio/throw', throwAudio);
        this.sound.setVolume(1)

        this.cursorKeys = this.input.keyboard.addKeys({
                up:Phaser.Input.Keyboard.KeyCodes.Z,
                down:Phaser.Input.Keyboard.KeyCodes.S,
                left:Phaser.Input.Keyboard.KeyCodes.Q,
                right:Phaser.Input.Keyboard.KeyCodes.D,
                space:Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    create() {
        // create scene
        this.platforms = this.physics.add.staticGroup()

        this.wall = this.platforms.create(800, 500, "wall")
        this.wall.setBodySize(500,25)
        this.wall.setDisplaySize(500,25)

        this.wall2 = this.platforms.create(0, window.innerHeight - 1, "wall")
        this.wall2.setBodySize(10000,25)
        this.wall2.setDisplaySize(10000,25)

        this.wall3 = this.platforms.create(50, 300, "wall")
        this.wall3.setBodySize(500,25)
        this.wall3.setDisplaySize(500,25)

        this.pikachu = this.physics.add.sprite(500, 200, "snail")
        this.pikachu.setDisplaySize(200,80)
        this.pikachu.setBounce(0)
        this.pikachu.setCollideWorldBounds(true);

        this.physics.add.collider(this.pikachu, this.platforms)

        this.playerToCursorLine = this.add.line(
            this.pikachu.x,
            this.pikachu.y,
            this.input.mousePointer.x,
            this.input.mousePointer.y,
            0x333333,
            5
        )

        this.anims.create({
            key: "explosion",
            frameRate: 60,
            frames: this.anims.generateFrameNumbers("explosion", { start: 0, end: 16 }),
            repeat: 0
        });


        window.addEventListener("keypress", e => {
            console.log(e)
            switch (e.key) {
                case 'f': {
                    this.fireGrenade(); break;
                }
            }
        })
        window.addEventListener("click", e => {
            if (e.button === 0) {
                const cursorPosition = new Phaser.Math.Vector2(
                    this.input.mousePointer.x,
                    this.input.mousePointer.y,
                )
                const fireDirectionVector = new Phaser.Math.Vector2()
                fireDirectionVector.setFromObject(this.pikachu)
                fireDirectionVector.subtract(cursorPosition).normalize()
                fireDirectionVector.scale(500)
                this.fireGrenade(fireDirectionVector.negate())
            }
        })

    }

    fireGrenade(velocity = {
        x: 200,
        y: -500
    }) {
        this.sound.play('audio/throw')
        const grenade = this.physics.add.sprite(this.pikachu.x, this.pikachu.y, "grenade")
        grenade.setDisplaySize(64,64)
        grenade.setBounce(0.5)
        grenade.setVelocity(velocity.x, velocity.y)
        grenade.setCollideWorldBounds(true);
        this.physics.add.collider(grenade, this.platforms)
        setTimeout(e => {
            grenade.destroy()
            this.sound.play('audio/explosion')
            const explosion  = this.add.sprite(grenade.x, grenade.y, 'explosion', 0);
            explosion.play("explosion")
            explosion.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                explosion.destroy();
            });
        }, 3000)
    }

    update(time: number, delta: number): void {
        this.playerToCursorLine.setTo(
            this.pikachu.x,
            this.pikachu.y,
            this.input.mousePointer.x,
            this.input.mousePointer.y,
        )

        this.inputPayload.left = this.cursorKeys.left.isDown;
        this.inputPayload.right = this.cursorKeys.right.isDown;
        this.inputPayload.up = this.cursorKeys.space.isDown;
        this.inputPayload.down = this.cursorKeys.down.isDown;

        if (this.cursorKeys.space.isDown && this.pikachu.body.touching.down) {
            this.sound.play('audio/jump')
            this.pikachu.setVelocityY(-500)
        }

        const velocity = 2;
        if (this.inputPayload.left) {
            this.pikachu.x -= velocity;
            if (!this.isFacingLeft) {
                this.pikachu.flipX = false
                this.isFacingLeft = true
            }
        } else if (this.inputPayload.right) {
            this.pikachu.x += velocity;
            if (this.isFacingLeft) {
                this.pikachu.flipX = true
                this.isFacingLeft = false
            }
        }
    }
}

// game config
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#0eb8ec',
    parent: 'phaser-example',
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    pixelArt: true,
    scene: [ GameScene ],
};

// instantiate the game
const game = new Phaser.Game(config);