import { _decorator, Component, Node } from 'cc';
import { Card } from './Card';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    public static instance: GameManager;

    @property(Node) cardContainer: Node = null;

    private flippedCards: Card[] = [];
    private score: number = 0;
    private lockInput = false;

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    onLoad() {
        GameManager.instance = this;
    }

    public registerCardFlip(card: Card) {
        // Don't let already matched cards into the pool
        if (/*card.isMatched || */this.flippedCards.includes(card)) return;
    
        this.flippedCards.push(card);
    
        // If two cards are flipped, compare them
        if (this.flippedCards.length >= 2) {
            const [cardA, cardB] = this.flippedCards.slice(0, 2);
    
            if (cardA.cardId === cardB.cardId) {
                // Match
                this.score++;
                this.scheduleOnce(() => {
                    // cardA.lock();
                    // cardB.lock();
                    this.removeCardsFromFlipped(cardA, cardB);
                }, 0.5);
            } else {
                // Mismatch
                this.scheduleOnce(() => {
                    cardA.resetFlip();
                    cardB.resetFlip();
                    this.removeCardsFromFlipped(cardA, cardB);
                }, 0.8);
            }
        }
    }
    
    private removeCardsFromFlipped(cardA: Card, cardB: Card) {
        this.flippedCards = this.flippedCards.filter(c => c !== cardA && c !== cardB);
    }    

    public getScore(): number {
        return this.score;
    }

    public resetGame() {
        this.score = 0;
        this.flippedCards = [];
        this.lockInput = false;
    }
}
