import { _decorator, Component, Label, Node, sys } from 'cc';
import { Card } from './Card';
import { GridManager } from './GridManager';
const { ccclass, property } = _decorator;
export interface SavedCard {
    spriteIndex: number;
    isMatched: boolean;
    isFlipped: boolean;
}

export interface GameState {
    rows: number;
    cols: number;
    cards: SavedCard[];
    score: number;
    currentMatches: number;
}
@ccclass('GameManager')
export class GameManager extends Component {
    public static instance: GameManager;

    @property(Node) cardContainer: Node = null;
    @property(Node) winScreen: Node = null;
    @property(Label) scoreLabel: Label = null;
    @property(Label) finalScoreLabel: Label = null;
    @property(GridManager) gridManager: GridManager = null;
    
    private flippedCards: Card[] = [];
    private currentMatches: number = 0;
    
    private score: number = 0;
    public readonly DATA_KEY = 'cardGameSave';

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

                    cardA.lock();
                    cardB.lock();

                    this.removeCardsFromFlipped(cardA, cardB);
                    this.updateScoreDisplay();

                    this.saveGameState();

                    // Win check
                    if (this.currentMatches >= this.cardContainer.getChildByName('GridManager').children.length / 2) {
                        this.scheduleOnce(() => {
                            this.winScreen.active = true;
                            this.updateFinalScore();
                            sys.localStorage.removeItem(this.DATA_KEY);
                        }, 0.5);
                    }
                }, 0.5);
            } else {
                // Mismatch
                this.scheduleOnce(() => {
                    cardA.playMismatchEffect();
                    cardB.playMismatchEffect();
                    this.removeCardsFromFlipped(cardA, cardB);
                    // this.saveGameState();
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

        this.currentMatches = 0;
        this.winScreen.active = false;
    }

    private saveGameState() {
        const gameState: GameState = {
            rows: this.gridManager.rows,
            cols: this.gridManager.cols,
            cards: this.gridManager.getCardDataForSave(),
            score: this.score,
            currentMatches: this.currentMatches
        };
        sys.localStorage.setItem(this.DATA_KEY, JSON.stringify(gameState));
    }

    public loadGameState(): boolean {
        const saved = sys.localStorage.getItem(this.DATA_KEY);
        if (!saved) return false;
    
        const state: GameState = JSON.parse(saved);
    
        this.score = state.score;
        this.currentMatches = state.currentMatches ?? 0;
        this.gridManager.rows = state.rows;
        this.gridManager.cols = state.cols;
    
        this.gridManager.generateGridFromSave(state.cards);
        this.updateScoreDisplay();
    
        return true;
    }
    
    
    
}
