import Phaser from '../lib/phaser.js'
import config from '../configs/config.js'



export default class GameOver extends Phaser.Scene {
    width
    height

    winBackground
    winScreen
    winScreen1

    winScreenText
    winScreen1Text
    winScreen2Text
    btnAgain

    constructor() {
        super('gameOver')
    }

    init() {
        this.width = config.scale.width
        this.height = config.scale.height
    }

    preload() {
        this.load.setPath('assets/')
        this.load.image('winBackground', 'winBackground.png')
        this.load.image('winScreen', 'winScreen.png')
        this.load.image('winScreen1', 'winScreen1.png')
        this.load.image('btnAgain', 'btnAgain.png')


    }

    create() {
        console.log('я тут')
        const winBackground = this.add.image(this.width / 2, this.height / 2, 'winBackground')
        winBackground.setDisplaySize(this.width, this.height)

        this.btnAgain = this.add.image(this.width / 2, this.height * 0.9, 'btnAgain')
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => {
                this.scene.start('settings')
            })
        this.winScreen1 = this.add.image(this.width / 2, this.height * 0.25, 'winScreen1')
        this.winScreen1Text = this.add.text(this.winScreen1.x, this.winScreen1.y, '',
            {
                fontFamily: 'Inter',
                fontSize: 64,
                align: 'center',
                color: '782B32'
            })
        this.winScreen1Text.setOrigin(0.5, 0.5)


        this.winScreen = this.add.image(this.width / 4, this.height * 0.4, 'winScreen')
        this.winScreenText = this.add.text(this.winScreen.x, this.winScreen.y, '',
            {
                fontFamily: 'Inter',
                fontSize: 48,
                align: 'center',
                color: '782B32'
            })
        this.winScreenText.setOrigin(0.5, 0.5)

        this.winScreen2 = this.add.image(this.width * 3/ 4, this.height * 0.4, 'winScreen')
        this.winScreen2Text = this.add.text(this.winScreen2.x, this.winScreen2.y, '',
            {
                fontFamily: 'Inter',
                fontSize: 48,
                align: 'center',
                color: '782B32'
            })
        this.winScreen2Text.setOrigin(0.5, 0.5)

        const { winUserValue, winBotValue } = this.sys.settings.data;
        console.log(`Player ${winUserValue}, Bot ${winBotValue}`);


        if (winUserValue == winBotValue){
            this.winScreen1Text.setText('Ничья!')
        }
        else if (winUserValue > winBotValue) {
            this.winScreen1Text.setText('Победа!')
        }
        else if (winUserValue < winBotValue) {
            this.winScreen1Text.setText('Поражение!')
        }

        this.winScreenText.setText(`Ваш счет\n${winUserValue}`)
        this.winScreen2Text.setText(`Счет противника\n${winBotValue}`)


    }

    update() {

    }
}
