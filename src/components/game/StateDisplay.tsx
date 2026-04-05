import {type GameState} from "../../game/game.ts";
import Dead from "../../assets/FaceDead.png";
import Happy from "../../assets/FaceHappy.png";
import Glasses from "../../assets/FaceGlasses.png";

const stateImgs = new Map<GameState, string>([
  [-1, Dead],
  [0, Happy],
  [1, Glasses]
]);

type Props = {
    state: GameState
    handleClick: () => void
}

export const StateDisplay = ({state, handleClick}: Props) => {
    const url = stateImgs.get(state);
    
    return(
        <img
            draggable="false"
            src={url}
            onClick={() => handleClick()}
        />
    );
}

export default StateDisplay;