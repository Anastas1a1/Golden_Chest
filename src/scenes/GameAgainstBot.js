import Phaser from '../lib/phaser.js'
import config from '../configs/config.js'
import Chest from '../game_objects/Chest.js'


export default class GameAgainstBot extends Phaser.Scene {
    width
    height

    chestContainer

    winUserValue
    winBotValue

    pickWinText
    pickWinBackground

    headerYourTurn
    headerWaitTurn

    btnSounds
    btnInfo
    rules
    btnRulesOk

    backSound
    soundFlag

    chestEmpty
    chestGold
    win

    constructor() {
        super('gameAgainstBot')
    }

    init() {
        this.width = config.scale.width
        this.height = config.scale.height
        this.winUserValue = 0
        this.winBotValue = 0
    }

    preload() {
        this.load.setPath('assets/')
        this.load.image('background', 'background.png')
        this.load.image('btnInfo', 'btnInfo.png')
        this.load.image('btnSounds', 'btnSounds.png')
        this.load.image('rules', 'rules.png')
        this.load.image('btnRulesOk', 'btnRulesOk.png')
        this.load.image('chest', 'cl_box.png')
        this.load.image('btnPickWin', 'btnPickWin.png')
        this.load.image('headerYourTurn', 'headerYourTurn.png')
        this.load.image('headerWaitTurn', 'headerWaitTurn.png')
        this.load.atlas('atlas', 'animation.png', 'animation.json')

        this.load.setPath('audio/')
        this.load.audio('chestEmpty', ['chestEmpty.ogg', 'chestEmpty.mp3'])
        this.load.audio('chestGold', ['chestGold.ogg', 'chestGold.mp3'])
        this.load.audio('win', ['win.ogg', 'win.mp3'])
        this.load.audio('backSound', ['backSound.ogg', 'backSound.mp3'])
    }

    create() {
        const background = this.add.image(this.width / 2, this.height / 2, 'background')
        background.setDisplaySize(this.width, this.height)

        let chestWidth = 240
        let chestHeight = 215
        let chestPaddingLeft = 110
        let chestPaddingTop = 80
        let headerHeight = 100

        this.chestContainer = this.add.container(
            (this.width - 3 * chestWidth - 2 * chestPaddingLeft) / 2,
            (this.height - 5 * chestHeight - 4 * chestPaddingTop) / 2
        )

        let index = -1
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                index++
                const chest = new Chest(
                    this,
                    j * (chestWidth + chestPaddingLeft),
                    i * (chestHeight + chestPaddingTop),
                    chestWidth,
                    chestHeight,
                    'chest'
                )
                chest.index = index
                this.chestContainer.add(chest)
            }
        }

        this.anims.create({
            key: 'animation_key',
            frames: this.anims.generateFrameNames('atlas', {
                prefix: 'sprite-',
                start: 0,
                end: 5,
                zeroPad: 1
            }),
            frameRate: 15
        })

        this.pickWinBackground = this.add.image(this.width / 2, this.height - 175 * 0.5, 'btnPickWin')
            .setInteractive({ useHandCursor: true })
            .setVisible(false)
            .on('pointerup', () => {
                this.backSound.stop()
                this.win.play()
                this.scene.start('gameOver', { winUserValue: this.winUserValue, winBotValue: this.winBotValue })
            })

        this.headerYourTurn = this.add.image(this.width / 2, headerHeight, 'headerYourTurn')

        this.headerWaitTurn = this.add.image(this.width / 2, headerHeight, 'headerWaitTurn')
            .setVisible(false)

        this.pickWinText = this.add.text(this.pickWinBackground.x, this.pickWinBackground.y, '',
            {
                fontFamily: 'Inter',
                fontSize: 48,
                align: 'center'
            })
        this.pickWinText.setOrigin(0.5, 0.5)


        this.rules = this.add.image(this.width / 2, this.height / 2, 'rules').setVisible(false)
        this.btnRulesOk = this.add.image(this.width / 2, (this.height + 1370) / 2, 'btnRulesOk')
            .setInteractive({ useHandCursor: true })
            .setVisible(false)
            .on('pointerup', () => {

                this.chestContainer.list.forEach((_chest) => {
                    _chest.setVisible(true)
                })
                this.pickWinBackground.setVisible(true)
                this.pickWinText.setVisible(true)

                this.rules.setVisible(false)
                this.btnRulesOk.setVisible(false)
            })

        this.btnInfo = this.add.image(this.width * 0.93, headerHeight, 'btnInfo')
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => {

                this.chestContainer.list.forEach((_chest) => {
                    _chest.setVisible(false)
                })

                this.headerWaitTurn.setVisible(false)
                this.headerYourTurn.setVisible(false)

                this.pickWinBackground.setVisible(false)
                this.pickWinText.setVisible(false)

                this.rules.setVisible(true)
                this.btnRulesOk.setVisible(true)
            })


        this.chestEmpty = this.sound.add('chestEmpty')
        this.chestGold = this.sound.add('chestGold')
        this.win = this.sound.add('win')

        this.backSound = this.sound.add('backSound')        
        this.soundFlag = false
        this.backSound.play({
            loop: true
        })
        this.btnSounds = this.add.image(this.width * 0.07, headerHeight, 'btnSounds')
        .setInteractive({ useHandCursor: true })
        .on('pointerup', () => {
            if (this.soundFlag){
                this.backSound.play({
                    loop: true
                })
                this.soundFlag = false
            }
            else {
                this.backSound.stop()
                this.soundFlag = true
            }
        })

    }

    update() {
    }

    chestClick(index) {
        this.headerYourTurn.setVisible(false)
        this.headerWaitTurn.setVisible(true)
        this.chestContainer.list.forEach((_chest) => {
            _chest.chest.disableInteractive()
        })
        this.chestGold.play()
        this.chestContainer.list[index].playTextAnimation()
        this.chestContainer.list[index].playOpenChestAnimation(() => {
            this.userMove(this.chestContainer.list[index].value)
        })
    }

    userMove(value) {
        this.pickWinBackground.setVisible(true)

        if (value === 0) {
            this.winUserValue = value
            this.pickWinText.setText('Вы проиграли')
            this.pickWinText.setInteractive({ useHandCursor: false })
            this.backSound.stop()
            this.win.play()
            this.scene.start('gameOver', { winUserValue: this.winUserValue, winBotValue: this.winBotValue })

        }
        else {
            this.winUserValue += value
            this.pickWinText.setText(`Забрать выигрыш\n${this.winUserValue}`)
            this.botMove()
        }
    }


    botMove() {
        let closedChests = this.chestContainer.list.filter(chests => chests.isClosed);
        if (closedChests !== undefined && closedChests.length > 0) {

            let indexesOfClosedChests = closedChests.map(chest => this.chestContainer.list.indexOf(chest));
            let randomIndex = Phaser.Math.RND.pick(indexesOfClosedChests);
            let value = this.chestContainer.list[randomIndex].value

            if (this.chestContainer.list[randomIndex]) {
                this.chestEmpty.play()
                this.chestContainer.list[randomIndex].playOpenChestAnimation(() => {
                    this.headerYourTurn.setVisible(true)
                    this.headerWaitTurn.setVisible(false)
                    closedChests.forEach((_chest) => {
                        _chest.chest.setInteractive();
                    })
                });

                if (value === 0) {
                    this.winBotValue = value;
                    this.win.play()
                    this.backSound.stop()
                    this.scene.start('gameOver', { winUserValue: this.winUserValue, winBotValue: this.winBotValue })
                }
                else {
                    this.winBotValue += value;
                }

            } else {
                console.error(`Error: Element with index ${randomIndex} does not exist in chestContainer list.`);
            }
        } else {
            console.log('Все открыты')
            this.win.play()
            this.backSound.stop()
            this.scene.start('gameOver', { winUserValue: this.winUserValue, winBotValue: this.winBotValue })
        }
    }

}
