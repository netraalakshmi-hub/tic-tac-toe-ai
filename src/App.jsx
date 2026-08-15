import { useEffect, useState } from "react";
import "./App.css";

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;

    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return {
        winner: board[a],
        cells: combo,
      };
    }
  }

  if (board.every((cell) => cell !== "")) {
    return {
      winner: "DRAW",
      cells: [],
    };
  }

  return null;
}

function getEmptyCells(board) {
  return board
    .map((cell, index) =>
      cell === "" ? index : null
    )
    .filter((index) => index !== null);
}

function findWinningMove(board, symbol) {
  const emptyCells = getEmptyCells(board);

  for (const index of emptyCells) {
    const testBoard = [...board];

    testBoard[index] = symbol;

    const result = checkWinner(testBoard);

    if (result?.winner === symbol) {
      return index;
    }
  }

  return null;
}

function getAIMove(board, aiSymbol, playerSymbol) {
  // AI tries to win
  const winningMove = findWinningMove(
    board,
    aiSymbol
  );

  if (winningMove !== null) {
    return winningMove;
  }

  // AI blocks player
  const blockingMove = findWinningMove(
    board,
    playerSymbol
  );

  if (blockingMove !== null) {
    return blockingMove;
  }

  // Center
  if (board[4] === "") {
    return 4;
  }

  // Corners
  const corners = [0, 2, 6, 8];

  const availableCorners = corners.filter(
    (index) => board[index] === ""
  );

  if (availableCorners.length > 0) {
    return availableCorners[
      Math.floor(
        Math.random() *
          availableCorners.length
      )
    ];
  }

  // Any empty cell
  const emptyCells = getEmptyCells(board);

  if (emptyCells.length > 0) {
    return emptyCells[
      Math.floor(
        Math.random() *
          emptyCells.length
      )
    ];
  }

  return null;
}

function App() {
  // ========================================
  // GAME MODE
  // ========================================

  const [gameMode, setGameMode] =
    useState(null);

  // ========================================
  // BOARD
  // ========================================

  const [board, setBoard] = useState(
    Array(9).fill("")
  );

  // ========================================
  // PLAYER SYMBOL
  // ========================================

  const [playerSymbol, setPlayerSymbol] =
    useState(null);

  // ========================================
  // CURRENT TURN
  // ========================================

  const [currentTurn, setCurrentTurn] =
    useState(null);

  // ========================================
  // AI
  // ========================================

  const [aiThinking, setAiThinking] =
    useState(false);

  // ========================================
  // GAME RESULT
  // ========================================

  const [winner, setWinner] =
    useState(null);

  const [winningCells, setWinningCells] =
    useState([]);

  const [gameOver, setGameOver] =
    useState(false);

  const [gameStarted, setGameStarted] =
    useState(false);

  // ========================================
  // ROUND
  // ========================================

  const [round, setRound] =
    useState(1);

  // ========================================
  // SCORES
  // ========================================

  const [scores, setScores] = useState({
    player1: 0,
    player2: 0,
  });

  // ========================================
  // AI SYMBOL
  // ========================================

  const aiSymbol =
    playerSymbol === "X" ? "O" : "X";

  // ========================================
  // START AI GAME
  // ========================================

  const startAIGame = (symbol) => {
    setGameMode("ai");

    setPlayerSymbol(symbol);

    setBoard(Array(9).fill(""));

    setWinner(null);

    setWinningCells([]);

    setGameOver(false);

    setGameStarted(true);

    if (symbol === "X") {
      // YOU START
      setCurrentTurn("X");
      setAiThinking(false);
    } else {
      // AI STARTS
      setCurrentTurn("X");
      setAiThinking(true);
    }
  };

  // ========================================
  // START FRIEND GAME
  // ========================================

  const startFriendGame = () => {
    setGameMode("friend");

    setPlayerSymbol(null);

    setBoard(Array(9).fill(""));

    setWinner(null);

    setWinningCells([]);

    setGameOver(false);

    setGameStarted(true);

    // Player 1 = X starts
    setCurrentTurn("X");

    setAiThinking(false);
  };

  // ========================================
  // FINISH GAME
  // ========================================

  const finishGame = (result) => {
    setWinner(result.winner);

    setWinningCells(result.cells);

    setGameOver(true);

    setAiThinking(false);

    if (gameMode === "ai") {
      if (result.winner === playerSymbol) {
        setScores((previous) => ({
          ...previous,
          player1:
            previous.player1 + 1,
        }));
      }

      if (result.winner === aiSymbol) {
        setScores((previous) => ({
          ...previous,
          player2:
            previous.player2 + 1,
        }));
      }
    }

    if (gameMode === "friend") {
      if (result.winner === "X") {
        setScores((previous) => ({
          ...previous,
          player1:
            previous.player1 + 1,
        }));
      }

      if (result.winner === "O") {
        setScores((previous) => ({
          ...previous,
          player2:
            previous.player2 + 1,
        }));
      }
    }
  };

  // ========================================
  // PLAYER MOVE
  // ========================================

  const handlePlayerMove = (index) => {
    if (
      !gameStarted ||
      gameOver ||
      aiThinking ||
      board[index]
    ) {
      return;
    }

    // AI MODE
    if (gameMode === "ai") {
      if (currentTurn !== playerSymbol) {
        return;
      }

      const newBoard = [...board];

      newBoard[index] = playerSymbol;

      const result = checkWinner(newBoard);

      setBoard(newBoard);

      if (result) {
        finishGame(result);
        return;
      }

      setCurrentTurn(aiSymbol);

      setAiThinking(true);

      return;
    }

    // FRIEND MODE
    if (gameMode === "friend") {
      const newBoard = [...board];

      newBoard[index] = currentTurn;

      const result = checkWinner(newBoard);

      setBoard(newBoard);

      if (result) {
        finishGame(result);
        return;
      }

      // Switch player
      setCurrentTurn(
        currentTurn === "X"
          ? "O"
          : "X"
      );
    }
  };

  // ========================================
  // AI MOVE
  // ========================================

  useEffect(() => {
    if (
      gameMode !== "ai" ||
      !gameStarted ||
      gameOver ||
      !aiThinking ||
      currentTurn !== aiSymbol
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const aiMove = getAIMove(
        board,
        aiSymbol,
        playerSymbol
      );

      if (aiMove === null) {
        setAiThinking(false);
        return;
      }

      const newBoard = [...board];

      newBoard[aiMove] = aiSymbol;

      const result = checkWinner(newBoard);

      setBoard(newBoard);

      setAiThinking(false);

      if (result) {
        finishGame(result);
        return;
      }

      setCurrentTurn(playerSymbol);
    }, 700);

    return () => clearTimeout(timer);
  }, [
    gameMode,
    gameStarted,
    gameOver,
    aiThinking,
    currentTurn,
    board,
    aiSymbol,
    playerSymbol,
  ]);

  // ========================================
  // RESTART ROUND
  // ========================================

  const restartRound = () => {
    setBoard(Array(9).fill(""));

    setWinner(null);

    setWinningCells([]);

    setGameOver(false);

    setRound(
      (previous) => previous + 1
    );

    if (gameMode === "ai") {
      if (playerSymbol === "X") {
        setCurrentTurn("X");
        setAiThinking(false);
      } else {
        setCurrentTurn("X");
        setAiThinking(true);
      }
    }

    if (gameMode === "friend") {
      setCurrentTurn("X");
      setAiThinking(false);
    }
  };

  // ========================================
  // CHANGE MODE
  // ========================================

  const changeMode = () => {
    setGameMode(null);

    setBoard(Array(9).fill(""));

    setPlayerSymbol(null);

    setCurrentTurn(null);

    setAiThinking(false);

    setWinner(null);

    setWinningCells([]);

    setGameOver(false);

    setGameStarted(false);
  };

  // ========================================
  // RESET SCORE
  // ========================================

  const resetScore = () => {
    setScores({
      player1: 0,
      player2: 0,
    });

    setRound(1);

    setGameMode(null);

    setBoard(Array(9).fill(""));

    setPlayerSymbol(null);

    setCurrentTurn(null);

    setAiThinking(false);

    setWinner(null);

    setWinningCells([]);

    setGameOver(false);

    setGameStarted(false);
  };

  // ========================================
  // STATUS
  // ========================================

  const getStatus = () => {
    if (winner === "DRAW") {
      return (
        <>
          <span className="winner-star">
            ◇
          </span>

          DRAW GAME

          <span className="winner-star">
            ◇
          </span>
        </>
      );
    }

    if (gameMode === "ai") {
      if (winner === playerSymbol) {
        return (
          <>
            <span className="winner-star">
              ✦
            </span>

            YOU WIN

            <span className="winner-star">
              ✦
            </span>
          </>
        );
      }

      if (winner === aiSymbol) {
        return (
          <>
            <span className="winner-star">
              ✦
            </span>

            AI WINS

            <span className="winner-star">
              ✦
            </span>
          </>
        );
      }

      if (aiThinking) {
        return (
          <>
            AI IS THINKING

            <span className="thinking-dots">
              •••
            </span>
          </>
        );
      }

      return (
        <>
          YOUR MOVE

          <span
            className={
              playerSymbol === "X"
                ? "status-x"
                : "status-o"
            }
          >
            {playerSymbol}
          </span>
        </>
      );
    }

    if (gameMode === "friend") {
      if (winner === "X") {
        return (
          <>
            <span className="winner-star">
              ✦
            </span>

            PLAYER 1 WINS

            <span className="winner-star">
              ✦
            </span>
          </>
        );
      }

      if (winner === "O") {
        return (
          <>
            <span className="winner-star">
              ✦
            </span>

            PLAYER 2 WINS

            <span className="winner-star">
              ✦
            </span>
          </>
        );
      }

      return (
        <>
          PLAYER{" "}
          {currentTurn === "X"
            ? "1"
            : "2"}

          <span
            className={
              currentTurn === "X"
                ? "status-x"
                : "status-o"
            }
          >
            {currentTurn}
          </span>
          TURN
        </>
      );
    }

    return null;
  };

  // ========================================
  // UI
  // ========================================

  return (
    <main className="game-page">

      <div className="stars stars-one"></div>

      <div className="stars stars-two"></div>

      <div className="stars stars-three"></div>

      <div className="ambient-glow glow-one"></div>

      <div className="ambient-glow glow-two"></div>

      {/* NAV */}

      <nav className="game-nav">

        <div></div>

        <div className="nav-label">
          AI PLAYGROUND
        </div>

      </nav>

      {/* MAIN */}

      <section className="game-container">

        {/* HEADER */}

        <div className="game-header">

          <div className="eyebrow">

            <span className="live-dot"></span>

            HUMAN VS AI

          </div>

          <h1>
            Tic<span>—</span>Tac<span>—</span>Toe
          </h1>

          <p>
            A small experiment in interactive AI.
            <br />
            Can you outsmart the machine?
          </p>

        </div>

        {/* CARD */}

        <div className="game-card">

          {/* TOP */}

          <div className="card-top">

            <div>

              <div className="card-label">
                CURRENT MATCH
              </div>

              <div className="match-title">

                {gameMode === "friend"
                  ? "FRIEND VS FRIEND"
                  : "HUMAN VS NEURAL ENGINE"}

              </div>

            </div>

            <div className="round-status">

              ROUND{" "}

              {String(round).padStart(
                2,
                "0"
              )}

            </div>

          </div>

          {/* MODE SELECT */}

          {!gameMode && (

            <div className="choose-side">

              <div className="choose-label">
                CHOOSE GAME MODE
              </div>

              <div className="side-buttons">

                <button
                  className="side-button side-x"
                  onClick={() =>
                    setGameMode("select-ai")
                  }
                >

                  <span>
                    01
                  </span>

                  <small>
                    YOU VS AI
                  </small>

                </button>

                <div className="side-vs">
                  OR
                </div>

                <button
                  className="side-button side-o"
                  onClick={() =>
                    startFriendGame()
                  }
                >

                  <span>
                    02
                  </span>

                  <small>
                    FRIEND VS FRIEND
                  </small>

                </button>

              </div>

            </div>

          )}

          {/* AI SIDE SELECTION */}

          {gameMode === "select-ai" && (

            <div className="choose-side">

              <div className="choose-label">
                CHOOSE YOUR SIDE
              </div>

              <div className="side-buttons">

                <button
                  className="side-button side-x"
                  onClick={() =>
                    startAIGame("X")
                  }
                >

                  <span>
                    X
                  </span>

                  <small>
                    YOU START
                  </small>

                </button>

                <div className="side-vs">
                  VS
                </div>

                <button
                  className="side-button side-o"
                  onClick={() =>
                    startAIGame("O")
                  }
                >

                  <span>
                    O
                  </span>

                  <small>
                    AI STARTS
                  </small>

                </button>

              </div>

              <button
                className="reset-button"
                onClick={() =>
                  setGameMode(null)
                }
                style={{
                  marginTop: "20px",
                }}
              >
                ← BACK
              </button>

            </div>

          )}

          {/* SCORE */}

          {gameMode &&
            gameMode !== "select-ai" && (

            <div className="score-board">

              <div
                className={`player ${
                  currentTurn === "X" &&
                  gameStarted &&
                  !gameOver
                    ? "active"
                    : ""
                }`}
              >

                <span className="player-symbol x-symbol">
                  X
                </span>

                <div>

                  <span className="player-name">

                    {gameMode === "friend"
                      ? "PLAYER 1"
                      : playerSymbol === "X"
                      ? "YOU"
                      : "AI"}

                  </span>

                  <strong>
                    {scores.player1}
                  </strong>

                </div>

              </div>

              <div className="versus">
                VS
              </div>

              <div
                className={`player player-o ${
                  currentTurn === "O" &&
                  gameStarted &&
                  !gameOver
                    ? "active"
                    : ""
                }`}
              >

                <div>

                  <span className="player-name">

                    {gameMode === "friend"
                      ? "PLAYER 2"
                      : playerSymbol === "O"
                      ? "YOU"
                      : "AI"}

                  </span>

                  <strong>
                    {scores.player2}
                  </strong>

                </div>

                <span className="player-symbol o-symbol">
                  O
                </span>

              </div>

            </div>

          )}

          {/* STATUS */}

          {gameStarted && (

            <div className="game-status">
              {getStatus()}
            </div>

          )}

          {/* BOARD */}

          {gameStarted && (

            <div className="board">

              {board.map(
                (cell, index) => {

                  const isWinningCell =
                    winningCells.includes(
                      index
                    );

                  return (

                    <button
                      key={index}

                      className={`cell ${
                        cell === "X"
                          ? "cell-x"
                          : ""
                      } ${
                        cell === "O"
                          ? "cell-o"
                          : ""
                      } ${
                        isWinningCell
                          ? "winning-cell"
                          : ""
                      }`}

                      onClick={() =>
                        handlePlayerMove(
                          index
                        )
                      }

                      disabled={
                        Boolean(cell) ||
                        gameOver ||
                        aiThinking ||
                        (
                          gameMode === "ai" &&
                          currentTurn !==
                            playerSymbol
                        )
                      }
                    >

                      {!cell &&
                        !gameOver &&
                        !aiThinking && (

                        <span className="cell-hover">
                          +
                        </span>

                      )}

                      {cell && (

                        <span className="mark">
                          {cell}
                        </span>

                      )}

                    </button>

                  );
                }
              )}

            </div>

          )}

          {/* ACTIONS */}

          <div className="game-actions">

            {/* RESTART ONLY AFTER RESULT */}

            {gameStarted &&
              gameOver && (

              <button
                className="restart-button"
                onClick={restartRound}
              >

                <span>
                  ↻
                </span>

                RESTART ROUND

              </button>

            )}

            {/* CHANGE MODE */}

            {gameMode &&
              gameMode !== "select-ai" && (

              <button
                className="new-game-button"
                onClick={changeMode}
              >

                <span>
                  ⇄
                </span>

                CHANGE MODE

              </button>

            )}

            {/* RESET SCORE */}

            <button
              className="reset-button"
              onClick={resetScore}
            >
              RESET SCORE
            </button>

          </div>

          {/* FOOTER */}

          <div className="card-footer">

            <span>
              REACT
            </span>

            <span className="footer-dot">
              •
            </span>

            <span>
              AI LOGIC
            </span>

            <span className="footer-dot">
              •
            </span>

            <span>
              TWO PLAYER
            </span>

          </div>

        </div>

        {/* BOTTOM */}

        <div className="bottom-note">

          <span className="line"></span>

          <span>
            HUMAN INTELLIGENCE ·
            ARTIFICIAL INTELLIGENCE
          </span>

          <span className="line"></span>

        </div>

      </section>

    </main>
  );
}

export default App;