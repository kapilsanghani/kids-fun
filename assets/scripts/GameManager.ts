import { _decorator, Component, Label, Node } from 'cc';
import { Card } from './Card';
import { GridManager } from './GridManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    public static instance: GameManager;

    @property(Node) cardContainer: Node = null;
    @property(Node) winScreen: Node = null;
    @property(Label) scoreLabel: Label = null;
    @property(Label) finalScoreLabel: Label = null;
    
    private flippedCards: Card[] = [];
    private currentMatches: number = 0;
    
    private score: number = 0;

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    onLoad() {
        GameManager.instance = this;
    }

    protected start(): void {
        this.resetGame();
    }

    public registerCardFlip(card: Card) {
        // Don't let already matched cards into the pool
        if (card.isMatched || this.flippedCards.includes(card)) return;
    
        this.flippedCards.push(card);
    
        // If two cards are flipped, compare them
        if (this.flippedCards.length >= 2) {
            const [cardA, cardB] = this.flippedCards.slice(0, 2);
    
            if (cardA.cardId === cardB.cardId) {
                // Match
                this.score++;
                this.currentMatches++;

                this.scheduleOnce(() => {
                    cardA.playMatchEffect();
                    cardB.playMatchEffect();

                    this.removeCardsFromFlipped(cardA, cardB);
                    this.updateScoreDisplay();

                    // Win check
                    if (this.currentMatches >= this.cardContainer.getChildByName('GridManager').children.length / 2) {
                        this.scheduleOnce(() => {
                            this.winScreen.active = true;
                            this.updateFinalScore();
                        }, 0.5);
                    }
                }, 0.5);
            } else {
                // Mismatch
                this.scheduleOnce(() => {
                    cardA.playMismatchEffect();
                    cardB.playMismatchEffect();
                    this.removeCardsFromFlipped(cardA, cardB);
                }, 0.8);
            }
        }
    }
    
    private removeCardsFromFlipped(cardA: Card, cardB: Card) {
        this.flippedCards = this.flippedCards.filter(c => c !== cardA && c !== cardB);
    } 
    
    private updateScoreDisplay() {
        if (this.scoreLabel) {
            this.scoreLabel.string = `${this.score}`;
        }
    }

    public getScore(): number {
        return this.score;
    }

    public updateFinalScore() {
        if (this.finalScoreLabel) {
            this.finalScoreLabel.string = `Score: ${this.score}`;
        }
    }

    public resetGame() {
        this.score = 0;
        this.updateScoreDisplay();
        this.flippedCards = [];

        // this.totalMatchesNeeded = (this.cardContainer.getChildByName('GridManager').children.length / 2);
        this.currentMatches = 0;
        this.winScreen.active = false;
    }

    private saveGameState() {
        const cards: SavedCard[] = this.cardContainer.children.map((node) => {
            const card = node.getComponent(Card);
            return {
                id: card.cardId,
                isMatched: card.isMatched,
                isFlipped: card.isFlipped
            };
        });
    
        const gameState: GameState = {
            rows: this.gridManager.rows,
            cols: this.gridManager.cols,
            cards,
            score: this.score
        };
    
        sys.localStorage.setItem('cardGameSave', JSON.stringify(gameState));
    }
    
}
