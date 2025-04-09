import { _decorator, Component, instantiate, Node, Prefab, Size, SpriteFrame, UITransform, Vec3 } from 'cc';
import { Card } from './Card';
const { ccclass, property } = _decorator;

@ccclass('GridManager')
export class GridManager extends Component {

    @property(Prefab) cardPrefab: Prefab = null;
    @property(Node) cardContainer: Node = null;

    @property rows: number = 4;
    @property cols: number = 4;

    // Sprite frames for the card faces
    @property([SpriteFrame]) cardFrames: SpriteFrame[] = [];

    public totalCards = 0;
    private readonly defaultCardSize = 240;

    start() {
    }

    // Main method to generate a grid of cards.
    generateGrid() {
        this.totalCards = this.rows * this.cols;
        if (this.totalCards % 2 !== 0) {
            console.error("Card count must be even for matching pairs.");
            return;
        }

        const cardSize = this.calculateCardSize();
        const deck = this.createShuffledDeck(this.totalCards);
        this.spawnCards(deck, cardSize);
    }

    // Calculates the optimal card size to fit all cards inside the container.
    private calculateCardSize(): number {
        const containerSize = this.cardContainer.getComponent(UITransform).contentSize;
        const spacing = 10;

        const maxCardWidth = (containerSize.width - spacing * (this.cols + 1)) / this.cols;
        const maxCardHeight = (containerSize.height - spacing * (this.rows + 1)) / this.rows;
        
        const fittedSize = Math.min(maxCardWidth, maxCardHeight);

        return Math.min(this.defaultCardSize, fittedSize);
    }

    private createShuffledDeck(totalCards: number): { id: number, sprite: SpriteFrame }[] {
        const pairsNeeded = totalCards / 2;
        const selectedFaces: SpriteFrame[] = [];

        const indices = [...Array(this.cardFrames.length).keys()];
        this.shuffle(indices); // Shuffle indices to pick random cards

        for (let i = 0; i < pairsNeeded; i++) {
            selectedFaces.push(this.cardFrames[indices[i]]);
        }

        const deck: { id: number, sprite: SpriteFrame }[] = [];
        selectedFaces.forEach((face, idx) => {
            // Create 2 copies of each face to form a pair
            deck.push({ id: idx, sprite: face });
            deck.push({ id: idx, sprite: face });
        });

        this.shuffle(deck); // Shuffle the final deck
        return deck;
    }

    // Instantiates card prefabs, sizes and positions them into a centered grid.
    private spawnCards(deck: { id: number, sprite: SpriteFrame }[], cardSize: number) {
        const spacing = 10;
        const totalWidth = (cardSize + spacing) * this.cols - spacing;
        const totalHeight = (cardSize + spacing) * this.rows - spacing;

        const startX = -totalWidth / 2 + cardSize / 2;
        const startY = totalHeight / 2 - cardSize / 2;

        let deckIndex = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const card = instantiate(this.cardPrefab);
                this.node.addChild(card);

                const uiTransform = card.getComponent(UITransform);
                uiTransform.setContentSize(cardSize, cardSize);

                const x = startX + (cardSize + spacing) * col;
                const y = startY - (cardSize + spacing) * row;
                card.setPosition(new Vec3(x, y, 0)); // Centered grid layout

                // Assign face and ID to card
                const cardScript = card.getComponent(Card);
                const data = deck[deckIndex++];
                cardScript.cardId = data.id;
                cardScript.setFrontSprite(data.sprite);
            }
        }
    }

    shuffle<T>(array: T[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}