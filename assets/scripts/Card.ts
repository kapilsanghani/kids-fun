import { _decorator, Component, Node, Vec3, tween, Sprite, SpriteFrame, UIOpacity } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Card')
export class Card extends Component {

    @property(Node) front: Node = null;
    @property(Node) back: Node = null;

    isFlipped = false;
    cardId: number = 0;
    isMatched = false;

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
            .call(() => {
                GameManager.getInstance().registerCardFlip(this);
            })
            .start();
    }

    lock() {
        this.isMatched = true;
        this.node.off(Node.EventType.TOUCH_END, this.flip, this);
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

    // Called when this card is part of a matched pair.
    playMatchEffect() {
        const opacity = this.node.getComponent(UIOpacity);
        if (!opacity) return;

        tween(this.node)
            .to(0.1, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .call(() => {
                this.lock();
            })
            .start();
        
        tween(opacity)
            .to(0.3, { opacity: 200 })
            .start();
    }

    // Called when this card is part of a mismatched pair.
    playMismatchEffect() {
        const originalPos = this.node.position.clone(); // clone to avoid mutation
        const offset = 10;
    
        tween(this.node)
            .to(0.05, { position: new Vec3(originalPos.x + offset, originalPos.y, originalPos.z) })
            .to(0.05, { position: new Vec3(originalPos.x - offset, originalPos.y, originalPos.z) })
            .to(0.05, { position: originalPos })
            .call(() => {
                this.resetFlip();
            })
            .start();
    }    

}