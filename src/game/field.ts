import { FieldNode, EmptyNode, BombNode } from "./node";
import { type GameSettings } from "./game"
import { Vector2 } from "../utils/vector2";

export type FloodDiagnostic = {
    nodes: FieldNode[]
}
export class Field {
    public grid: FieldNode[][];
    public size: Vector2;

    constructor(settings: GameSettings) {
        this.grid = [];
        this.size = settings.size;

        this.constructField(settings.size, settings.mineCount)
    }

    flood(node: FieldNode): FloodDiagnostic {
        const diagnostic: FloodDiagnostic = { nodes: []};

        const visited = new Set<FieldNode>();
        const queue: FieldNode[] = [node];

        while (queue.length > 0) {
            const current = queue.pop()!;

            if (visited.has(current)) continue;
            visited.add(current);

            if (current instanceof EmptyNode && current.flagged == false && current.hidden == true) {
                current.reveal();
                diagnostic.nodes.push(current);
                
                if (current.tag === 0) {
                    for (const neighbor of current.neighbors) {
                        neighbor.flagged = false;

                        if (!visited.has(neighbor) && neighbor.flagged === false) {
                            queue.push(neighbor);
                        }
                    }
                }
            }
        }

        return diagnostic;
    }

    getNode(pos: Vector2){ return this.grid[pos.getY()][pos.getX()] }

    constructField(size: Vector2, mineCount: number): void {
        this.grid = this.generateNodes(size);
        this.grid = this.generateMines(mineCount);
    }

    generateNodes(size: Vector2): FieldNode[][] {
        const newGrid: FieldNode[][] = Array.from({ length: size.getY() }, (_, y) =>
            Array.from({ length: size.getX() }, (_, x) =>
                new EmptyNode(new Vector2(x, y), []) as FieldNode
            )
        );
        
        for (let y = 0; y < newGrid.length; y++) {
            for (let x = 0; x < newGrid[y].length; x++) {
                const node = newGrid[y][x];
                const neighbors: FieldNode[] = [];
                
                for (let yOffset = -1; yOffset <= 1; yOffset++) {
                    for (let xOffset = -1; xOffset <= 1; xOffset++) {
                        const neighborX = x + xOffset;
                        const neighborY = y + yOffset;
                        
                        if (neighborX >= 0 && neighborX < newGrid[0].length && 
                            neighborY >= 0 && neighborY < newGrid.length && 
                            !(xOffset === 0 && yOffset === 0)) {
                            neighbors.push(newGrid[neighborY][neighborX]);
                        }
                    }
                }
                
                (node as FieldNode).neighbors = neighbors;
            }
        }

        return newGrid;
    }

    generateMines(count: number): FieldNode[][] {
        const newGrid: FieldNode[][] = [...this.grid];
        count = ((t) => t < count ? Math.round(t * 0.15) : count)(this.size.getX() * this.size.getY());

        while (count > 0) {
            const rndRow = Math.floor(Math.random() * newGrid.length);
            const rndNode = Math.floor(Math.random() * newGrid[rndRow].length);

            if (!(newGrid[rndRow][rndNode] instanceof BombNode)) {
                const newBomb = new BombNode(newGrid[rndRow][rndNode].pos, newGrid[rndRow][rndNode].neighbors);
                newGrid[rndRow][rndNode] = newBomb;
                
                for (const neighbor of newBomb.neighbors) {if (neighbor instanceof EmptyNode) (neighbor as EmptyNode).tag++;}

                count--;
            }
        }

        return newGrid;
    }

    copy(): Field {
        const newField = Object.create(Field.prototype) as Field;
        const newGrid: FieldNode[][] = this.grid.map((row) =>
            row.map((node) => {
                let clonedNode: FieldNode;

                if (node instanceof BombNode) {
                    clonedNode = (node as BombNode).copy();
                } else {
                    const emptyNode = new EmptyNode(node.pos, []);
                    emptyNode.tag = (node as EmptyNode).tag;
                    clonedNode = emptyNode;
                }

                clonedNode.hidden = node.hidden;
                clonedNode.flagged = node.flagged;
                return clonedNode;
            })
        );

        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                newGrid[y][x].neighbors = this.grid[y][x].neighbors.map(
                    neighbor => newGrid[neighbor.pos.getY()][neighbor.pos.getX()]
                );
            }
        }

        newField.grid = newGrid;
        newField.size = this.size;

        return newField;
    }
}