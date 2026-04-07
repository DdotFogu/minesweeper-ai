import {type GameState} from "../../game/game.ts";
import { useState } from 'react';

import Dead from "../../assets/FaceDead.png";
import Happy from "../../assets/FaceHappy.png";
import Glasses from "../../assets/FaceGlasses.png";
import HappyPressed from "../../assets/FaceHappyPressed.png";

const stateImgs = new Map<GameState, string>([
  [-1, Dead],
  [0, Happy],
  [1, Glasses],
]);

type Props = {
    state: GameState
    handleClick: () => void
}

export const StateDisplay = ({state, handleClick}: Props) => {
    const [isPressing, setIsPressing] = useState(false);

    const handleMouseEvent = (e: React.MouseEvent, bool: boolean) => {if (e.button === 0) setIsPressing(bool)}
    
    const src =
    isPressing
    ? HappyPressed
    : stateImgs.get(state);
    
    return(
        <img
            className="state-display"
            draggable="false"
            src={src}
            onClick={() => handleClick()}
            onContextMenu={(e: React.MouseEvent) => {
                e.preventDefault();
            }}
            onMouseDown={(e: React.MouseEvent) => handleMouseEvent(e, true)}
            onMouseUp={(e: React.MouseEvent) => handleMouseEvent(e, false)}
            onMouseLeave={(e: React.MouseEvent) => handleMouseEvent(e, false)}
        />
    );
}

export default StateDisplay;