import Phaser from '../lib/phaser.js'
import config from '../configs/config.js'

export default class Settings extends Phaser.Scene {
    width
    height

    rules
    btnRulesOk

    constructor() {
        super('settings')
    }

    init() {
        this.width = config.scale.width
        this.height = config.scale.height
    }

    preload() {
        this.load.setPath('assets/')
        this.load.image('background1', 'background1.png')
        this.load.image('btnAgainstBot', 'btnAgainstBot.png')
        this.load.image('btnAgainstPlayer', 'btnAgainstPlayer.png')
        this.load.image('btnRules', 'btnRules.png')
        this.load.image('rules', 'rules.png')
        this.load.image('btnRulesOk', 'btnRulesOk.png')

        
    }

    create() {
        const background = this.add.image(this.width / 2, this.height / 2, 'background1')
        background.setDisplaySize(this.width, this.height)


        const btnAgainstBot = this.add.image(this.width / 2, this.height / 4, 'btnAgainstBot')
        btnAgainstBot
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => {
                this.scene.start('gameAgainstBot');
            });



        const btnAgainstPlayer = this.add.image(this.width / 2, btnAgainstBot.y + 400, 'btnAgainstPlayer')
        btnAgainstPlayer
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => {

                const socket = new WebSocket('wss://golden-chest-anastas1a.onrender.com/ws/game/');

                socket.addEventListener('open', (event) => {
                    console.log('WebSocket connection established');
                    socket.send(JSON.stringify({ message: 'start_game' }));
                });

                socket.addEventListener('close', (event) => {
                    console.log('WebSocket connection closed');
                });

                socket.addEventListener('message', (event) => {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message received:', message);
                    if (message.success) {
                        socket.close()
                        this.scene.start('gameAgainstPlayer', { token: message.token, gameId: message.game_id, secondPlayer: message.second_player });
                    } else {
                        console.error('Error:', message.error);
                    }
                });

            })


        this.rules = this.add.image(this.width / 2, this.height / 2, 'rules').setVisible(false)
        this.btnRulesOk = this.add.image(this.width / 2, (this.height + 1370) / 2, 'btnRulesOk')
        .setInteractive({ useHandCursor: true })    
        .setVisible(false)
            .on('pointerup', () => {
                btnAgainstBot.setVisible(true)
                btnAgainstPlayer.setVisible(true)
                btnRules.setVisible(true)
                this.rules.setVisible(false)
                this.btnRulesOk.setVisible(false)
            })
    

        const btnRules = this.add.image(this.width / 2, btnAgainstPlayer.y + 400, 'btnRules')
        btnRules
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => {
                btnAgainstBot.setVisible(false)
                btnAgainstPlayer.setVisible(false)
                btnRules.setVisible(false)
                this.rules.setVisible(true)
                this.btnRulesOk.setVisible(true)
            })
    }
    update() {}
}