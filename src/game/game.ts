import { Field } from "./field";
import { Vector2 } from "../utils/vector2";
import { FieldNode } from "./node";

export class Game {
    public field: Field;
    public gameState: GameState;

    private _remainingMines: number;

    constructor(settings: GameSettings) {
        this.field = new Field(settings.size, settings.mineCount);
        this.gameState = GameState.Ongoing;
        this._remainingMines = settings.mineCount;
    }

    get remainingMines(): number {
        return this._remainingMines;
    }

    set remainingMines(value: number) {
        if (value < 0) { return; }
        this._remainingMines = value;

        if (this._remainingMines === 0) this.setGameState(GameState.Win);
    }

    flagNode(pos: Vector2) {
        if(!this.gameRunning()) return;

        const node: FieldNode = this.field.getNode(pos);
        const success: boolean = node.toggleFlagged();

        if (success && node.flagged == true) {
            this.remainingMines = this._remainingMines - 1;
        }
        else if (success && node.flagged == false) {
            this.remainingMines = this._remainingMines + 1;
        }

        this.field.printField();
        console.log(`Toggling Flag at ${pos.getX()}, ${pos.getY()}`)
    }

    revealNode(pos: Vector2) {
        if(!this.gameRunning()) return;

        const node: FieldNode = this.field.getNode(pos);
        const success: boolean = this.field.flood(node);
        if (success === false) {
            this.setGameState(GameState.Fail);
        }
        else {
            this.field.printField();
            console.log(`Revealing Node at ${pos.getX()}, ${pos.getY()}. ${success}`)
        }
    }

    gameRunning(): boolean {
        return this.gameState === GameState.Ongoing;
    }

    setGameState(state: GameState): void {
        this.gameState = state;

        if (state === GameState.Fail) {
            this.field.printField();
            console.log(`You Hit a Mine!`);
        }

        if (state === GameState.Win) {
            console.log(`You Won!`);
        }
    }
}

export const GameState = {
    Fail: -1,
    Ongoing: 0,
    Win: 1
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];

export class GameSettings {
    public size: Vector2;
    public mineCount: number;

    constructor(size: Vector2, mineCount: number) {
        this.size = size;
        this.mineCount = mineCount;
    }
}

export const DifficultySettings = {
    Easy: new GameSettings(new Vector2(9, 9), 10    ),
    Medium: new GameSettings(new Vector2(16, 16), 40),
    Hard: new GameSettings(new Vector2(24, 24), 99)
} as const;

export function createGame(difficulty: typeof DifficultySettings[keyof typeof DifficultySettings] = DifficultySettings.Easy): Game {
    const newGame = new Game(difficulty);

    newGame.field.printField();

    const difficultyName = Object.keys(DifficultySettings).find(key => DifficultySettings[key as keyof typeof DifficultySettings] === difficulty) || 'Unknown';
    console.log(`Created a New Game of ${difficultyName} Difficulty\nSize: ${difficulty.size.getX()}, ${difficulty.size.getY()}\nMines: ${difficulty.mineCount}`);

    return newGame;
}