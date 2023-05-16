import { useCallback, useContext, useEffect, useState } from "react";
import * as utils from "./utils_and_consts.js";
import axios from "axios";

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
    gameStage,
    myId,
    getMyGameStateFromApiAndSet,
    turn,
  } = useContext(utils.CompleteContext);

  const [rowOfCells, setRowOfCells] = useState([]);

  const handleDragOver = useCallback(
    (event) => {
      event.preventDefault();
      const cell_identifier = utils.get_cell_identifier_from_target(
        event.target
      );
      setHighlightedCell(cell_identifier);
    },
    [setHighlightedCell]
  );

  const handleDrag = useCallback(
    (event) => {
      const [board_name, i, j] = event.target.id.split("_");
      const source_identifier = board_name + "_" + i + "_" + j;
      if (
        !utils.is_picking_allowed(
          gameStage,
          turn,
          utils.get_piece_color_and_name(
            sideBoardPieces,
            mainBoardPieces,
            source_identifier
          )[0]
        )
      )
        return;

      event.dataTransfer.setData("source_boardname_i_j", source_identifier);
      setPickedPiece(source_identifier);
    },
    [setPickedPiece, turn, gameStage, mainBoardPieces, sideBoardPieces]
  );

  const move_the_piece = useCallback(
    (
      gameStage,
      source_cell_identifier,
      dest_cell_identifier,
      source_piece_color_and_name
    ) => {
      const cell_identifier_to_index = (cell_identifier) => {
        let [board_name, i, j] = cell_identifier.split("_");
        return parseInt(i) * 8 + parseInt(j);
      };
      if (gameStage === utils.GAME_STAGES.Strategise) {
        let pieces_to_drop = {};
        pieces_to_drop[source_cell_identifier] =
          utils.EMPTY_PIECE_COLOR_AND_NAME;
        pieces_to_drop[dest_cell_identifier] = source_piece_color_and_name;
        // let dest_piece_color_and_name =
        //   dest_piece_color + "_" + dest_piece_name;
        // if (dest_piece_color_and_name !== utils.EMPTY_PIECE_COLOR_AND_NAME) {
        //   pieces_to_drop[dest_piece_color_and_name] =
        //     utils.get_first_empty_cell_on_drawers(sideBoardPieces);
        // }
        utils.drop_pieces_on_cell(
          gameStage,
          pieces_to_drop,
          sideBoardPieces,
          mainBoardPieces,
          setSideBoardPieces,
          setMainBoardPieces
        );
        setPickedPiece(null);
      } else {
        axios
          .get(
            utils.api_v1_endpoint +
              "/make_a_move?id=" +
              myId +
              "&init_index=" +
              cell_identifier_to_index(source_cell_identifier) +
              "&final_index=" +
              cell_identifier_to_index(dest_cell_identifier)
          )
          .then((response) => {
            getMyGameStateFromApiAndSet()
              .then(() => {
                setPickedPiece(null);
              })
              .catch((error) => {
                // shouldn't happen; send logs for monitoring
                // console.log(error);
              });
          })
          .catch((resp) => {
            console.log(resp);
          });
      }
    },
    [
      getMyGameStateFromApiAndSet,
      mainBoardPieces,
      myId,
      setMainBoardPieces,
      setPickedPiece,
      setSideBoardPieces,
      sideBoardPieces,
    ]
  );

  const attempt_to_move_piece = useCallback(
    (source_cell_identifier, dest_cell_identifier) => {
      if (
        !utils.is_this_move_allowed(
          turn,
          gameStage,
          source_cell_identifier,
          dest_cell_identifier
        )
      ) {
        return false;
      }
      const [dest_piece_color, dest_piece_name] =
        utils.get_piece_color_and_name(
          sideBoardPieces,
          mainBoardPieces,
          dest_cell_identifier
        );

      const [source_piece_color, source_piece_name] =
        utils.get_piece_color_and_name(
          sideBoardPieces,
          mainBoardPieces,
          source_cell_identifier
        );

      if (source_piece_color === dest_piece_color) {
        setPickedPiece(dest_cell_identifier);
      } else {
        move_the_piece(
          gameStage,
          source_cell_identifier,
          dest_cell_identifier,
          source_piece_color + "_" + source_piece_name
        );
      }
      setHighlightedCell(null);
      return true;
    },
    [
      sideBoardPieces,
      mainBoardPieces,
      gameStage,
      setHighlightedCell,
      setPickedPiece,
      turn,
      move_the_piece,
    ]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const [source_boardname, source_i, source_j] = event.dataTransfer
        .getData("source_boardname_i_j")
        .split("_");

      if (
        source_boardname !== utils.CHESSBOARD &&
        source_boardname !== utils.DRAWER
      )
        return;

      const source_cell_identifier =
        source_boardname + "_" + source_i + "_" + source_j;

      const target_cell_identifier = utils.get_cell_identifier_from_target(
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
      if (!utils.is_picking_allowed(gameStage, turn)) return; // if not my turn, then reTurn
      const clicked_piece_cell_identifier =
        utils.get_cell_identifier_from_target(event.target);
      if (pickedPiece !== null) {
        const source_cell_identifier = pickedPiece;
        const dest_cell_identifier = clicked_piece_cell_identifier;
        attempt_to_move_piece(source_cell_identifier, dest_cell_identifier);
      } else {
        const [piece_color, piece_name] = utils.get_piece_color_and_name(
          sideBoardPieces,
          mainBoardPieces,
          clicked_piece_cell_identifier
        );
        if (!utils.is_picking_allowed(gameStage, turn, piece_color)) return; // if not my turn, then reTurn

        if (piece_color + "_" + piece_name !== utils.EMPTY_PIECE_COLOR_AND_NAME)
          setPickedPiece(clicked_piece_cell_identifier);
      }
    },
    [
      turn,
      pickedPiece,
      attempt_to_move_piece,
      mainBoardPieces,
      setPickedPiece,
      sideBoardPieces,
      gameStage,
    ]
  );

  useEffect(() => {
    let cells = [];
    for (let j = 0; j < 8; j++) {
      const [piece_color, piece_name] = utils.get_piece_color_and_name(
        sideBoardPieces,
        mainBoardPieces,
        utils.get_cell_identifier(board_name, row_i, j)
      );
      const black = (row_i + j) % 2 === 1;
      const cell_identifier = board_name + "_" + row_i + "_" + j;
      const deactivatedDuringStrategising =
        gameStage === utils.GAME_STAGES.Strategise &&
        utils.is_deactivated_during_strategising(board_name, row_i, j);
      cells.push(
        <div
          className={
            classes +
            " cell" +
            (black ? " black" : "") +
            (highlightedCell === cell_identifier ? " highlighted" : "") +
            (pickedPiece === cell_identifier ? "  picked" : "") +
            (deactivatedDuringStrategising ? " deactivated" : "")
          }
          key={j}
          id={cell_identifier}
          onDragOver={deactivatedDuringStrategising ? () => {} : handleDragOver}
          onDrop={deactivatedDuringStrategising ? () => {} : handleDrop}
          onDragStart={deactivatedDuringStrategising ? () => {} : handleDrag}
          onDragEnd={deactivatedDuringStrategising ? () => {} : handleDragEnd}
          onClick={deactivatedDuringStrategising ? () => {} : handleClick}
        >
          <span
            className="piece"
            draggable={
              piece_color + "_" + piece_name !==
                utils.EMPTY_PIECE_COLOR_AND_NAME &&
              utils.is_picking_allowed(gameStage, turn, piece_color)
            }
            id={cell_identifier + "_" + piece_color + "_" + piece_name}
          >
            {utils.color_to_name_to_unicode[piece_color][piece_name]}
          </span>
        </div>
      );
    }
    setRowOfCells(cells);
  }, [
    highlightedCell,
    sideBoardPieces,
    mainBoardPieces,
    pickedPiece,
    board_name,
    classes,
    gameStage,
    handleClick,
    handleDrag,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    row_i,
    turn,
  ]);

  return <div className="row">{rowOfCells}</div>;
};

export default RowOfDragOverableCells;
