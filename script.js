
const firebaseConfig = {
  apiKey: "AIzaSyCtau2mrriZk65wi9F6cKo45YpirhWQ2H0",
  authDomain: "tic-tac-toe-firebase-ad48c.firebaseapp.com",
  databaseURL: "https://tic-tac-toe-firebase-ad48c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tic-tac-toe-firebase-ad48c",
  storageBucket: "tic-tac-toe-firebase-ad48c.firebasestorage.app",
  messagingSenderId: "633041662557",
  appId: "1:633041662557:web:ab29b3aaa085d54cf253b4"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let roomRef, playerSymbol;

function createGame() {
  const roomId = Math.random().toString(36).substr(2, 6);
  roomRef = database.ref("games/" + roomId);
  roomRef.set({
    player1: "X",
    board: ["", "", "", "", "", "", "", "", ""],
    turn: "X",
    winner: ""
  });
  playerSymbol = "X";
  document.getElementById("info").innerText = "Код комнаты: " + roomId;
  listenToGame(roomRef);
}

function joinGame() {
  const roomId = document.getElementById("roomInput").value;
  if (!roomId) return alert("Введите код комнаты");
  roomRef = database.ref("games/" + roomId);
  roomRef.once("value").then((snap) => {
    if (snap.exists()) {
      roomRef.update({ player2: "O" });
      playerSymbol = "O";
      document.getElementById("info").innerText = "Подключено к комнате: " + roomId;
      listenToGame(roomRef);
    } else {
      alert("Комната не найдена!");
    }
  });
}

function listenToGame(ref) {
  ref.on("value", (snapshot) => {
    const data = snapshot.val();
    updateBoardUI(data.board);
    document.getElementById("info").innerText += "\nХод: " + data.turn + (data.winner ? " | Победитель: " + data.winner : "");
  });
}

function makeMove(index) {
  roomRef.once("value").then((snap) => {
    const data = snap.val();
    if (data.board[index] === "" && data.turn === playerSymbol && !data.winner) {
      const newBoard = data.board;
      newBoard[index] = playerSymbol;
      const winner = checkWinner(newBoard);
      roomRef.update({
        board: newBoard,
        turn: playerSymbol === "X" ? "O" : "X",
        winner: winner
      });
    }
  });
}

function updateBoardUI(board) {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  board.forEach((val, idx) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerText = val;
    cell.onclick = () => makeMove(idx);
    boardDiv.appendChild(cell);
  });
}

function checkWinner(b) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a, b1, c] of winPatterns) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  return "";
}
