const gameBoard = (function () {
  const rows = 3;
  const columns = 3;
  let board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(null);
    }
  }

  const getBoard = () => board;

  const isCellAvailable = (coordinates) => {
    return !board[coordinates[0]][coordinates[1]];
  };

  const placeToken = (token, coordinates) => {
    // Check if coordinates are within the game board:
    if (
      coordinates[0] >= board.length ||
      coordinates[1] >= board[coordinates[0]].length
    ) {
      alert("Your coordinates are not valid");
      return false;
    }

    board[coordinates[0]].splice(coordinates[1], 1, token);
    return true;
  };

  const reset = () => {
    board = board.map((column) =>
      column.map((cell) => {
        return (cell = null);
      })
    );
  };

  return { getBoard, isCellAvailable, placeToken, reset };
})();

const createPlayers = (function () {
  const players = [];

  for (let i = 0; i < 2; i++) {
    let playerName;
    let token = i + 1;
    let score = 0;

    if (!playerName) playerName = `Player${token}`;
    players.push({ playerName, token, score });
  }

  const setName = (input, index) => {
    return (players[index].playerName = `${input}`);
  };

  const raiseScore = (player) => {
    player.score++;
  };

  return { players, setName, raiseScore };
})();

const playGame = (function () {
  const players = createPlayers.players;
  let board = gameBoard.getBoard();
  let currentPlayer = players[0];

  const switchTurns = () => {
    currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
  };

  const getCurrentPlayer = () => currentPlayer;

  const getOpponent = () => {
    return currentPlayer === players[0] ? players[1] : players[0];
  };

  const isWinner = (board, token) => {
    const playerToken = token;
    let isWinner = false;
    let counter = 0;

    // Check win by columns:
    if (board.some((column) => column.every((cell) => cell === playerToken))) {
      isWinner = true;
    }

    // Check win by rows:
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[j][i] === playerToken) {
          counter++;
          if (counter === 3) isWinner = true;
        }
      }
      counter = 0;
    }

    // Check win diagonally:
    for (let i = 0; i < board.length; i++) {
      if (board[i][i] === playerToken) {
        counter++;
        if (counter === 3) isWinner = true;
      }
    }
    counter = 0;

    // Check win diagonally-reverse:
    for (let i = 0, j = board.length - 1; i < board.length, j >= 0; i++, j--) {
      if (board[i][j] === playerToken) {
        counter++;
        if (counter === 3) isWinner = true;
      }
    }
    counter = 0;

    return isWinner;
  };

  const isTieGame = function () {
    let isTieGame = false;

    // If no empty fields are left --> tie game:
    if (!board.some((column) => column.some((cell) => cell === null))) {
      isTieGame = true;
    }

    // Replace all empty fields with current player's token and perform
    // isWinner() check to see if there is still a chance to win the game:
    const potentialWin = (player) => {
      return board.map((column) =>
        column.map((cell) => {
          if (cell === null) {
            return (cell = player);
          } else {
            return (cell = cell);
          }
        })
      );
    };

    if (
      !isWinner(
        potentialWin(getCurrentPlayer().token),
        getCurrentPlayer().token
      ) &&
      !isWinner(potentialWin(getOpponent().token), getOpponent().token)
    ) {
      isTieGame = true;
    }

    return isTieGame;
  };

  const playRound = (coordinates) => {
    const token = getCurrentPlayer().token;
    // Place token on board:
    gameBoard.placeToken(token, coordinates);

    if (isWinner(board, token)) {
      createPlayers.raiseScore(currentPlayer);
      return { isWinner: isWinner(board, token), isTieGame: false };
    }

    if (isTieGame()) {
      return { isWinner: false, isTieGame: isTieGame() };
    }

    switchTurns();

    return { isWinner: false, isTieGame: false };
  };

  const reset = () => {
    gameBoard.reset();
    board = gameBoard.getBoard();
    currentPlayer = players[0];
  };

  return { playRound, getCurrentPlayer, reset };
})();

(function displayController() {
  const gameBoardContainer = document.querySelector("#gameBoardContainer");
  let startGame = false;
  let roundEnd = false;

  // Game board builder:

  function renderBoard() {
    gameBoard.getBoard().map((column, cellIndex) =>
      column.map((cell, columnIndex) => {
        const cellWrapper = document.createElement("div");
        cellWrapper.classList.add("cell-wrapper");
        gameBoardContainer.appendChild(cellWrapper);

        cell = document.createElement("div");
        cell.setAttribute("id", `cell-${columnIndex}${cellIndex}`);
        cell.classList.add("cell");
        cell.innerText = "";
        cellWrapper.appendChild(cell);
      })
    );
  }

  renderBoard();

  // Start / Reset game:

  const startResetButton = document.querySelector("#startResetButton");
  const instructions = document.querySelector("#instructions");
  const startMessage = instructions.innerHTML;

  startResetButton.addEventListener("click", () => {
    if (!startGame) {
      roundEnd = false;
      startGame = true;
      startResetButton.innerHTML = `
      <i class="fa-solid fa-rotate-left"></i>
      Reset`;
      gameBoardContainer.style.opacity = 1;
      gameBoardContainer.style.cursor = "pointer";

      instructions.innerText = `${
        playGame.getCurrentPlayer().playerName
      }'s turn...`;
    } else {
      playGame.reset();
      startGame = false;
      roundEnd = false;
      startResetButton.innerText = "Start";
      gameBoardContainer.innerText = "";
      renderBoard();
      gameBoardContainer.style.opacity = 0.1;
      gameBoardContainer.style.cursor = "default";
      instructions.innerHTML = `${startMessage}`;
    }
  });

  // Extract coordinates from cell IDs set by renderBoard():

  const getCoordinates = (cell) => {
    return cell.getAttribute("id").split("-").splice(1, 1)[0].split("");
  };

  // Retrieve current token and current token color:

  const currentToken = () => {
    const currentPlayer = playGame.getCurrentPlayer();
    const token = [];

    currentPlayer.token === 1
      ? token.push("X", "var(--playerOneTokenColor)")
      : token.push("O", "var(--playerTwoTokenColor)");

    return token;
  };

  // Hover over game board:

  gameBoardContainer.addEventListener("mouseover", (e) => {
    const cell = e.target;

    if (
      startGame &&
      !roundEnd &&
      cell.id !== undefined &&
      cell.id !== "" &&
      gameBoard.isCellAvailable(getCoordinates(cell))
    ) {
      cell.innerText = `${currentToken()[0]}`;
      cell.style.cssText = `color: ${
        currentToken()[1]
      }; -webkit-text-fill-color: var(--bgColor); -webkit-text-stroke: 2px ${
        currentToken()[1]
      }`;

      gameBoardContainer.addEventListener("mouseout", () => {
        if (gameBoard.isCellAvailable(getCoordinates(cell))) {
          cell.innerText = "";
        }
      });
    } else {
      return;
    }
  });

  // Place token on game board:

  let tieGames = 0;

  gameBoardContainer.addEventListener("mouseup", (e) => {
    const chosenCell = e.target;

    if (
      startGame &&
      !roundEnd &&
      chosenCell.id !== undefined &&
      chosenCell.id !== "" &&
      gameBoard.isCellAvailable(getCoordinates(chosenCell))
    ) {
      chosenCell.innerText = `${currentToken()[0]}`;
      chosenCell.style.cssText = `color: ${currentToken()[1]}`;
      chosenCell.classList.add("cell-taken");

      const playRound = playGame.playRound(getCoordinates(chosenCell));

      if (playRound.isWinner) {
        showScore();
        roundEnd = true;
        startResetButton.innerText = "Restart ?";
        return (instructions.innerText = `${
          playGame.getCurrentPlayer().playerName
        } has won this round!`);
      }

      if (playRound.isTieGame) {
        tieGames++;
        tieGame(tieGames);
        roundEnd = true;
        startResetButton.innerText = "Restart ?";
        return (instructions.innerText = "It's a tie game!");
      }
      return (instructions.innerText = `${
        playGame.getCurrentPlayer().playerName
      }'s turn...`);
    } else {
      return;
    }
  });

  // Handling the name input for each player:
  const playerOneInputDisplay = document.querySelector(
    "#playerOneInputDisplay"
  );
  const playerTwoInputDisplay = document.querySelector(
    "#playerTwoInputDisplay"
  );
  const playerOneNameInput = document.querySelector("#playerOneNameInput");
  const playerTwoNameInput = document.querySelector("#playerTwoNameInput");
  const playerOneName = document.querySelector("#playerOneName");
  const playerTwoName = document.querySelector("#playerTwoName");

  const toggleNameInputDisplay = (inputContainer, input) => {
    if (window.getComputedStyle(inputContainer).visibility === "hidden") {
      inputContainer.style.visibility = "visible";

      input.setAttribute("value", "");
      input.focus();
    } else {
      inputContainer.style.visibility = "hidden";
    }
  };

  playerOneInputDisplay.addEventListener("click", () => {
    const playerOneInputContainer = document.querySelector(
      "#playerOneInputContainer"
    );
    toggleNameInputDisplay(playerOneInputContainer, playerOneNameInput);
  });

  playerTwoInputDisplay.addEventListener("click", () => {
    const playerTwoInputContainer = document.querySelector(
      "#playerTwoInputContainer"
    );
    toggleNameInputDisplay(playerTwoInputContainer, playerTwoNameInput);
  });

  const setName = (input, nameField, index) => {
    if (input.value) {
      createPlayers.players[index].playerName = input.value;
      nameField.innerText = `${input.value}`;
    } else {
      nameField.innerText = `Player${createPlayers.players[index].token}`;
    }
  };

  playerOneNameInput.addEventListener("input", () => {
    setName(playerOneNameInput, playerOneName, 0);
  });

  playerTwoNameInput.addEventListener("input", () => {
    setName(playerTwoNameInput, playerTwoName, 1);
  });

  // Score display:

  const showScore = () => {
    const playerOneScore = document.querySelector("#playerOneResultText");
    const playerTwoScore = document.querySelector("#playerTwoResultText");
    playerOneScore.innerText = `${createPlayers.players[0].score}`;
    playerTwoScore.innerText = `${createPlayers.players[1].score}`;
  };

  const tieGame = (tieGames) => {
    const tieDisplay = document.querySelector("#tieText");
    tieDisplay.innerText = `${tieGames}`;
  };
})();
