import React, { useLayoutEffect, useState } from "react";
import "./Chessboard.css";

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
    const newPieces = [...pieces];
    newPieces[sourceIndex] = "";
    newPieces[targetIndex] = piece;
    console.log(event);
    console.log(`Moved piece ${piece} from ${sourceIndex} to ${targetIndex}`);
    setPieces(newPieces);
  };

  const [rowsState, setRowsState] = useState([]);

  useLayoutEffect(() => {
    const rows = [];
    for (let i = 0; i < 8; i++) {
      const cells = [];
      for (let j = 0; j < 8; j++) {
        const black = (i + j) % 2 === 1;
        const index = i * 8 + j;
        cells.push(
          <div
            className={"cell" + (black ? " black" : "")}
            key={index}
            onDragOver={(event) => event.preventDefault()}
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
  }, [pieces]);
  return <div className="board">{rowsState}</div>;
};

export default Chessboard;
