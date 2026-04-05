import { Field, type FloodDiagnostic } from "./field";
import { Vector2 } from "../utils/vector2";
import { FieldNode } from "./node";

// some improvements can be made

export class Game {
    public field: Field;
    public gameState: GameState;
    
    private gameSettings: GameSettings;
    private revealedNodes: FieldNode[];

    constructor(settings: GameSettings) {
        this.gameSettings = settings;

        this.field = new Field(this.gameSettings.size, this.gameSettings.mineCount);
        this.gameState = GameState.Ongoing;
        this.revealedNodes = [];
    }

    copy(): Game {
        const gameCopy = Object.create(Game.prototype) as Game;
        gameCopy.field = this.field.copy();
        gameCopy.gameState = this.gameState;
        gameCopy.revealedNodes = [...this.revealedNodes];
        gameCopy.gameSettings = this.gameSettings;
        return gameCopy;
    }

    flagNode(pos: Vector2): Game {
        if(!this.gameRunning()) return this.copy();

        const newGame = this.copy();
        const node: FieldNode = newGame.field.getNode(pos);
        if (!node.hidden) return this.copy();

        node.toggleFlagged();

        console.log(`Toggling Flag at ${pos.getX()}, ${pos.getY()}`)

        return newGame;
    }

    revealNode(pos: Vector2): Game {
        if(!this.gameRunning()) return this.copy();

        const newGame = this.copy();
        const node: FieldNode = newGame.field.getNode(pos);
        if (node.flagged || !node.hidden) return this.copy();

        const {success, nodes}: FloodDiagnostic = newGame.field.flood(node);
        newGame.revealedNodes.push(...nodes);

        if (success === false) { newGame.setGameState(GameState.Fail); }
        else { if (newGame.isWin()) { newGame.setGameState(GameState.Win) } }

        console.log(`Revealing Node at ${pos.getX()}, ${pos.getY()}. ${success}`)

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

    isWin(): boolean {
        // can prolly store these values privately so I dont have to recalculate each call
        const nodeCount = this.gameSettings.size.getX() * this.gameSettings.size.getY()
        const mineCount = this.gameSettings.mineCount;
        const reqCount = nodeCount - mineCount;

        return this.revealedNodes.length == reqCount;
    }

    getSettings(): GameSettings {
        return this.gameSettings;
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

// Add a check when the minecount is larger than the acutal size so it doesnt crashes
export const DifficultySettings = {
    Easy: new GameSettings(new Vector2(9, 9), 10),
    Medium: new GameSettings(new Vector2(16, 16), 40),
    Hard: new GameSettings(new Vector2(24, 24), 50)
} as const;

export type Diffculty = (typeof DifficultySettings)[keyof typeof DifficultySettings];

export function createGame(difficulty: Diffculty = DifficultySettings.Easy): Game {
    const newGame = new Game(difficulty);

    newGame.field.printField();

    const difficultyName = Object.keys(DifficultySettings).find(key => DifficultySettings[key as keyof typeof DifficultySettings] === difficulty) || 'Unknown';
    console.log(`Created a New Game of ${difficultyName} Difficulty\nSize: ${difficulty.size.getX()}, ${difficulty.size.getY()}\nMines: ${difficulty.mineCount}\nCount: ${difficulty.size.getX()*difficulty.size.getY()}`);

    return newGame;
}