import { Field } from "./field";
import { Vector2 } from "../utils/vector2";
import { FieldNode } from "./node";

// some improvements can be made
// Add win cond check

export class Game {
    public field: Field;
    public gameState: GameState;

    constructor(settings: GameSettings) {
        this.field = new Field(settings.size, settings.mineCount);
        this.gameState = GameState.Ongoing;
    }

    clone(): Game {
        const gameCopy = Object.create(Game.prototype) as Game;
        gameCopy.field = this.field.copy();
        gameCopy.gameState = this.gameState;
        return gameCopy;
    }

    flagNode(pos: Vector2): Game {
        if(!this.gameRunning()) return this.clone();

        const newGame = this.clone();
        const node: FieldNode = newGame.field.getNode(pos);
        if (!node.hidden) return this.clone();

        node.toggleFlagged();

        console.log(`Toggling Flag at ${pos.getX()}, ${pos.getY()}`)

        return newGame;
    }

    revealNode(pos: Vector2): Game {
        if(!this.gameRunning()) return this.clone();

        const newGame = this.clone();
        const node: FieldNode = newGame.field.getNode(pos);
        if (node.flagged || !node.hidden) return this.clone();

        const success: boolean = newGame.field.flood(node);

        if (success === false) { newGame.setGameState(GameState.Fail); }
        else { console.log(`Revealing Node at ${pos.getX()}, ${pos.getY()}. ${success}`) }

        return newGame;
    }

    gameRunning(): boolean {
        return this.gameState === GameState.Ongoing;
    }

    setGameState(state: GameState): void {
        this.gameState = state;

        if (state === GameState.Fail) { console.log(`You Hit a Mine!`); }

        if (state === GameState.Win) { console.log(`You Won!`); }
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
    Hard: new GameSettings(new Vector2(24, 24), 50)
} as const;

export function createGame(difficulty: typeof DifficultySettings[keyof typeof DifficultySettings] = DifficultySettings.Easy): Game {
    const newGame = new Game(difficulty);

    newGame.field.printField();

    const difficultyName = Object.keys(DifficultySettings).find(key => DifficultySettings[key as keyof typeof DifficultySettings] === difficulty) || 'Unknown';
    console.log(`Created a New Game of ${difficultyName} Difficulty\nSize: ${difficulty.size.getX()}, ${difficulty.size.getY()}\nMines: ${difficulty.mineCount}`);

    return newGame;
}