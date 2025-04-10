import { _decorator, Component, Label, Node, sys } from 'cc';
import { Card } from './Card';
import { GridManager } from './GridManager';
import { AudioManager } from './AudioManager';
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
    totalMatches: number;
    totalTurns: number;
}
@ccclass('GameManager')
export class GameManager extends Component {
    public static instance: GameManager;

    @property(Node) cardContainer: Node = null;
    @property(Node) winScreen: Node = null;
    @property(Label) finalScoreLabel: Label = null;
    @property(GridManager) gridManager: GridManager = null;
    @property(Label) totalMatchesLabel: Label = null;
    @property(Label) totalTurnsLabel: Label = null;
    
    private flippedCards: Card[] = [];
    
    private totalMatches: number = 0;
    private totalTurns: number = 0;
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
            this.totalTurns++;
            this.updateStatsDisplay();

            const [cardA, cardB] = this.flippedCards.slice(0, 2);
    
            if (cardA.cardId === cardB.cardId) {
                // Match
                this.totalMatches++;

                this.scheduleOnce(() => {
                    cardA.playMatchEffect();
                    cardB.playMatchEffect();

                    cardA.lock();
                    cardB.lock();

                    this.removeCardsFromFlipped(cardA, cardB);
                    this.saveGameState();
                    this.updateStatsDisplay();

                    // Win check
                    if (this.totalMatches >= this.cardContainer.getChildByName('GridManager').children.length / 2) {
                        this.scheduleOnce(() => {
                            this.winScreen.active = true;
                            this.updateFinalScore();
                            AudioManager.getInstance().playWin();
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
                }, 0.8);
            }
        }
    }
    
    private removeCardsFromFlipped(cardA: Card, cardB: Card) {
        this.flippedCards = this.flippedCards.filter(c => c !== cardA && c !== cardB);
    }

    private updateStatsDisplay() {
        if (this.totalMatchesLabel) {
            this.totalMatchesLabel.string = `${this.totalMatches}`;
        }
    
        if (this.totalTurnsLabel) {
            this.totalTurnsLabel.string = `${this.totalTurns}`;
        }
    }

    public updateFinalScore() {
        if (this.finalScoreLabel) {
            this.finalScoreLabel.string = `Matches : ${this.totalMatches}  |  Turns : ${this.totalTurns}`;
        }
    }

    public resetGame() {
        this.totalMatches = 0;
        this.totalTurns = 0;
        this.updateStatsDisplay();
        this.flippedCards = [];

        this.winScreen.active = false;
    }

    private saveGameState() {
        const gameState: GameState = {
            rows: this.gridManager.rows,
            cols: this.gridManager.cols,
            cards: this.gridManager.getCardDataForSave(),
            totalMatches: this.totalMatches,
            totalTurns: this.totalTurns
        };
        sys.localStorage.setItem(this.DATA_KEY, JSON.stringify(gameState));
    }

    public loadGameState(): boolean {
        const saved = sys.localStorage.getItem(this.DATA_KEY);
        if (!saved) return false;
    
        const state: GameState = JSON.parse(saved);
    
        this.totalMatches = state.totalMatches ?? 0;
        this.totalTurns = state.totalTurns ?? 0;
        this.gridManager.rows = state.rows;
        this.gridManager.cols = state.cols;
    
        this.gridManager.generateGridFromSave(state.cards);
        this.updateStatsDisplay();
    
        return true;
    }
    
    
    
}
