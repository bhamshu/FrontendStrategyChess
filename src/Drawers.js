import RowOfDragOverableCells from "./RowOfDrawOverableCells.js";
import * as utils from "./utils_and_consts.js";

const Drawers = ({ row_i }) => {
  return (
    <RowOfDragOverableCells
      row_i={row_i}
      board_name={utils.DRAWER}
      classes="drawer"
    />
  );
};

export default Drawers;
