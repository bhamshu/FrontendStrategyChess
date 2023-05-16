import "./Chessboard.css";
import Chessboard from "./Chessboard";
import Drawers from "./Drawers";
import NameForm from "./NameForm";
import * as utils from "./utils_and_consts.js";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import axios from "axios";

const default_state = {
  gameStage: utils.GAME_STAGES.EnterName,
  jsxToBeReturned: <div></div>,
  highlightedCell: null,
  pickedPiece: null,
  mainBoardPieces: Array(64).fill(utils.EMPTY_PIECE_COLOR_AND_NAME),
  sideBoardPieces: Array(32).fill(utils.EMPTY_PIECE_COLOR_AND_NAME),
  Opponent: "Opponent",
};

function App() {
  const [gameStage, setGameStage] = useState(default_state.gameStage);

  // According to the stage of the game.
  const [jsxToBeReturned, setJsxToBeReturned] = useState(
    default_state.jsxToBeReturned
  );

  const [highlightedCell, setHighlightedCell] = useState(
    default_state.highlightedCell
  );
  const [pickedPiece, setPickedPiece] = useState(default_state.pickedPiece);

  const [mainBoardPieces, setMainBoardPieces] = useState(
    default_state.mainBoardPieces
  );
  const [sideBoardPieces, setSideBoardPieces] = useState(
    default_state.sideBoardPieces
  );

  const [myId, setMyId] = useState(null);
  const [myName, setMyName] = useState(null);
  const [partnerName, setPartnerName] = useState(default_state.Opponent);

  const [activePlayers, setActivePlayers] = useState([]);
  const [activePlayersSpans, setActivePlayersSpans] = useState([]);
  const [activeRequestsSpans, setActiveRequestsSpans] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);

  const [turn, setTurn] = useState(null);
  const [winnerName, setWinnerName] = useState(null);

  const reset_state_and_local_storage = () => {
    setGameStage(default_state.gameStage);
    setPartnerName(default_state.Opponent);
    setHighlightedCell(default_state.highlightedCell);
    setPickedPiece(default_state.pickedPiece);
    setMainBoardPieces(default_state.mainBoardPieces);
    setSideBoardPieces(default_state.sideBoardPieces);
    setActivePlayers([]);
    setActiveRequests([]);
    setActivePlayersSpans([]);
    setActiveRequestsSpans([]);
    setTurn(null);
    setWinnerName(null);
  };

  const getMyGameStateFromApiAndSet = useCallback(() => {
    return axios
      .get(utils.api_v1_endpoint + "/get_my_game_state?id=" + myId)
      .then((resp) => {
        setStatesFromApiResponse(resp);
      })
      .catch((error) => {
        // shouldn't happen; send logs for monitoring
        alert(error);
      });
  }, [myId]);

  const setStatesFromApiResponse = (resp) => {
    setGameStage(resp.data.state.stage);
    setMainBoardPieces(resp.data.state.main_board);
    setSideBoardPieces(resp.data.state.side_drawers);
    setTurn(resp.data.turn);
    setPartnerName(resp.data.partner_pub_name);

    let user_game_info = JSON.parse(localStorage.getItem("user_game_info"));
    user_game_info["state"] = resp.data.state;
    localStorage.setItem("user_game_info", JSON.stringify(user_game_info));

    if (resp.data.state.winner_uniq_pub_name) {
      setWinnerName(resp.data.state.winner_uniq_pub_name);
    }
  };

  const handleNameSubmit = useCallback((name) => {
    axios
      .get(utils.api_v1_endpoint + "/register_player?uniq_pub_name=" + name)
      .then((resp) => {
        const user_game_info = {
          id: resp.data.id,
          uniq_pub_name: resp.data.uniq_pub_name,
          state: resp.data.state,
        };
        setMyId(resp.data.id);
        setMyName(resp.data.uniq_pub_name);
        localStorage.setItem("user_game_info", JSON.stringify(user_game_info));
        setStatesFromApiResponse(resp);
      })
      .catch(function (error) {
        if (error.response.status === 406) {
          alert("Username Already Chosen by Someone Else :(");
        } else {
          alert(error);
        }
      });
  }, []);

  const handleNewPlayerOnMkt = useCallback(
    (data) => {
      let new_player_name = data["message"];
      let active_players = new Set([...activePlayers, new_player_name]);
      active_players.delete(myName);
      setActivePlayers(active_players);
      setActivePlayersSpans(
        Array.from(active_players).map((player_name) =>
          get_span_for_player("Challenge", player_name, () => {
            axios
              .get(
                utils.api_v1_endpoint +
                  "/send_request_to_player?id=" +
                  myId +
                  "&partner_pub_name=" +
                  player_name
              )
              .then((resp) => {
                console.log(resp);
              });
          })
        )
      );
    },
    [myId, activePlayers, myName]
  );

  const get_span_for_player = (button_text, player_name, onclick_callback) => {
    return (
      <span>
        <span style={{ margin: "5px" }}>{player_name}</span>
        <button onClick={onclick_callback}>{button_text}</button>
      </span>
    );
  };

  // TODO: abstract out common code from handleNewRequests and handleNewPlayerOnMkt
  // Maybe make a component called UniqueListWithButtons
  const handleNewRequests = useCallback(
    (data) => {
      let new_player_name = data["message"];
      let active_requests = new Set([...activeRequests, new_player_name]);
      active_requests.delete(myName);
      setActiveRequests(active_requests);
      setActiveRequestsSpans(
        Array.from(active_requests).map((player_name) =>
          get_span_for_player("Accept", player_name, () => {
            axios
              .get(
                utils.api_v1_endpoint +
                  "/accept_request_and_start_game?id=" +
                  myId +
                  "&partner_pub_name=" +
                  player_name
              )
              .then((resp) => {
                setStatesFromApiResponse(resp);
              })
              .catch(function (error) {
                console.log(error);
                alert(
                  "The player seems to have gone offline or paired with someone else."
                );
              });
          })
        )
      );
    },
    [myId, activeRequests, myName]
  );

  useEffect(() => {
    utils.singles_channel.bind("new_player_on_mkt", handleNewPlayerOnMkt);
  }, [handleNewPlayerOnMkt]);

  useEffect(() => {
    if (myId) {
      let my_channel = utils.pusher.subscribe(myId);
      my_channel.bind("challenge_request", handleNewRequests);
      my_channel.bind("challenge_accepted", (data) => {
        getMyGameStateFromApiAndSet();
      });
      my_channel.bind("opponent_moved", (data) => {
        getMyGameStateFromApiAndSet();
      });
      my_channel.bind("opponent_resigned", (data) => {
        alert("Opponent resigned.");
        getMyGameStateFromApiAndSet();
      });
    }
  }, [myId, handleNewRequests, getMyGameStateFromApiAndSet]);

  useLayoutEffect(() => {
    const user_game_info = JSON.parse(localStorage.getItem("user_game_info"));
    if (user_game_info) {
      console.log(user_game_info);
      setMyId(user_game_info.id);
      setMyName(user_game_info.uniq_pub_name);
      setGameStage(user_game_info.state.stage);
      setPartnerName(user_game_info.partner_pub_name);
    } else {
      setGameStage(utils.GAME_STAGES.EnterName);
    }
  }, [getMyGameStateFromApiAndSet, myId]);

  useLayoutEffect(() => {
    if (myId) getMyGameStateFromApiAndSet();
  }, [myId, getMyGameStateFromApiAndSet]);

  useLayoutEffect(() => {
    if (gameStage === utils.GAME_STAGES.EnterName) {
      setJsxToBeReturned(
        <div className="container mx-auto">
          <NameForm onSubmit={handleNameSubmit} />
        </div>
      );
    } else {
       // TODO: take out these buttons from here and put them in a separate file.
      setJsxToBeReturned(
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
            gameStage,
            myId,
            getMyGameStateFromApiAndSet,
            turn,
          }}
        >
          {gameStage === utils.GAME_STAGES.GamePlay ? (
            <div className="top" style={{ textAlign: "center" }}>
              {turn === utils.MyTurn ? (
                <p>It is your turn</p>
              ) : (
                <p>It is {partnerName}'s turn</p>
              )}
              <p>{partnerName}'s Board</p>
            </div>
          ) : (
            <div>
              {gameStage === utils.GAME_STAGES.GameOver ? (
                <div>GAME OVER - {winnerName} WON</div>
              ) : (
                <div></div>
              )}
            </div>
          )}
          <Drawers row_i={0} />
          <Drawers row_i={1} />
          <Chessboard></Chessboard>
          <Drawers row_i={2} />
          <Drawers row_i={3} />
          <div className="bottom" style={{ textAlign: "center" }}>
            <p>{myName}'s Board</p>
            {gameStage === utils.GAME_STAGES.Strategise ? (
              <div>
                <button
                  onClick={() => {
                    axios
                      .get(
                        utils.api_v1_endpoint +
                          "/mark_player_ready?id=" +
                          myId +
                          "&main_board=" +
                          JSON.stringify(mainBoardPieces) +
                          "&side_drawers=" +
                          JSON.stringify(sideBoardPieces)
                      )
                      .then((resp) => {
                        setStatesFromApiResponse(resp);
                      });
                  }}
                >
                  Lock Starting Position and Look For Partners
                </button>
                <p>
                  Arrange the pieces on your side of the board to gain an
                  advantage against your opponent.
                </p>
              </div>
            ) : (
              <div></div>
            )}
            {gameStage === utils.GAME_STAGES.GamePlay ? (
              <button
                style={{ margin: "10px" }}
                onClick={() => {
                  axios
                    .get(utils.api_v1_endpoint + "/resign?id=" + myId)
                    .then((resp) => {
                      console.log(resp);
                      reset_state_and_local_storage();
                    })
                    .catch(function (error) {
                      alert(error);
                    });
                }}
              >
                Resign
              </button>
            ) : (
              <button
                style={{ margin: "10px" }}
                onClick={reset_state_and_local_storage}
              >
                New Game
              </button>
            )}
          </div>
        </utils.CompleteContext.Provider>
      );
    }
  }, [
    mainBoardPieces,
    sideBoardPieces,
    highlightedCell,
    pickedPiece,
    gameStage,
    getMyGameStateFromApiAndSet,
    handleNameSubmit,
    myId,
    turn,
    myName,
    partnerName,
    winnerName,
  ]);

  return (
    <div
      className={
        "root " + (gameStage === utils.GAME_STAGES.GameOver ? " game_over" : "")
      }
    >
      <div className="active_players">
        {gameStage === utils.GAME_STAGES.PartnerSelection
          ? activePlayersSpans
          : []}
      </div>
      <div className="App">{jsxToBeReturned}</div>
      <div className="active_requests">
        {gameStage === utils.GAME_STAGES.PartnerSelection
          ? activeRequestsSpans
          : []}
      </div>
    </div>
  );
}

export default App;
