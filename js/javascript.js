const gameBoard = (function () {
  const rows = 3;
  const columns = 3;
  const board = [];

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

  return { getBoard, isCellAvailable, placeToken };
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
  const board = gameBoard.getBoard();
  let currentPlayer = players[0];

  const switchTurns = () => {
    currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
  };

  const getCurrentPlayer = () => currentPlayer;

  const newRound = () => {
    board;
    console.log(`${getCurrentPlayer().playerName}'s turn.`);
  };

  const isWinner = () => {
    const currentPlayerToken = getCurrentPlayer().token;
    let isWinner = false;
    let counter = 0;

    // Check win by columns:
    if (
      board.some((column) =>
        column.every((cell) => cell === currentPlayerToken)
      )
    ) {
      isWinner = true;
    }

    // Check win by rows:
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[j][i] === currentPlayerToken) {
          counter++;
          if (counter === 3) isWinner = true;
        }
      }
      counter = 0;
    }

    // Check win diagonally:
    for (let i = 0; i < board.length; i++) {
      if (board[i][i] === currentPlayerToken) {
        counter++;
        if (counter === 3) isWinner = true;
      }
    }
    counter = 0;

    // Check win diagonally-reverse:
    for (let i = 0, j = board.length - 1; i < board.length, j >= 0; i++, j--) {
      if (board[i][j] === currentPlayerToken) {
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
    const potentialBoard = board.map((column) =>
      column.map((cell) => {
        if (cell === null) {
          return (cell = getCurrentPlayer().token);
        } else {
          return (cell = cell);
        }
      })
    );

    if (isWinner(potentialBoard)) isTieGame = false;

    return isTieGame;
  };

  const playRound = (coordinates) => {
    // Place token on board:
    gameBoard.placeToken(getCurrentPlayer().token, coordinates);

    if (isWinner()) {
      createPlayers.raiseScore(currentPlayer);
      return console.log(`${getCurrentPlayer().playerName} has won the game`);
    }

    if (isTieGame()) {
      return console.log("It's a tie game!");
    }

    switchTurns();
    newRound();
  };

  return { playRound, getCurrentPlayer };
})();

(function displayController() {
  const gameBoardContainer = document.querySelector("#gameBoardContainer");

  // Game board builder:

  (function renderBoard() {
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
  })();

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

  gameBoardContainer.addEventListener("mouseup", (e) => {
    const chosenCell = e.target;

    if (
      chosenCell.id !== undefined &&
      chosenCell.id !== "" &&
      gameBoard.isCellAvailable(getCoordinates(chosenCell))
    ) {
      chosenCell.innerText = `${currentToken()[0]}`;
      chosenCell.style.cssText = `color: ${currentToken()[1]}`;
      chosenCell.classList.add("cell-taken");
      playGame.playRound(getCoordinates(chosenCell));
    } else {
      return;
    }
  });

  // Handling the name input for each player:

  const toggleNameInputDisplay = (inputContainer, input) => {
    if (window.getComputedStyle(inputContainer).visibility === "hidden") {
      inputContainer.style.visibility = "visible";
      input.setAttribute("value", "");
      input.focus();
    } else {
      inputContainer.style.visibility = "hidden";
    }
  };

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
})();
