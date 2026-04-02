import { Vector2 } from "../utils/vector2";

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
}

export class BombNode extends FieldNode {

    reveal(): boolean{
        super.reveal();

        return false;
    }

    toggleFlagged(): boolean{
        super.toggleFlagged();
        
        return true;
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
}