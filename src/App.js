import React, { useLayoutEffect, useState } from "react";
import "./Chessboard.css";

const color_of_piece = (piece) => {
  if (piece >= "\u265A" && piece <= "\u265F") {
    return "black";
  } else if (piece >= "\u2654" && piece <= "\u2659") {
    return "white";
  }
  return "not_a_piece";
};

const Chessboard = () => {
  const [pieces, setPieces] = useState([
    "\u265C",
    "\u265E",
    "\u265D",
    "\u265B",
    "\u265A",
    "\u265D",
    "\u265E",
    "\u265C",
    "\u265F",
    "\u265F",
    "\u265F",
    "\u265F",
    "\u265F",
    "\u265F",
    "\u265F",
    "\u265F",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "\u2659",
    "\u2659",
    "\u2659",
    "\u2659",
    "\u2659",
    "\u2659",
    "\u2659",
    "\u2659",
    "\u2656",
    "\u2658",
    "\u2657",
    "\u2655",
    "\u2654",
    "\u2657",
    "\u2658",
    "\u2656",
  ]);

  const [highlightedCell, setHighlightedCell] = useState(null);

  const handleDrag = (event) => {
    event.dataTransfer.setData("source_index", event.target.id);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const pieceIndex = event.dataTransfer.getData("source_index");
    const sourceIndex = parseInt(pieceIndex);
    // either the span of piece or the div of cell may become event.target
    const targetIndex = parseInt(event.target.id || event.target.firstChild.id);
    const piece = pieces[sourceIndex];
    const targetPiece = pieces[targetIndex];
    if (color_of_piece(piece) == color_of_piece(targetPiece)) {
      setHighlightedCell(null);
      return;
    }
    const newPieces = [...pieces];
    newPieces[sourceIndex] = "";
    newPieces[targetIndex] = piece;
    console.log(event);
    console.log(`Moved piece ${piece} from ${sourceIndex} to ${targetIndex}`);
    setPieces(newPieces);
    setHighlightedCell(null);
  };

  const [rowsState, setRowsState] = useState([]);

  const handleDragOver = (event) => {
    event.preventDefault();
    const targetIndex = parseInt(event.target.id || event.target.firstChild.id);
    setHighlightedCell(targetIndex);
  };

  useLayoutEffect(() => {
    const rows = [];
    for (let i = 0; i < 8; i++) {
      const cells = [];
      for (let j = 0; j < 8; j++) {
        const black = (i + j) % 2 === 1;
        const index = i * 8 + j;
        cells.push(
          <div
            className={
              "cell" +
              (black ? " black" : "") +
              (highlightedCell === index ? " highlighted" : "")
            }
            key={index}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <span
              className="piece"
              id={index}
              draggable={pieces[index] !== ""}
              onDragStart={handleDrag}
            >
              {pieces[index]}
            </span>
          </div>
        );
      }
      rows.push(
        <div className="row" key={i}>
          {cells}
        </div>
      );
      setRowsState(rows);
    }
  }, [pieces, highlightedCell]);
  return <div className="board">{rowsState}</div>;
};

export default Chessboard;
