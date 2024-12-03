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
    let playerName = prompt("Enter your name");
    if (!playerName) playerName = `Player${token}`;
    players.push({ playerName, token });
  }

  return players;
}

function playGame() {
  const players = createPlayers();
  let currentPlayer = players[0];

  const switchTurns = () => {
    currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
  };

  const getCurrentPlayer = () => currentPlayer;

  const newRound = () => {
    gameBoard.getBoard();
    console.log(`${getCurrentPlayer().playerName}'s turn.`);
  };

  const isWinner = () => {
    let isWinner = false;
    let counter = 0;

    // Check win by columns:
    if (
      gameBoard
        .getBoard()
        .some((column) =>
          column.every((cell) => cell === getCurrentPlayer().token)
        )
    ) {
      isWinner = true;
    }

    // Check win by rows:
    for (let i = 0; i < gameBoard.getBoard().length; i++) {
      for (let j = 0; j < gameBoard.getBoard()[i].length; j++) {
        if (gameBoard.getBoard()[j][i] === getCurrentPlayer().token) {
          counter++;
          if (counter === 3) isWinner = true;
        }
      }
      counter = 0;
    }

    // Check win diagonally:
    for (let i = 0; i < gameBoard.getBoard().length; i++) {
      if (gameBoard.getBoard()[i][i] === getCurrentPlayer().token) {
        counter++;
        if (counter === 3) isWinner = true;
      }
    }
    counter = 0;

    // Check win diagonally-reverse:
    for (
      let i = 0, j = gameBoard.getBoard().length - 1;
      i < gameBoard.getBoard().length, j >= 0;
      i++, j--
    ) {
      if (gameBoard.getBoard()[i][j] === getCurrentPlayer().token) {
        counter++;
        if (counter === 3) isWinner = true;
      }
    }
    counter = 0;

    return isWinner;
  };

  const playRound = () => {
    const coordinates = Array.from(prompt("Enter valid coordinates"));

    const move = gameBoard.placeToken(getCurrentPlayer().token, coordinates);
    if (!move) playRound();
    console.log(
      `${getCurrentPlayer().playerName} placed ${
        getCurrentPlayer().token
      } on ${coordinates}`
    );

    console.log(gameBoard.getBoard());
    if (isWinner()) {
      return console.log(`${getCurrentPlayer().playerName} has won the game`);
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
