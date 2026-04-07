import Mine from "../../assets/TileMine.png";
import Explode from "../../assets/TileExploded.png"
import Hidden from "../../assets/TileUnknown.png";
import Flagged from "../../assets/TileFlag.png";
import Zero from "../../assets/TileEmpty.png";
import One from "../../assets/Tile1.png";
import Two from "../../assets/Tile2.png";
import Three from "../../assets/Tile3.png";
import Four from "../../assets/Tile4.png";
import Five from "../../assets/Tile5.png";
import Six from "../../assets/Tile6.png";
import Seven from "../../assets/Tile7.png";
import Eigth from "../../assets/Tile8.png";

import { type NodeStateType, NodeState, FieldNode } from "../../game/node.ts"
import { Vector2 } from "../../utils/vector2.ts";
import type { MouseEvent } from "react";
import { useState } from 'react';

type Props = {
    node: FieldNode
    handleClick: (pos: Vector2) => void
    handleFlag: (pos: Vector2) => void
}

const stateImgs = new Map<NodeStateType, string>([
  [0, Hidden],
  [1, Flagged],
  [2, Zero],
  [3, One],
  [4, Two],
  [5, Three],
  [6, Four],
  [7, Five],
  [8, Six],
  [9, Seven],
  [10, Eigth],
  [11, Mine],
  [12, Explode]
]);

export const NodeDisplay = ({node, handleClick, handleFlag}: Props) => {
    const [isPressing, setIsPressing] = useState(false);

    const handleMouseEvent = (e: React.MouseEvent, bool: boolean) => {if (e.button === 0 && !node.flagged) setIsPressing(bool)}

    const nodeState = node.getState();
    const isHidden = node.hidden
    const src =
    isPressing && isHidden
      ? stateImgs.get(NodeState.Zero)
      : stateImgs.get(nodeState);

    return(
        <img 
            className="field-node"
            onClick={() => handleClick(node.pos)}
            onContextMenu={(e: MouseEvent) => {
                e.preventDefault();
                handleFlag(node.pos);
            }}
            src={src}
            draggable="false"
            onMouseDown={(e: React.MouseEvent) => handleMouseEvent(e, true)}
            onMouseUp={(e: React.MouseEvent) => handleMouseEvent(e, false)}
            onMouseLeave={(e: React.MouseEvent) => handleMouseEvent(e, false)}
        />
    );
}

export default NodeDisplay;