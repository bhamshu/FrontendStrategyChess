import { useCallback, useContext, useEffect, useState } from "react";
import * as utils from "./utils_and_consts.js";

const get_cell_identifier = (board_name, row_i, col_j) => {
  return board_name + "_" + row_i + "_" + col_j;
};

const get_cell_identifier_from_target = (target) => {
  // either of the text, the span of piece or the div of cell may become event.target
  const target_info = target.lastChild.parentNode.id.split("_");
  return get_cell_identifier(target_info[0], target_info[1], target_info[2]);
};

const get_board_from_name = (board_name, sideBoardPieces, mainBoardPieces) => {
  if (board_name === utils.CHESSBOARD) return mainBoardPieces;
  else return sideBoardPieces;
};

const get_board_setter_from_name = (
  board_name,
  setSideBoardPieces,
  setMainBoardPieces
) => {
  if (board_name === utils.CHESSBOARD) return setMainBoardPieces;
  else return setSideBoardPieces;
};

const get_piece_color_and_name = (
  sideBoardPieces,
  mainBoardPieces,
  cell_identifier
) => {
  const [board_name, row_i, col_j] = cell_identifier.split("_");
  const i = parseInt(row_i);
  const j = parseInt(col_j);
  const my_board = get_board_from_name(
    board_name,
    sideBoardPieces,
    mainBoardPieces
  );
  const [piece_color, piece_name] = my_board[i * 8 + j].split("_");
  return [piece_color, piece_name];
};

const RowOfDragOverableCells = ({ row_i, board_name, classes = "" }) => {
  const {
    highlightedCell,
    setHighlightedCell,
    pickedPiece,
    setPickedPiece,
    mainBoardPieces,
    sideBoardPieces,
    setMainBoardPieces,
    setSideBoardPieces,
  } = useContext(utils.CompleteContext);

  const [rowOfCells, setRowOfCells] = useState([]);

  const drop_pieces_on_cell = useCallback(
    (
      cell_identifier_to_piece_color_and_name,
      sideBoardPieces,
      mainBoardPieces,
      setSideBoardPieces,
      setMainBoardPieces
    ) => {
      let board_name_to_piece_i_j_color_and_name = {};
      for (var cell_identifier in cell_identifier_to_piece_color_and_name) {
        let [board_name, row_i, col_j] = cell_identifier.split("_");
        const i = parseInt(row_i);
        const j = parseInt(col_j);
        board_name_to_piece_i_j_color_and_name[board_name] = (
          board_name_to_piece_i_j_color_and_name[board_name] || []
        ).concat([
          [i, j, cell_identifier_to_piece_color_and_name[cell_identifier]],
        ]);
      }
      for (var board_name in board_name_to_piece_i_j_color_and_name) {
        const my_board = get_board_from_name(
          board_name,
          sideBoardPieces,
          mainBoardPieces
        );
        let my_new_board = [...my_board];
        for (
          let idx = 0;
          idx < board_name_to_piece_i_j_color_and_name[board_name].length;
          idx++
        ) {
          const [i, j, piece_color_and_name] =
            board_name_to_piece_i_j_color_and_name[board_name][idx];
          my_new_board[i * 8 + j] = piece_color_and_name;
        }
        const my_board_setter = get_board_setter_from_name(
          board_name,
          setSideBoardPieces,
          setMainBoardPieces
        );
        my_board_setter(my_new_board);
      }
    },
    []
  );
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    const cell_identifier = get_cell_identifier_from_target(event.target);
    setHighlightedCell(cell_identifier);
  }, []);

  const handleDrag = useCallback((event) => {
    // TODO: there's a bug which allows empty cell's div to be dragged and
    // dropped on a piece and it kills the piece (on frontend only). Fix that.
    console.log(event);
    const [board_name, i, j] = event.target.id.split("_");
    const source_identifier = board_name + "_" + i + "_" + j;
    event.dataTransfer.setData("source_boardname_i_j", source_identifier);
    setPickedPiece(source_identifier);
  }, []);

  const attempt_to_move_piece = useCallback(
    (source_cell_identifier, dest_cell_identifier) => {
      console.log(source_cell_identifier, dest_cell_identifier);
      const [dest_piece_color, dest_piece_name] = get_piece_color_and_name(
        sideBoardPieces,
        mainBoardPieces,
        dest_cell_identifier
      );

      const [source_piece_color, source_piece_name] = get_piece_color_and_name(
        sideBoardPieces,
        mainBoardPieces,
        source_cell_identifier
      );

      if (source_piece_color === dest_piece_color) {
        setPickedPiece(dest_cell_identifier);
      } else {
        drop_pieces_on_cell(
          {
            [source_cell_identifier]: utils.EMPTY_PIECE_COLOR_AND_NAME,
            [dest_cell_identifier]:
              source_piece_color + "_" + source_piece_name,
            [utils.get_first_empty_cell_on_drawers(sideBoardPieces)]:
              dest_piece_color + "_" + dest_piece_name,
          },
          sideBoardPieces,
          mainBoardPieces,
          setSideBoardPieces,
          setMainBoardPieces
        );
        setPickedPiece(null);
      }
      setHighlightedCell(null);
      return true;
    },
    [sideBoardPieces, mainBoardPieces, highlightedCell, pickedPiece]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const [source_boardname, source_i, source_j] = event.dataTransfer
        .getData("source_boardname_i_j")
        .split("_");

      const source_cell_identifier =
        source_boardname + "_" + source_i + "_" + source_j;

      const target_cell_identifier = get_cell_identifier_from_target(
        event.target
      );

      attempt_to_move_piece(source_cell_identifier, target_cell_identifier);
    },
    [attempt_to_move_piece]
  );
  const handleDragEnd = useCallback(() => {
    setHighlightedCell(null);
    setPickedPiece(null);
  }, [setHighlightedCell, setPickedPiece]);

  const handleClick = useCallback(
    (event) => {
      console.log(event);
      const clicked_piece_cell_identifier = get_cell_identifier_from_target(
        event.target
      );
      if (pickedPiece !== null) {
        const source_cell_identifier = pickedPiece;
        const dest_cell_identifier = clicked_piece_cell_identifier;
        attempt_to_move_piece(source_cell_identifier, dest_cell_identifier);
      } else {
        const [piece_color, piece_name] = get_piece_color_and_name(
          sideBoardPieces,
          mainBoardPieces,
          clicked_piece_cell_identifier
        );
        if (piece_color + "_" + piece_name !== utils.EMPTY_PIECE_COLOR_AND_NAME)
          setPickedPiece(clicked_piece_cell_identifier);
      }
    },
    [pickedPiece]
  );

  useEffect(() => {
    let cells = [];
    for (let j = 0; j < 8; j++) {
      const [piece_color, piece_name] = get_piece_color_and_name(
        sideBoardPieces,
        mainBoardPieces,
        get_cell_identifier(board_name, row_i, j)
      );
      const black = (row_i + j) % 2 === 1;
      const cell_identifier = board_name + "_" + row_i + "_" + j;
      cells.push(
        <div
          className={
            classes +
            " cell" +
            (black ? " black" : "") +
            (highlightedCell === cell_identifier ? " highlighted" : "") +
            (pickedPiece === cell_identifier ? "  picked" : "")
          }
          key={j}
          id={cell_identifier}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDrag}
          onDragEnd={handleDragEnd}
          onClick={handleClick}
        >
          <span
            className="piece"
            draggable={
              piece_color + "_" + piece_name !==
              utils.EMPTY_PIECE_COLOR_AND_NAME
            }
            id={cell_identifier + "_" + piece_color + "_" + piece_name}
          >
            {utils.color_to_name_to_unicode[piece_color][piece_name]}
          </span>
        </div>
      );
    }
    setRowOfCells(cells);
  }, [highlightedCell, sideBoardPieces, mainBoardPieces, pickedPiece]);

  return <div className="row">{rowOfCells}</div>;
};

export default RowOfDragOverableCells;
