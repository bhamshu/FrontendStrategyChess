import Pusher from "pusher-js";
import React from "react";

// This is to keep id in memory. Otherwise it's stored in localStorage too.
// There's no automatic manager for this, clients should take care.

export const BLACK = "Black";
export const WHITE = "White";
export const NONE = "None";

export const list_of_active_players = [];

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

export const pusher = new Pusher("3dd1a723a432d39bf47e", {
  cluster: "mt1",
});
export const singles_channel = pusher.subscribe("singles");

// See description of all stages at https://github.com/bhamshu/StrategyChess/blob/main/README.md
export const GAME_STAGES = {
  EnterName: "EnterName",
  Strategise: "Strategise",
  PartnerSelection: "PartnerSelection",
  GamePlay: "GamePlay",
  GameOver: "GameOver",
};

export const CompleteContext = React.createContext(null);

export const api_v1_endpoint = "http://192.168.1.68:3000/api/v1";

export const unicode_to_color = (piece) => {
  if (piece >= "\u265A" && piece <= "\u265F") {
    return BLACK;
  } else if (piece >= "\u2654" && piece <= "\u2659") {
    return WHITE;
  }
  console.assert(false, piece + "is not a chess piece.");
  return "not_a_piece";
};

let _color_to_name_to_unicode = {};
_color_to_name_to_unicode[BLACK] = {
  King: "\u265A",
  Queen: "\u265B",
  Rook: "\u265C",
  Knight: "\u265E",
  Bishop: "\u265D",
  Pawn: "\u265F",
};
_color_to_name_to_unicode[WHITE] = {
  King: "\u2654",
  Queen: "\u2655",
  Rook: "\u2656",
  Knight: "\u2658",
  Bishop: "\u2657",
  Pawn: "\u2659",
};

_color_to_name_to_unicode[NONE] = {
  None: "\u2800",
};

export const color_to_name_to_unicode = _color_to_name_to_unicode;
export const EMPTY_PIECE_COLOR_AND_NAME = NONE + "_" + "None";

export const DRAWER = "drawer";
export const CHESSBOARD = "chessboard";

export const get_first_empty_cell_on_drawers = (sideBoardPieces) => {
  for (let i = 0; i < sideBoardPieces.length; i++) {
    if (sideBoardPieces[i] === EMPTY_PIECE_COLOR_AND_NAME) {
      return DRAWER + "_" + Math.floor(i / 8) + "_" + (i % 8);
    }
  }
};

export const is_deactivated_during_strategising = (board_name, i, j) => {
  return !(board_name === CHESSBOARD && i >= 4);
};

export const get_cell_identifier = (board_name, row_i, col_j) => {
  return board_name + "_" + row_i + "_" + col_j;
};

export const get_cell_identifier_from_target = (target) => {
  // either of the text, the span of piece or the div of cell may become event.target
  const target_info = target.lastChild.parentNode.id.split("_");
  return get_cell_identifier(target_info[0], target_info[1], target_info[2]);
};

export const get_board_from_name = (
  board_name,
  sideBoardPieces,
  mainBoardPieces
) => {
  if (board_name === CHESSBOARD) return mainBoardPieces;
  else return sideBoardPieces;
};

export const get_board_setter_from_name = (
  board_name,
  setSideBoardPieces,
  setMainBoardPieces
) => {
  if (board_name === CHESSBOARD) return setMainBoardPieces;
  else return setSideBoardPieces;
};

export const get_piece_color_and_name = (
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

export const drop_pieces_on_cell = (
  gameStage,
  cell_identifier_to_piece_color_and_name,
  sideBoardPieces,
  mainBoardPieces,
  setSideBoardPieces,
  setMainBoardPieces
) => {
  // this method should only be called during strategising. Use setStatesFromApiResponse otherwise.
  if (gameStage !== GAME_STAGES.Strategise) return false;
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
};

export const OtherPersonsTurn = "OtherPersonsTurn";
export const MyTurn = "MyTurn";

export const is_this_move_allowed = (
  turn,
  gameStage,
  source_cell_identifier,
  dest_cell_identifier
) => {
  const [source_board_name, source_row_i, source_col_j] =
    source_cell_identifier.split("_");
  if (
    gameStage === GAME_STAGES.Strategise &&
    is_deactivated_during_strategising(
      source_board_name,
      source_row_i,
      source_col_j
    )
  )
    return false;
  const [dest_board_name, dest_row_i, dest_col_j] =
    dest_cell_identifier.split("_");

  if (
    gameStage === GAME_STAGES.Strategise &&
    is_deactivated_during_strategising(dest_board_name, dest_row_i, dest_col_j)
  )
    return false;

  if (gameStage === GAME_STAGES.PartnerSelection) return false;

  if (gameStage === GAME_STAGES.GamePlay)
    if (turn !== MyTurn) {
      alert("It's the other player's turn");
      return false;
    }

  return true;
};

export const is_picking_allowed = (gameStage, turn, piece_color = null) => {
  // if piece_color is not given, this method just makes the decision
  // based on gamestage and turn.
  if (gameStage === GAME_STAGES.PartnerSelection) return false;
  if (gameStage === GAME_STAGES.GamePlay && turn !== MyTurn) return false;
  if (piece_color) {
    if (piece_color !== WHITE) {
      return false;
    }
  }
  return true;
};
