import { Field, type FloodDiagnostic } from "./field";
import { Vector2 } from "../utils/vector2";
import { FieldNode, BombNode } from "./node";

// make first click always safe. done by creating the field after click

export class Game {
    public field: Field;
    public gameState: GameState;
    
    private gameSettings: GameSettings;
    private revealedNodes: FieldNode[];

    constructor(settings: GameSettings) {
        this.gameSettings = settings;

        this.field = new Field(settings);
        this.gameState = GameState.Ongoing;
        this.revealedNodes = [];
    }

    copy(): Game {
        const gameCopy = Object.create(Game.prototype) as Game;
        gameCopy.field = this.field.copy();
        gameCopy.gameState = this.gameState;
        gameCopy.revealedNodes = [...this.revealedNodes];
        gameCopy.gameSettings = this.gameSettings.copy();
        return gameCopy;
    }
    
    flagNode(pos: Vector2): Game {
        const newGame = this.copy();
        const node: FieldNode = newGame.getNode(pos);

        node.toggleFlagged();

        console.log(`Toggling Flag at ${pos.getX()}, ${pos.getY()}`)

        return newGame;
    }
    
    revealNode(pos: Vector2): Game {
        const newGame = this.copy();
        const node: FieldNode = newGame.getNode(pos);

        if (node instanceof BombNode) {
            node.reveal();
            newGame.setGameState(GameState.Fail);
        } else {
            const { nodes }: FloodDiagnostic = newGame.field.flood(node);
            newGame.revealedNodes.push(...nodes);

            if (newGame.isWin()) newGame.setGameState(GameState.Win);
        }

        return newGame;
    }

    getNode(pos: Vector2): FieldNode { return this.field.getNode(pos) }

    nodeIsHidden(pos: Vector2): boolean { return this.getNode(pos).hidden }

    nodeIsFlagged(pos: Vector2): boolean { return this.getNode(pos).flagged }

    isRunning(): boolean { return this.gameState === GameState.Ongoing }

    isWin(): boolean { return this.revealedNodes.length >= this.gameSettings.reqCount }

    getSettings(): GameSettings { return this.gameSettings }
 
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
    public nodeCount: number;
    public reqCount: number;

    constructor(size: Vector2, mineCount: number) {
        this.size = size;
        this.mineCount = mineCount;
        this.nodeCount = this.size.getX() * this.size.getY()
        this.reqCount = this.size.getX() * this.size.getY() - mineCount;
    }

    copy(): GameSettings {
        const settingsCopy = Object.create(GameSettings.prototype) as GameSettings;
        settingsCopy.size = this.size;
        settingsCopy.mineCount = this.mineCount;
        settingsCopy.nodeCount = this.nodeCount;
        settingsCopy.reqCount = this.reqCount;
        return settingsCopy;
    }
}

export const DifficultySettings = {
    Easy: new GameSettings(new Vector2(9, 9), 10),
    Medium: new GameSettings(new Vector2(16, 16), 40),
    Hard: new GameSettings(new Vector2(24, 24), 85)
} as const;

export type Diffculty = (typeof DifficultySettings)[keyof typeof DifficultySettings];

export function createGame(difficulty: Diffculty = DifficultySettings.Easy): Game {
    const newGame = new Game(difficulty);

    const difficultyName = Object.keys(DifficultySettings).find(key => DifficultySettings[key as keyof typeof DifficultySettings] === difficulty) || 'Unknown';
    console.log(`Created a New Game of ${difficultyName} Difficulty\nSize: ${difficulty.size.getX()}, ${difficulty.size.getY()}\nMines: ${difficulty.mineCount}\nCount: ${difficulty.size.getX()*difficulty.size.getY()}`);

    return newGame;
}