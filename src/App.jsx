import { useEffect, useState } from "react"
import "./App.css"

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function getWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo

    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return {
        player: board[a],
        cells: combo,
      }
    }
  }

  if (board.every((cell) => cell !== "")) {
    return {
      player: "DRAW",
      cells: [],
    }
  }

  return null
}

function getEmptyCells(board) {
  return board
    .map((cell, index) =>
      cell === "" ? index : null
    )
    .filter((index) => index !== null)
}

function findWinningMove(board, player) {
  const emptyCells = getEmptyCells(board)

  for (const index of emptyCells) {
    const testBoard = [...board]
    testBoard[index] = player

    const result = getWinner(testBoard)

    if (result?.player === player) {
      return index
    }
  }

  return null
}

function getAIMove(board, aiSymbol, playerSymbol) {
  // AI tries to win
  const winningMove = findWinningMove(
    board,
    aiSymbol
  )

  if (winningMove !== null) {
    return winningMove
  }

  // AI blocks you
  const blockingMove = findWinningMove(
    board,
    playerSymbol
  )

  if (blockingMove !== null) {
    return blockingMove
  }

  // Take center
  if (board[4] === "") {
    return 4
  }

  // Take a corner
  const corners = [0, 2, 6, 8]

  const availableCorners =
    corners.filter(
      (index) => board[index] === ""
    )

  if (availableCorners.length > 0) {
    return availableCorners[
      Math.floor(
        Math.random() *
        availableCorners.length
      )
    ]
  }

  // Take any remaining space
  const emptyCells =
    getEmptyCells(board)

  if (emptyCells.length > 0) {
    return emptyCells[
      Math.floor(
        Math.random() *
        emptyCells.length
      )
    ]
  }

  return null
}

function App() {

  // -------------------------
  // GAME STATE
  // -------------------------

  const [board, setBoard] = useState(
    Array(9).fill("")
  )

  const [playerSymbol, setPlayerSymbol] =
    useState(null)

  const [gameStarted, setGameStarted] =
    useState(false)

  const [currentTurn, setCurrentTurn] =
    useState(null)

  const [aiThinking, setAiThinking] =
    useState(false)

  const [winner, setWinner] =
    useState(null)

  const [winningCells, setWinningCells] =
    useState([])

  const [gameOver, setGameOver] =
    useState(false)

  const [round, setRound] =
    useState(1)

  const [scores, setScores] =
    useState({
      you: 0,
      ai: 0,
    })


  // -------------------------
  // AI SYMBOL
  // -------------------------

  const aiSymbol =
    playerSymbol === "X"
      ? "O"
      : "X"


  // -------------------------
  // START GAME
  // -------------------------

  const startGame = (symbol) => {

    setPlayerSymbol(symbol)

    setBoard(Array(9).fill(""))

    setWinner(null)

    setWinningCells([])

    setGameOver(false)

    setAiThinking(false)

    setGameStarted(true)

    // If user chooses X → user starts
    // If user chooses O → AI starts

    if (symbol === "X") {
      setCurrentTurn("X")
    } else {
      setCurrentTurn("O")
    }
  }


  // -------------------------
  // FINISH GAME
  // -------------------------

  const finishGame = (result) => {

    setWinner(result.player)

    setWinningCells(result.cells)

    setGameOver(true)

    if (
      result.player === playerSymbol
    ) {
      setScores((previous) => ({
        ...previous,
        you: previous.you + 1,
      }))
    }

    if (
      result.player === aiSymbol
    ) {
      setScores((previous) => ({
        ...previous,
        ai: previous.ai + 1,
      }))
    }
  }


  // -------------------------
  // PLAYER MOVE
  // -------------------------

  const handlePlayerMove = (index) => {

    if (
      !gameStarted ||
      gameOver ||
      aiThinking ||
      currentTurn !== playerSymbol ||
      board[index]
    ) {
      return
    }

    const newBoard = [...board]

    newBoard[index] = playerSymbol

    const result =
      getWinner(newBoard)

    setBoard(newBoard)

    if (result) {
      finishGame(result)
      return
    }

    setCurrentTurn(aiSymbol)

    setAiThinking(true)
  }


  // -------------------------
  // AI TURN
  // -------------------------

  useEffect(() => {

    if (
      !gameStarted ||
      gameOver ||
      !aiThinking ||
      currentTurn !== aiSymbol
    ) {
      return
    }

    const timer = setTimeout(() => {

      const aiMove =
        getAIMove(
          board,
          aiSymbol,
          playerSymbol
        )

      if (aiMove === null) {
        setAiThinking(false)
        return
      }

      const newBoard = [...board]

      newBoard[aiMove] = aiSymbol

      const result =
        getWinner(newBoard)

      setBoard(newBoard)

      setAiThinking(false)

      if (result) {
        finishGame(result)
        return
      }

      setCurrentTurn(playerSymbol)

    }, 800)

    return () => clearTimeout(timer)

  }, [
    aiThinking,
    board,
    currentTurn,
    aiSymbol,
    playerSymbol,
    gameOver,
    gameStarted,
  ])


  // -------------------------
  // NEW GAME
  // -------------------------

  const newGame = () => {

    setGameStarted(false)

    setBoard(Array(9).fill(""))

    setWinner(null)

    setWinningCells([])

    setGameOver(false)

    setAiThinking(false)

    setCurrentTurn(null)

    setRound(
      (previous) => previous + 1
    )
  }


  // -------------------------
  // RESET SCORE
  // -------------------------

  const resetScore = () => {

    setScores({
      you: 0,
      ai: 0,
    })

    setRound(1)

    newGame()
  }


  // -------------------------
  // UI
  // -------------------------

  return (

    <main className="game-page">

      {/* Background */}

      <div className="stars stars-one"></div>

      <div className="stars stars-two"></div>

      <div className="stars stars-three"></div>

      <div className="ambient-glow glow-one"></div>

      <div className="ambient-glow glow-two"></div>


      {/* NAVBAR */}

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


        {/* GAME CARD */}

        <div className="game-card">


          {/* CARD HEADER */}

          <div className="card-top">

            <div>

              <div className="card-label">
                CURRENT MATCH
              </div>

              <div className="match-title">
                HUMAN VS NEURAL ENGINE
              </div>

            </div>


            <div className="round-status">

              ROUND{" "}

              {String(round).padStart(2, "0")}

            </div>

          </div>


          {/* SCORE */}

          <div className="score-board">


            {/* YOU */}

            <div
              className={`player ${
                currentTurn === playerSymbol &&
                gameStarted &&
                !gameOver
                  ? "active"
                  : ""
              }`}
            >

              <span className="player-symbol x-symbol">

                {playerSymbol || "?"}

              </span>


              <div>

                <span className="player-name">
                  YOU
                </span>

                <strong>
                  {scores.you}
                </strong>

              </div>

            </div>


            <div className="versus">
              VS
            </div>


            {/* AI */}

            <div
              className={`player player-o ${
                currentTurn === aiSymbol &&
                gameStarted &&
                !gameOver
                  ? "active"
                  : ""
              }`}
            >

              <div>

                <span className="player-name">
                  AI
                </span>

                <strong>
                  {scores.ai}
                </strong>

              </div>


              <span className="player-symbol o-symbol">

                {playerSymbol
                  ? aiSymbol
                  : "?"}

              </span>

            </div>

          </div>


          {/* CHOOSE SIDE */}

          {!gameStarted && (

            <div className="choose-side">

              <div className="choose-label">

                CHOOSE YOUR SIDE

              </div>


              <div className="side-buttons">

                <button
                  className="side-button side-x"
                  onClick={() =>
                    startGame("X")
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
                    startGame("O")
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

            </div>

          )}


          {/* STATUS */}

          {gameStarted && (

            <div className="game-status">

              {!winner &&
                !aiThinking && (

                  <>

                    <span className="turn-label">

                      YOUR MOVE

                    </span>

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
                )}


              {aiThinking && (

                <>

                  <span className="turn-label">

                    AI IS THINKING

                  </span>

                  <span className="thinking-dots">

                    •••

                  </span>

                </>

              )}


              {winner === playerSymbol && (

                <>

                  <span className="winner-star">
                    ✦
                  </span>

                  YOU WIN

                  <span className="winner-star">
                    ✦
                  </span>

                </>

              )}


              {winner === aiSymbol && (

                <>

                  <span className="winner-star">
                    ✦
                  </span>

                  AI WINS

                  <span className="winner-star">
                    ✦
                  </span>

                </>

              )}


              {winner === "DRAW" && (

                <>

                  <span className="winner-star">
                    ◇
                  </span>

                  DRAW GAME

                  <span className="winner-star">
                    ◇
                  </span>

                </>

              )}

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
                    )

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
                        currentTurn !==
                          playerSymbol
                      }
                    >

                      {!cell &&
                        !gameOver &&
                        !aiThinking &&
                        currentTurn ===
                          playerSymbol && (

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

                  )
                }
              )}

            </div>

          )}


          {/* ACTIONS */}

          <div className="game-actions">

            {gameStarted && (

              <button
                className="new-game-button"
                onClick={newGame}
              >

                <span>
                  ↻
                </span>

                CHANGE SIDE

              </button>

            )}


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
              INTERACTIVE UI
            </span>

          </div>

        </div>


        {/* BOTTOM */}

        <div className="bottom-note">

          <span className="line"></span>

          <span>
            HUMAN INTELLIGENCE · ARTIFICIAL INTELLIGENCE
          </span>

          <span className="line"></span>

        </div>

      </section>

    </main>
  )
}

export default App