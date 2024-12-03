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

  const placeToken = (token, coordinates) => {
    // Check if coordinates are within the game board:
    if (
      coordinates[0] >= board.length ||
      coordinates[1] >= board[coordinates[0]].length
    ) {
      alert("Your coordinates are not valid");
      return false;
    }

    // Check if coordinate doesn't hold a token yet and place item if still unoccupied:
    if (!board[coordinates[0]][coordinates[1]]) {
      board[coordinates[0]].splice(coordinates[1], 1, token);
      return true;
    } else {
      alert("You can't place a token here");
      return false;
    }
  };

  return { getBoard, placeToken };
})();

function createPlayers() {
  const players = [];

  for (let i = 0; i < 2; i++) {
    let token = i + 1;
    // Will be retrieved from input field once UI is set up!!!
    let playerName = prompt("Enter your name");

    if (!playerName) playerName = `Player${token}`;
    players.push({ playerName, token });
  }

  return players;
}

function playGame() {
  const players = createPlayers();
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

  const isWinner = (board) => {
    let isWinner = false;
    let counter = 0;

    // Check win by columns:
    if (
      board.some((column) =>
        column.every((cell) => cell === getCurrentPlayer().token)
      )
    ) {
      isWinner = true;
    }

    // Check win by rows:
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[j][i] === getCurrentPlayer().token) {
          counter++;
          if (counter === 3) isWinner = true;
        }
      }
      counter = 0;
    }

    // Check win diagonally:
    for (let i = 0; i < board.length; i++) {
      if (board[i][i] === getCurrentPlayer().token) {
        counter++;
        if (counter === 3) isWinner = true;
      }
    }
    counter = 0;

    // Check win diagonally-reverse:
    for (let i = 0, j = board.length - 1; i < board.length, j >= 0; i++, j--) {
      if (board[i][j] === getCurrentPlayer().token) {
        counter++;
        if (counter === 3) isWinner = true;
      }
    }
    counter = 0;

    return isWinner;
  };

  const isTieGame = function () {
    let isTieGame = false;

    // If no empty fields are left --> it's a tie game since winner has been checked before and must be false:
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

  const playRound = () => {
    // Will be retrieved from click-event once UI is set up!!!
    const coordinates = Array.from(prompt("Enter valid coordinates"));

    // Place token on board:
    const move = gameBoard.placeToken(getCurrentPlayer().token, coordinates);

    if (!move) playRound();

    console.log(
      `${getCurrentPlayer().playerName} placed ${
        getCurrentPlayer().token
      } on ${coordinates}`
    );

    // Can be deleted once UI is set up!!!
    console.log(gameBoard.getBoard());

    if (isWinner(board)) {
      return console.log(`${getCurrentPlayer().playerName} has won the game`);
    }

    if (isTieGame()) {
      return console.log("It's a tie game!");
    }

    switchTurns();
    newRound();
    playRound();
  };

  newRound();
  playRound();

  return { playRound, getCurrentPlayer, isWinner };
}

playGame();
