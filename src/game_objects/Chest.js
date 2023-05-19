export default class Chest extends Phaser.GameObjects.Container {
    value
    winText
    chest
    anim
    isClosed
    index

    constructor(scene, x, y, width, height, image) {
        super(scene, x, y)

        const chest = scene.add.image(width / 2, height / 2, image)
        chest
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => {
                this.scene.chestClick(this.index)
            })

        this.value = this.getRandomValue()
        this.isClosed = true

        const winText = scene.add.text(width / 2, height / 2, `${this.value}`, {
            fontFamily: 'Inter',
            fontSize: 48
        })
        winText
            .setVisible(false)
            .setOrigin(0.5, 0.5)

        const anim = this.scene.add.sprite(chest.x, chest.y, 'atlas')
        anim.setVisible(false)

        this.add([chest, anim, winText])

        this.chest = this.list[0]
        this.anim = this.list[1]
        this.winText = this.list[2]
    }

    getRandomValue() {
        return Math.floor(Math.random() * 10)
    }

    playOpenChestAnimation(onCompleteCallback) {

        this.chest.setVisible(false)
        this.anim.setVisible(true)

        this.anim.play('animation_key')
        this.anim.on('animationcomplete', () => {
            this.isClosed = false
            onCompleteCallback()
        })
    }

    playTextAnimation(value) {
        if (value) {
            this.winText.setText(value)
        } else {
            this.winText.setText(this.value)
        }
        this.winText.setVisible(true)

        const tween = this.scene.tweens.add({
            targets: this.winText,
            scale: { from: 1, to: 1.7 },
            y: { from: 70, to: 0 },
            duration: 600,
            yoyo: true,
            onComplete: () => {
                this.winText.setVisible(false)
            }
        })
    }
}