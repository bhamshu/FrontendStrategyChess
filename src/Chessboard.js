import * as utils from "./utils_and_consts.js";
import RowOfDragOverableCells from "./RowOfDrawOverableCells.js";

const Chessboard = () => {
  var chessboard_rows = [];
  for (let i = 0; i < 7; i++) {
    chessboard_rows.push(
      <RowOfDragOverableCells
        key={i}
        row_i={i}
        board_name={utils.CHESSBOARD}
        classes=""
      />
    );
  }
  return <div className="Chessboard">{chessboard_rows}</div>;
};

export default Chessboard;
