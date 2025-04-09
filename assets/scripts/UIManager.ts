import { _decorator, Component, director, Node } from 'cc';
import { GridManager } from './GridManager';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Node) homeScreen: Node = null;
    @property(Node) gameUI: Node = null;
    @property(GridManager) gridManager: GridManager = null;

    start() {
        // Only home screen visible on load
        this.homeScreen.active = true;
        this.gameUI.active = false;
    }

    onPlayClicked() {
        this.homeScreen.active = false;
        this.scheduleOnce(() => {
            this.gameUI.active = true;
            
            const loaded = GameManager.getInstance().loadGameState();
            if (!loaded) {
                this.gridManager = this.gameUI.getComponentInChildren(GridManager);
                this.gridManager.generateGrid();
            }
        }, 0.1);
    }

    onPlayAgain() {
        director.loadScene("MainScene");
    }
}
