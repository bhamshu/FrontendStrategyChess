import React from "react";

export const BLACK = "Black";
export const WHITE = "White";
export const NONE = "None";

export const CompleteContext = React.createContext(null);

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
export const EMPTY_PIECE_COLOR_AND_NAME =
  NONE + "_" + color_to_name_to_unicode[NONE]["None"];

export const DRAWER = "drawer";
export const CHESSBOARD = "chessboard";

export const get_first_empty_cell_on_drawers = (sideBoardPieces) => {
  for (let i = 0; i < sideBoardPieces.length; i++) {
    if (sideBoardPieces[i] === EMPTY_PIECE_COLOR_AND_NAME) {
      return DRAWER + "_" + Math.floor(i / 8) + "_" + (i % 8);
    }
  }
};
