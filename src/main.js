import Phaser from './lib/phaser.js'
import config from './configs/config.js'
import Settings from './scenes/Settings.js'
import GameAgainstBot from './scenes/GameAgainstBot.js'
import GameAgainstPlayer from './scenes/GameAgainstPlayer.js'
import GameOver from './scenes/GameOver.js';

class GoldenChest extends Phaser.Game {
    constructor() {
        super(config);
        this.scene.add('settings', Settings);
        this.scene.add('gameAgainstBot', GameAgainstBot);
        this.scene.add('gameAgainstPlayer', GameAgainstPlayer);
        this.scene.add('gameOver', GameOver)
        this.scene.start('settings');
    }

}

window.game = new GoldenChest();
