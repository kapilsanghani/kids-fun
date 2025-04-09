import { _decorator, Component, Node, Vec3, tween, find, Sprite, SpriteFrame } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Card')
export class Card extends Component {

    @property(Node) front: Node = null;
    @property(Node) back: Node = null;

    isFlipped = false;
    cardId: number = 0;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.flip, this);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this.flip, this);
    }

    // Flips the card to show the front side.
    flip() {
        if (this.isFlipped) return;

        this.isFlipped = true;

        tween(this.node)
            .to(0.2, { eulerAngles: new Vec3(0, 90, 0) }) // halfway rotate
            .call(() => {
                this.front.active = true;
                this.back.active = false;
            })
            .to(0.2, { eulerAngles: new Vec3(0, 180, 0) }) // finish rotate
            .start();
    }

    // Resets the card to its original state (back facing up).
    resetFlip() {
        this.isFlipped = false;
        this.front.active = false;
        this.back.active = true;
        this.node.eulerAngles = new Vec3(0, 0, 0);
    }

    // Assigns the front sprite image for the card face.
    setFrontSprite(spriteFrame: SpriteFrame) {
        this.front.getComponent(Sprite).spriteFrame = spriteFrame;
    }
}