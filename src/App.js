import "./App.css";
import "./Chessboard.css";
import Chessboard from "./Chessboard";
import Drawers from "./Drawers";
import * as utils from "./utils_and_consts.js";
import { useState } from "react";

function App() {
  const [highlightedCell, setHighlightedCell] = useState(null);
  const [pickedPiece, setPickedPiece] = useState(null);

  const [mainBoardPieces, setMainBoardPieces] = useState(
    Array(32)
      .fill(utils.BLACK + "_Queen")
      .concat(Array(32).fill(utils.WHITE + "_Knight"))
  );
  const [sideBoardPieces, setSideBoardPieces] = useState(
    Array(32).fill(utils.EMPTY_PIECE_COLOR_AND_NAME)
  );

  return (
    <div className="App">
      <utils.CompleteContext.Provider
        value={{
          highlightedCell,
          setHighlightedCell,
          pickedPiece,
          setPickedPiece,
          sideBoardPieces,
          mainBoardPieces,
          setSideBoardPieces,
          setMainBoardPieces,
        }}
      >
        <Drawers row_i={0} />
        <Drawers row_i={1} />
        <Chessboard></Chessboard>
        {/* Note that drawer 3 comes before 2, this is intentional, for check pattern. */}
        <Drawers row_i={3} />
        <Drawers row_i={2} />
      </utils.CompleteContext.Provider>
    </div>
  );
}

export default App;
