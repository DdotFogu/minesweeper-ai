import { FieldNode, EmptyNode, BombNode } from "./node";
import { Vector2 } from "../utils/vector2";

export class Field {
    public grid: FieldNode[][];
    public size: Vector2;

    constructor(size: Vector2, mineCount: number) {
        this.grid = this.constructField(size, mineCount);
        this.size = size;
    }

    flood(node: FieldNode): FloodDiagnostic {
        const diagnostic: FloodDiagnostic = {success: true, nodes: []};

        const visited = new Set<FieldNode>();
        const queue: FieldNode[] = [node];

        while (queue.length > 0) {
            const current = queue.pop()!;

            if (visited.has(current)) continue;
            visited.add(current);

            if (current instanceof EmptyNode && current.flagged == false && current.hidden == true) {
                diagnostic.success = current.reveal();
                diagnostic.nodes.push(current);
                
                if (current.tag === 0) {
                    for (const neighbor of current.neighbors) {
                        neighbor.flagged = false;

                        if (!visited.has(neighbor) && neighbor.flagged === false) {
                            queue.push(neighbor);
                        }
                    }
                }
            } else if (current instanceof BombNode && current.flagged == false && current.hidden == true) {
                // can prolly get rid of this else and do it on the action in the gameClass
                diagnostic.success = current.reveal();
            }
        }

        return diagnostic;
    }

    getNode(pos: Vector2){
        return this.grid[pos.getY()][pos.getX()];
    }

    constructField(size: Vector2, mineCount: number): FieldNode[][] {
        const newGrid: FieldNode[][] = [];

        for (let y = 0; y < size.getY(); y++) {
            const row: FieldNode[] = [];

            for (let x = 0; x < size.getX(); x++) {
                const newNode: FieldNode = new EmptyNode(new Vector2(x, y), []);
                row.push(newNode);
            }

            newGrid.push(row);
        }
        
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

        while (mineCount > 0) {
            const rndRow = Math.floor(Math.random() * newGrid.length);
            const rndNode = Math.floor(Math.random() * newGrid[rndRow].length);

            if (!(newGrid[rndRow][rndNode] instanceof BombNode)) {
                const newBomb = new BombNode(newGrid[rndRow][rndNode].pos, newGrid[rndRow][rndNode].neighbors);
                newGrid[rndRow][rndNode] = newBomb;
                
                for (const neighbor of newBomb.neighbors) {if (neighbor instanceof EmptyNode) (neighbor as EmptyNode).tag++;}

                mineCount--;
            }
        }

        return newGrid;
    }

    printField(){
        const fieldString = this.grid.map(row => row.map((node) => node.flagged ? ` 🚩 ` : node.hidden ? `[  ]` : node instanceof BombNode ? ` 💣 ` : `[ ${(node as EmptyNode).tag} ]`).join("")).join("\n \n");
        console.log(fieldString);
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

export type FloodDiagnostic = {
    success: boolean,
    nodes: FieldNode[]
}