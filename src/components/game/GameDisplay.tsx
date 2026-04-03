import "../../style/gamedisplay.css";
import { useState } from 'react';
import { Game, createGame, DifficultySettings } from "../../game/game.ts";
import { NodeDisplay } from "./NodeDisplay";
import { Vector2 } from "../../utils/vector2.ts";

export const GameDisplay = () => {
    const [game, setGame] = useState<Game>(createGame(DifficultySettings.Easy));
    
    const handleNodeClick = (pos: Vector2) => setGame(prevGame => prevGame.revealNode(pos));
    const handleNodeFlag = (pos: Vector2) => setGame(prevGame => prevGame.flagNode(pos));

    return(
        <>
            <div 
                className="game-field"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${game.field.size.getY()}, 0fr)`,
                    gridTemplateRows: `repeat(${game.field.size.getX()}, 0fr)`
                }}
            >
                {
                    game.field.grid.map((row, rowIndex) => (
                        row.map((node, colIndex) => (
                            <NodeDisplay 
                                key={`${rowIndex}-${colIndex}`} 
                                node={node} 
                                handleClick={handleNodeClick}
                                handleFlag={handleNodeFlag}
                            />
                        ))
                    ))
                }
            </div>
        </>
    )
}

export default GameDisplay;