import Phaser from '../lib/phaser.js'
import config from '../configs/config.js'
import Chest from '../game_objects/Chest.js'


export default class GameAgainstPlayer extends Phaser.Scene {
    width
    height

    chestContainer
    loadContainer
    btnBackSettings

    winUserValue
    winBotValue

    pickWinText
    pickWinBackground

    headerYourTurn
    headerWaitTurn
    headerLoadOpponent

    btnInfo
    rules
    btnRulesOk

    socket
    token
    gameId
    secondPlayer

    backSound
    soundFlag

    chestEmpty
    chestGold
    win


    constructor() {
        super('gameAgainstPlayer')
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
        this.load.atlas('wheelLoader', 'wheelLoader.png', 'wheelLoader.json')
        this.load.image('btnBackSettings', 'btnBackSettings.png')
        this.load.image('btnInfo', 'btnInfo.png')
        this.load.image('btnSounds', 'btnSounds.png')
        this.load.image('rules', 'rules.png')
        this.load.image('btnRulesOk', 'btnRulesOk.png')
        this.load.image('chest', 'cl_box.png')
        this.load.image('btnPickWin', 'btnPickWin.png')
        this.load.image('headerYourTurn', 'headerYourTurn.png')
        this.load.image('headerWaitTurn', 'headerWaitTurn.png')
        this.load.image('headerLoadOpponent', 'headerLoadOpponent.png')
        this.load.atlas('atlas', 'animation.png', 'animation.json')

        this.load.setPath('audio/')

        this.load.audio('chestEmpty', ['chestEmpty.ogg', 'chestEmpty.mp3'])
        this.load.audio('chestGold', ['chestGold.ogg', 'chestGold.mp3'])
        this.load.audio('win', ['win.ogg', 'win.mp3'])
        this.load.audio('backSound', ['backSound.ogg', 'backSound.mp3'])

    }

    create() {
        const { token, gameId, secondPlayer } = this.sys.settings.data;
        console.log(`Token ${token}, GameId ${gameId}, secondPlayer ${secondPlayer}`);
        this.socket = new WebSocket(`wss://golden-chest-anastas1a.onrender.com/ws/golden_chest/${gameId}/?token=${token}`);

        this.socket.addEventListener('close', (event) => {
            this.backSound.stop()
            console.log('WebSocket connection closed')
        });

        this.socket.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            console.log('WebSocket game_id message received:', message);
            if (message.success) {
                this.userMove(message)
            }
            else if (message.groupSuccess) {
                if (message.turn == token) {
                    if (message.boxNumber == 15) {
                        this.stopLoad()
                    } else {
                        this.firstUser()
                    }        

                } else {
                    this.firstUser()
                    this.secUser(message)
                }

            } else if (message.groupGameOverSuccess) {
                this.socket.close()
                setTimeout(() => {
                    this.win.play()
                    if (message.turn == token) {
                        this.scene.start('gameOver', { winUserValue: message.currentScore, winBotValue: message.opponentScore })
                    } else {
                        this.scene.start('gameOver', { winUserValue: message.opponentScore, winBotValue: message.currentScore })
                    }
                  }, 700);

            } else {
                console.error('Error:', message.error);
            }
        });

        this.token = token
        this.secondPlayer = secondPlayer


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
            .on('pointerup', () => {
                this.socket.send(JSON.stringify({ box_number: 'game_over' }));
            })
            .setVisible(false)

        this.headerWaitTurn = this.add.image(this.width / 2, headerHeight, 'headerWaitTurn')
            .setVisible(false)

        this.headerYourTurn = this.add.image(this.width / 2, headerHeight, 'headerYourTurn')

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
                this.pickWinBackground.setVisible(false)
                this.pickWinText.setVisible(false)

                this.rules.setVisible(true)
                this.btnRulesOk.setVisible(true)
            })


        if (!this.secondPlayer) {
            this.loadingOpponent()
            this.socket.addEventListener('open', (event) => {
                console.log('WebSocket connection');
            });

        } else {
            this.socket.addEventListener('open', (event) => {
                console.log('WebSocket connection');
                this.socket.send(JSON.stringify({ box_number: 15 }));
            });
        }

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

    loadingOpponent() {
        this.btnInfo.setVisible(false)
        this.pickWinBackground.setVisible(false)
        this.chestContainer.list.forEach((_chest) => {
            _chest.setVisible(false)
        })

        this.loadContainer = this.add.container(0, 0);

        this.anims.create({
            key: 'wheelLoader_key',
            frames: this.anims.generateFrameNames('wheelLoader', {
                prefix: 'sprite-',
                start: 0,
                end: 4,
                zeroPad: 1
            }),
            frameRate: 15,
            repeat: -1
        })

        const spriteWheelLoader = this.add.sprite(this.width / 2, this.height / 2, 'wheelLoader_key')
        spriteWheelLoader.anims.play('wheelLoader_key', true)

        this.headerLoadOpponent = this.add.image(this.width / 2, 100, 'headerLoadOpponent')
        this.loadContainer.add(spriteWheelLoader)
        this.loadContainer.add(this.headerLoadOpponent)

        this.btnBackSettings = this.add.image(this.width / 2, this.height * 0.85 , 'btnBackSettings')
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => {
                if (this.socket) {
                    this.backSound.stop()
                    this.socket.close();
                }
                this.scene.start('settings')
            })
        this.loadContainer.add(this.btnBackSettings)
    }

    stopLoad() {
        this.loadContainer.destroy()
        this.btnInfo.setVisible(true)
        this.chestContainer.list.forEach((_chest) => {
            _chest.setVisible(true)
        })
    }

    update() {
    }


    chestClick(index) {
        console.log('отправляю сокет')

        console.log('box_number:', index)
        this.socket.send(JSON.stringify({ box_number: index }));

        this.chestContainer.list[index].playOpenChestAnimation(() => { })

        this.headerYourTurn.setVisible(false)
        this.headerWaitTurn.setVisible(true)
        this.chestContainer.list.forEach((_chest) => {
            _chest.chest.disableInteractive()
        })

    }


    userMove(message) {

        console.log('Value  ', message.value)
        if (message.value != 0)
            this.chestGold.play()
        else this.chestEmpty.play()
        this.chestContainer.list[message.boxNumber].playTextAnimation(message.value)

        this.winUserValue = message.score
        console.log(this.winUserValue)
        if (this.winUserValue != 0)
            this.pickWinBackground.setVisible(true)
        this.pickWinText.setText(`Забрать выигрыш\n${this.winUserValue}`)
        this.socket.send(JSON.stringify({ box_number: message.boxNumber }));

        if (message.value == 0 && message.boxNumber != 15) {
            this.socket.send(JSON.stringify({ box_number: 'game_over' }));
        }
    }


    firstUser() {
        this.headerYourTurn.setVisible(true)
        this.headerWaitTurn.setVisible(false)
        this.chestContainer.list.forEach((_chest) => {
            _chest.chest.setInteractive();
        })
        console.log(this.winUserValue)
        if (this.winUserValue != 0)
            this.pickWinBackground.setInteractive()
    }

    secUser(message) {
        if (message.boxNumber != 15){
            this.chestEmpty.play()
            this.chestContainer.list[message.boxNumber].playOpenChestAnimation(() => { })
        }
        this.headerYourTurn.setVisible(false)
        this.headerWaitTurn.setVisible(true)
        this.chestContainer.list.forEach((_chest) => {
            _chest.chest.disableInteractive()
        })
        this.pickWinBackground.disableInteractive()

    }


    shutdown() {
        console.log('выход')
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.backSound.stop()
            this.socket.close();
        }
    }
}
