import { Vector2 } from "../utils/vector2";

export const NodeState = {
    Hidden: 0,
    Flagged: 1,
    Zero: 2,
    One: 3,
    Two: 4,
    Three: 5,
    Four: 6,
    Five: 7,
    Six: 8,
    Seven: 9,
    Eigth: 10,
    Mine: 11,
    Explode: 12
} as const;

export type NodeStateType = (typeof NodeState)[keyof typeof NodeState];

export class FieldNode {
    public pos: Vector2;
    public neighbors: FieldNode[];
    public hidden: boolean;
    public flagged: boolean;

    constructor(pos: Vector2, neighbors: FieldNode[]) {
        this.pos = pos;
        this.neighbors = neighbors;
        this.hidden = true;
        this.flagged = false;
    }

    reveal(): boolean{
        this.hidden = false;

        return true;
    }

    toggleFlagged(): boolean{
        this.flagged = !this.flagged;

        return false;
    }

    getState(): NodeStateType{
        return this.flagged 
            ? NodeState.Flagged 
            : this.hidden 
                ? NodeState.Hidden 
                : NodeState.Zero;
    }
}

export class BombNode extends FieldNode {
    private tripped: boolean;
    
    constructor(pos: Vector2, neighbors: FieldNode[]) {
        super(pos, neighbors);
        
        this.tripped = false;
    };

    copy(): BombNode{
        const newBomb = Object.create(BombNode.prototype) as BombNode;
        newBomb.tripped = this.tripped;
        newBomb.pos = this.pos;
        newBomb.neighbors = this.neighbors;
        newBomb.hidden = this.hidden;
        newBomb.flagged = this.flagged;
        return newBomb;
    }

    reveal(): boolean{
        super.reveal();

        this.tripped = true
        return false;
    }

    toggleFlagged(): boolean{
        super.toggleFlagged();
        
        return true;
    }

    getState(): NodeStateType{
        return this.tripped ? NodeState.Explode :this.flagged 
            ? NodeState.Flagged 
            : this.hidden 
                ? NodeState.Hidden 
                : NodeState.Mine;
    }
}

export class EmptyNode extends FieldNode {
    public tag: number;

    constructor(pos: Vector2, neighbors: FieldNode[]) {
        super(pos, neighbors);
        
        this.tag = 0;
    };

    reveal(): boolean{
        super.reveal();

        return true;
    }

    getState(): NodeStateType{
        return this.flagged
            ? NodeState.Flagged
            : this.hidden
                ? NodeState.Hidden
                : (this.tag + NodeState.Zero) as NodeStateType;
    }
}