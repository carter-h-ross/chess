/* 3d model credits:

chess board: "Chess Board" (https://skfb.ly/6SAZ9) by danielpaulse is licensed under Creative Commons Attribution-ShareAlike (http://creativecommons.org/licenses/by-sa/4.0/).

*/

// function to help with radians
function degToRad(degrees) {
  var radians = degrees * (Math.PI / 180);
  return radians;
}

function log_board(){
  let result = ``;
  for (let r = 0; r < 8; r++) {
    result += `\n|`;
    for (let c = 0; c < 8; c++) {
      if (board[r][c].team != "-") {
        result += `${board[r][c].id}|`;
      } else {
        result += `  |`;
      }      
    }
  }
}

function encode_board(op="") {
  let result = "";
  if (op == "w") {
    result = "w";
  } else {
    result = `${opp[turn]}`;
  }
  let counter = 0;
  let empty = false;
  outerloop:
  for (let r = 0; r < 8; r++) {
    inerloop:
    for (let c = 0; c < 8; c++) {
      if (r > 7 && c > 7) {
        break outerloop;
      }
      if (board[r][c].team != "-") {
        if (empty) {
          result += `${counter}`;
          counter = 0;
          empty = false;
        }
        result += board[r][c].id;
      } else {
        counter++;
        empty = true;
      }
    }
  }
  return result;
}

function isNumber(char) {
  return /^\d$/.test(char);
}

function decode_board(code) {
  let result = Array(8).fill().map(() => Array(8).fill(null));
  let r = 0;
  let c = 0;
  turn = code[0];
  let i = 1;
  while (i < code.length) {
    let ch = code[i];
    if (isNumber(ch)) {
      if (isNumber(code[i+1])) {
        ch += code[i+1];
        i++;
      }
      let count = parseInt(ch);
      for (let j = 0; j < count; j++) {
        result[r][c] = new Spot(r,c,"-=")
        c++;
        if (c == 8) {
          c = 0;
          r++;
        }
      }
      i++;
    } else {
      let id = ch + code.charAt(i + 1);
      result[r][c] = new Spot(r,c,id);
      c++;
      if (c == 8) {
        c = 0;
        r++;
      }
      i += 2;
    }
  }
  return result;
}

function debug_board(moves) {
  let result = "";
  for (let r = 0; r < 8; r++) {
    result += "\n|";
    for (let c = 0; c < 8; c++) {
      for (let i = 0; i < moves.length; i++) {
        if (moves[i][0] == r && moves[i][1] == c) {
          result += "*|";
          break;
        } else if (i == moves.length - 1) {
          result += " |";
        }
      }
    }
  }
}

function findKing(team) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c].id == `${team}k`) {
        return [r,c];
      }
    }
  }
  return null;
}

// variables used for js game logic
class Spot {
  constructor(r,c,id) {
    this.r = r;
    this.c = c;
    this.id = id;
    this.team = id[0];
    this.piece = id[1];
  }

  // game logic functions
  isCheck(op="") {
    
    let ir = [];
    let ic = [];
    let b = null;
    if (op == "next") {
      b = nextBoard;
    } else {
      b = board;
    }
    let team = this.team;
    let r = this.r;
    let c = this.c;

    // checks if black pawn will make check
    if (team == "w") {
      if (r > 0 && c < 7) {
        if (b[r-1][c+1].id == "bp") /* up 1 right 1 */ {
          return true;
        }
      }
      if (r > 0 && c > 0) {
        if (b[r-1][c-1].id == "bp") /* up 1 left 1 */ {
          return true;
        }
      }
    }

    // checks if white pawn will make check
    if (team == "b") {
      if (r < 7 && c < 7) {
        if (b[r+1][c+1].id == "wp") /* down 1 right 1 */ {
          return true;
        }
      }
      if (r < 7 && c > 0) {
        if (b[r+1][c-1].id == "wp") /* down 1 left 1 */ {
          return true;
        }
      }
    }

    // checks if knight will make check
    ir = [1,2,2,1,-1,-2,-2,-1]; 
    ic = [2,1,-1,-2,-2,-1,1,2]; // locations to check for pieces relative to the piece
    for (let i = 0; i < 8;i++) {
      if (r+ir[i] > -1 && r+ir[i] < 8 && c+ic[i] > -1 && c+ic[i] < 8) {
        if (b[r+ir[i]][c+ic[i]].id == `${opp[team]}n`) {
          return true;
        }
      }
    }

    // checks if rook will make check or queen in rook directions
    if (r < 7) {
      for (let i = r+1;i < 8;i++) {
        if (b[i][c].team == team) {
          break;
        } else if (b[i][c].team == opp[team]) {
          if (b[i][c].id == `${opp[team]}r` || b[i][c].id == `${opp[team]}q`) /* right */ {
            return true;
          } else {
            break;
          }
        }
      }
    }
    if (c < 7) {
      for (let i = c+1;i < 8;i++) {
        if (b[r][i].team == team) {
          break;
        } else if (b[r][i].team == opp[team]) {
          if (b[r][i].id == `${opp[team]}r` || b[r][i].id == `${opp[team]}q`) /* down */ {
            return true;
          } else {
            break;
          }
        }
      }
    }
    if (r > 0) {
      for (let i = r-1;i > -1;i--) {
        if (b[i][c].team == team) {
          break;
        } else if (b[i][c].team == opp[team]) {
          if (b[i][c].id == `${opp[team]}r` || b[i][c].id == `${opp[team]}q`) /* left */ {
            return true;
          } else {
            break;
          }
        }
      }
    }
    if (c > 0) {
      for (let i = c-1;i > -1;i--) {
        if (b[r][i].team == team) {
          break;
        } else if (b[r][i].team == opp[team]) {
          if (b[r][i].id == `${opp[team]}r` || b[r][i].id == `${opp[team]}q`) /* up */ {
            return true;
          } else {
            break;
          }
        }
      }
    }

    // checks if bishop makes check or queen in bishop directions
    ir = [1,1,-1,-1];
    ic = [1,-1,-1,1];
    for (let i = 1;i < 8;i++) {
      if (r+i == 8 || c+i == 8) {
        break;
      }
      if (b[r+i][c+i].team == team) {
        break;
      }
      if (b[r+i][c+i].id == `${opp[team]}b` || b[r+i][c+i].id == `${opp[team]}q`) /* down right */ {
        return true;
      }
    }
    for (let i = 1;i < 8;i++) {
      if (r+i == 8 || c-i == -1) {
        break;
      }
      if (b[r+i][c-i].team == team) {
        break;
      }
      if (b[r+i][c-i].id == `${opp[team]}b` || b[r+i][c-i].id == `${opp[team]}q`) /* down left */ {
        return true;
      } 
    }
    for (let i = 1;i < 8;i++) {
      if (r-i == -1 || c-i == -1) {
        break;
      }
      if (b[r-i][c-i].team == team) {
        break;
      }
      if (b[r-i][c-i].id == `${opp[team]}b` || b[r-i][c-i].id == `${opp[team]}q`) /* up left */ {
        return true;
      }
    }
    for (let i = 1;i < 8;i++) {
      if (r-i == -1 || c+i == 8) {
        break;
      }
      if (b[r-i][c+i].team == team) {
        break;
      }
      if (b[r-i][c+i].id == `${opp[team]}b` || b[r-i][c+i].id == `${opp[team]}q`) /* up right */ {
        return true;
      }
    }

    // checks if king will make check
    ir = [0,1,1,1,0,-1,-1,-1];
    ic = [1,1,0,-1,-1,-1,0,1];
    for (let i = 0;i < 8;i++) {
      if (r+ir[i] > 0 && r+ir[i] < 8 && c+ic[i] > 0 && c+ic[i] < 8) {
        if (b[r+ir[i]][c+ic[i]].id == `${opp[team]}k`) {
          return true;
        }
      }
    }

    return false;
  } // end of isCheck

  find_moves () {

    let ir = [];
    let ic = [];
    let b = board;
    let team = this.team;
    let r = this.r;
    let c = this.c;
    let moves = [];
    let piece = this.piece;
    let id = this.id;

    // finds moves for white pawns
    if(id == "wp") {
      if (r > 0) {
        if (b[r-1][c].team == "-") /* up 1 */ {
          nextBoard = getNextBoard(r,c,r-1,c);
          if (inCheck) {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r-1,c])
            }
          } else {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r-1,c]);
            }
          }
          if (r > 1) {  
            if (r == 6 && b[r-2][c].team == "-") /* up 2 at start */ {
              nextBoard = getNextBoard(r,c,r-2,c);
              if (inCheck) {
                if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                  moves.push([r-2,c]);
                }
              } else {
                if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                  moves.push([r-2,c]);
                }
              }
            }
          }
        }
      }
      if (r > 0 && c < 7) {
        if (b[r-1][c+1].team == opp[team]) /* capture piece up 1 right 1 */ {
          if (inCheck) {
            nextBoard = getNextBoard(r,c,r-1,c+1);
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r-1,c+1]);
            }
          } else {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r-1,c+1]);
            }
          }
        }
      }
      if (r > 0 && c > 0) {
        if (b[r-1][c-1].team == opp[team]) /* capture piece up 1 right 1 */ {
          if (inCheck) {
            nextBoard = getNextBoard(r,c,r-1,c-1);
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r-1,c-1]);
            }
          } else {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r-1,c-1]);
            }
          }
        }
      }
    }

    // finds moves for black pawns
    if(id == "bp") {
      if (r < 7) {
        if (b[r+1][c].team == "-") /* up 1 */ {
          nextBoard = getNextBoard(r,c,r+1,c);
          if (inCheck) {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+1,c])
            }
          } else {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+1,c]);
            }
          }
          if (r < 6) {  
            if (r == 1 && b[r+2][c].team == "-") /* up 2 at start */ {
              nextBoard = getNextBoard(r,c,r+2,c);
              if (inCheck) {
                if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                  moves.push([r+2,c]);
                }
              } else {
                if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                  moves.push([r+2,c]);
                }
              }
            }
          }
        }
      }
      if (r < 7 && c < 7) {
        if (b[r+1][c+1].team == opp[team]) /* capture piece up 1 right 1 */ {
          if (inCheck) {
            nextBoard = getNextBoard(r,c,r+1,c+1);
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+1,c+1]);
            }
          } else {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+1,c+1]);
            }
          }
        }
      }
      if (r < 7 && c > 0) {
        if (b[r+1][c-1].team == opp[team]) /* capture piece up 1 right 1 */ {
          if (inCheck) {
            nextBoard = getNextBoard(r,c,r+1,c-1);
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+1,c-1]);
            }
          } else {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+1,c-1]);
            }
          }
        }
      }
    }

    // finds moves for knights
    if (piece == "n") {
      ir = [1,2,2,1,-1,-2,-2,-1]; 
      ic = [2,1,-1,-2,-2,-1,1,2];
      for (let i = 0; i < 8;i++) {
        if (r+ir[i] > -1 && r+ir[i] < 8 && c+ic[i] > -1 && c+ic[i] < 8 ) {
          if (inCheck) {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+ir[i], c+ic[i]]);
            }
          } else if (b[r+ir[i]][c+ic[i]].team != team) {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+ir[i], c+ic[i]]);
            }
          }
        }
      }
    }

    // finds moves for rooks an queen in rook directions
    if (piece == "r" || piece == "q") {
      if (r < 7) {
        for (let i = r+1;i < 8;i++) {
          if (b[i][c].team == team) {
            break;
          } else {
            nextBoard = getNextBoard(r,c,i,c);
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([i,c]);
            }
            if (b[i][c].team == opp[team]) {
              break;
            }
          }
        }
      }
      if (c < 7) {
        for (let i = c+1;i < 8;i++) {
          if (b[r][i].team == team) {
            break;
          } else {
            nextBoard = getNextBoard(r,c,r,i);
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r,i]);
            }
            if (b[r][i].team == opp[team]) {
              break;
            }
          }
        }
      }
      if (r > 0) {
        for (let i = r-1;i > -1;i--) {
          if (b[i][c].team == team) {
            break;
          } else {
            nextBoard = getNextBoard(r,c,i,c);
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([i,c]);
            }
            if (b[i][c].team == opp[team]) {
              break;
            }
          }
        }
      }
      if (c > 0) {
        for (let i = c-1;i > -1;i--) {
          if (b[r][i].team == team) {
            break;
          } else {
            nextBoard = getNextBoard(r,c,r,i);
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r,i]);
            }
            if (b[r][i].team == opp[team]) {
              break;
            }
          }
        }
      }
    }

    // finds move for bishops and queens in queen directions
    if (piece == "b" || piece == "q") {
      for (let i = 1;i < 8;i++) {
        if (r+i == 8 || c+i == 8) {
          break;
        }
        nextBoard = getNextBoard(r,c,r+i,c+i);
        if (b[r+i][c+i].team == "-") {
          if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
            moves.push([r+i, c+i]);
          }
        } else {
          if (b[r+i][c+i].team == team) /* down right */ {
            break;
          } else {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+i, c+i]);
            }
            break;
          }
        } 
      }
      for (let i = 1;i < 8;i++) {
        if (r+i == 8 || c-i == -1) {
          break;
        }
        nextBoard = getNextBoard(r,c,r+i,c-i);
        if (b[r+i][c-i].team == "-") {
          if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
            moves.push([r+i, c-i]);
          }
        } else {
          if (b[r+i][c-i].team == team) /* down left */ {
            break;
          } else {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+i, c-i]);
            }
            break;
          }
        } 
      }
      for (let i = 1;i < 8;i++) {
        if (r-i == -1 || c-i == -1) {
          break;
        }
        nextBoard = getNextBoard(r,c,r-i,c-i);
        if (b[r-i][c-i].team == "-") {
          if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
            moves.push([r-i, c-i]);
          }
        } else {
          if (b[r-i][c-i].team == team) /* up left */ {
            break;
          } else {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r-i, c-i]);
            }
            break;
          }
        } 
      }
      for (let i = 1;i < 8;i++) {
        if (r-i == -1 || c+i == 8) {
          break;
        }
        nextBoard = getNextBoard(r,c,r-i,c+i);
        if (b[r-i][c+i].team == "-") {
          if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) { 
            moves.push([r-i, c+i]);
          }
        } else {
          if (b[r-i][c+i].team == team) /* up right */ {
            break;
          } else {
            if (!(nextBoard[kingLoc[0]][kingLoc[1]].isCheck("next"))) { 
              moves.push([r-i, c+i]);
            }
            break;
          }
        } 
      }
    }

    // checks for moves king can make
    if (piece == "k") {
      ir = [0,1,1, 1, 0,-1,-1,-1];
      ic = [1,1,0,-1,-1,-1, 0, 1];
      for (let i = 0;i < 8;i++) {
        if (r+ir[i] > -1 && r+ir[i] < 8 && c+ic[i] > -1 && c+ic[i] < 8 && board[r+ir[i]][c+ic[i]].team == "-") {
          if (!(board[r+ir[i]][c+ic[i]].isCheck())) {
            moves.push([r+ir[i],c+ic[i]]);
          }
        }
      }
    }
    return moves;
  } // end of moves
}

var board = [
  // row 0
  [new Spot(0,0,"br"), new Spot(0,1,"bn"), new Spot(0,2,"bb"), new Spot(0,3,"bq"),
   new Spot(0,4,"bk"), new Spot(0,5,"bb"), new Spot(0,6,"bn"), new Spot(0,7,"br"),],
  // row 1
  [new Spot(1,0,"bp"), new Spot(1,1,"bp"), new Spot(1,2,"bp"), new Spot(1,3,"bp"),
   new Spot(1,4,"bp"), new Spot(1,5,"bp"), new Spot(1,6,"bp"), new Spot(1,7,"bp"),],
  // row 2
  [new Spot(2,0,"-="), new Spot(2,1,"-="), new Spot(2,2,"-="), new Spot(2,3,"-="),
   new Spot(2,4,"-="), new Spot(2,5,"-="), new Spot(2,6,"-="), new Spot(2,7,"-="),],
  // row 3
  [new Spot(3,0,"-="), new Spot(3,1,"-="), new Spot(3,2,"-="), new Spot(3,3,"-="),
   new Spot(3,4,"-="), new Spot(3,5,"-="), new Spot(3,6,"-="), new Spot(3,7,"-="),],
  // row 4
  [new Spot(4,0,"-="), new Spot(4,1,"-="), new Spot(4,2,"-="), new Spot(4,3,"-="),
   new Spot(4,4,"-="), new Spot(4,5,"-="), new Spot(4,6,"-="), new Spot(4,7,"-="),],
  // row 5
  [new Spot(5,0,"-="), new Spot(5,1,"-="), new Spot(5,2,"-="), new Spot(5,3,"-="),
   new Spot(5,4,"-="), new Spot(5,5,"-="), new Spot(5,6,"-="), new Spot(5,7,"-="),],
  // row 6
  [new Spot(6,0,"wp"), new Spot(6,1,"wp"), new Spot(6,2,"wp"), new Spot(6,3,"wp"),
   new Spot(6,4,"wp"), new Spot(6,5,"wp"), new Spot(6,6,"wp"), new Spot(6,7,"wp"),],
  // row 7
  [new Spot(7,0,"wr"), new Spot(7,1,"wn"), new Spot(7,2,"wb"), new Spot(7,3,"wq"),
   new Spot(7,4,"wk"), new Spot(7,5,"wb"), new Spot(7,6,"wn"), new Spot(7,7,"wr"),],
];

function getNextBoard(r1,c1,r2,c2) {
  let result = copy2DArray(board)
  result[r2][c2] = new Spot(r2,c2,`${result[r1][c1].team}${result[r1][c1].piece}`);
  result[r1][c1] = new Spot(r1,c1,"-=");
  console.log("result of copied board with next possiable move: ",result)
  return result;
}

function copy2DArray(array) {
  return array.map(innerArray => innerArray.slice());
}

var nextBoard = [
  // row 0
  [new Spot(0,0,"br"), new Spot(0,1,"bn"), new Spot(0,2,"bb"), new Spot(0,3,"bq"),
   new Spot(0,4,"bk"), new Spot(0,5,"bb"), new Spot(0,6,"bn"), new Spot(0,7,"br"),],
  // row 1
  [new Spot(1,0,"bp"), new Spot(1,1,"bp"), new Spot(1,2,"bp"), new Spot(1,3,"bp"),
   new Spot(1,4,"bp"), new Spot(1,5,"bp"), new Spot(1,6,"bp"), new Spot(1,7,"bp"),],
  // row 2
  [new Spot(2,0,"-="), new Spot(2,1,"-="), new Spot(2,2,"-="), new Spot(2,3,"-="),
   new Spot(2,4,"-="), new Spot(2,5,"-="), new Spot(2,6,"-="), new Spot(2,7,"-="),],
  // row 3
  [new Spot(3,0,"-="), new Spot(3,1,"-="), new Spot(3,2,"-="), new Spot(3,3,"-="),
   new Spot(3,4,"-="), new Spot(3,5,"-="), new Spot(3,6,"-="), new Spot(3,7,"-="),],
  // row 4
  [new Spot(4,0,"-="), new Spot(4,1,"-="), new Spot(4,2,"-="), new Spot(4,3,"-="),
   new Spot(4,4,"-="), new Spot(4,5,"-="), new Spot(4,6,"-="), new Spot(4,7,"-="),],
  // row 5
  [new Spot(5,0,"-="), new Spot(5,1,"-="), new Spot(5,2,"-="), new Spot(5,3,"-="),
   new Spot(5,4,"-="), new Spot(5,5,"-="), new Spot(5,6,"-="), new Spot(5,7,"-="),],
  // row 6
  [new Spot(6,0,"wp"), new Spot(6,1,"wp"), new Spot(6,2,"wp"), new Spot(6,3,"wp"),
   new Spot(6,4,"wp"), new Spot(6,5,"wp"), new Spot(6,6,"wp"), new Spot(6,7,"wp"),],
  // row 7
  [new Spot(7,0,"wr"), new Spot(7,1,"wn"), new Spot(7,2,"wb"), new Spot(7,3,"wq"),
   new Spot(7,4,"wk"), new Spot(7,5,"wb"), new Spot(7,6,"wn"), new Spot(7,7,"wr"),],
];

const board_locs = {
  "0,0" : [-21,-21], "0,1" : [-15,-21], "0,2" : [-9,-21], "0,3" : [-3,-21], "0,4" : [3,-21], "0,5" : [9,-21], "0,6" : [15,-21], "0,7" : [21,-21],
  "1,0" : [-21,-15], "1,1" : [-15,-15], "1,2" : [-9,-15], "1,3" : [-3,-15], "1,4" : [3,-15], "1,5" : [9,-15], "1,6" : [15,-15], "1,7" : [21,-15],
  "2,0" : [-21,-9], "2,1" : [-15,-9], "2,2" : [-9,-9], "2,3" : [-3,-9], "2,4" : [3,-9], "2,5" : [9,-9], "2,6" : [15,-9], "2,7" : [21,-9],
  "3,0" : [-21,-3], "3,1" : [-15,-3], "3,2" : [-9,-3], "3,3" : [-3,-3], "3,4" : [3,-3], "3,5" : [9,-3], "3,6" : [15,-3], "3,7" : [21,-3],
  "4,0" : [-21,3], "4,1" : [-15,3], "4,2" : [-9,3], "4,3" : [-3,3], "4,4" : [3,3], "4,5" : [9,3], "4,6" : [15,3], "4,7" : [21,3],
  "5,0" : [-21,9], "5,1" : [-15,9], "5,2" : [-9,9], "5,3" : [-3,9], "5,4" : [3,9], "5,5" : [9,9], "5,6" : [15,9], "5,7" : [21,9],
  "6,0" : [-21,15], "6,1" : [-15,15], "6,2" : [-9,15], "6,3" : [-3,15], "6,4" : [3,15], "6,5" : [9,15], "6,6" : [15,15], "6,7" : [21,15],
  "7,0" : [-21,21], "7,1" : [-15,21], "7,2" : [-9,21], "7,3" : [-3,21], "7,4" : [3,21], "7,5" : [9,21], "7,6" : [15,21], "7,7" : [21,21],
}  
const gridSquareSize = 6;

const opp = {
  "b" : "w",
  "w" : "b",
}

var state = "unselected";
var team = "w";
var turn = "w";
var availableMoves = null;
var rSelected = null;
var cSelected = null;
var encodedBoard = null;
var inCheck = false;
var inCheckLoc = null;
var checkMate = false;
var kingLoc = [0,0]

encode_board();

/*--------------------------------------- firebase ----------------------------------------*/

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { 
  getDatabase,
  ref, 
  onValue, 
  set,
  get
} from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBoeyEpmfRJT6GLiaQ0eDxvsSwi7ZoBB3E",
  authDomain: "carterross-dev-chess.firebaseapp.com",
  databaseURL: "https://carterross-dev-chess-default-rtdb.firebaseio.com",
  projectId: "carterross-dev-chess",
  storageBucket: "carterross-dev-chess.appspot.com",
  messagingSenderId: "236327358610",
  appId: "1:236327358610:web:445c12732d81f4114a164b",
  measurementId: "G-LETTXG1LVE"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

  /* ------------------------------------ firestore -----------------------------------*/
const df = getFirestore(app);
const colRef = collection(df, "leaderboard")
var users = {};
function getLeaderboardFromFirestore() {
  getDocs(colRef)
    .then((snapshot) => {
      console.log(snapshot.docs);
      snapshot.docs.forEach((doc) => {
        users[doc.id] = { 
          ...doc.data(),
          id: doc.id
        };
      });
      console.log(users);
      localStorage.setItem('leaderboard', JSON.stringify(users));
      console.log('leaderboard saved to local storage.');
    })
    .catch((err) => {
      console.log(err.message);
    });
}

function getUsers() {
  return JSON.parse(localStorage.getItem('leaderboard'));
}

if (localStorage.getItem("leaderboard") !== null) {
  users = getUsers();
  console.log("leaderboard retrieved from local storage")
  console.log(users);
} else {
  getLeaderboardFromFirestore();
}

  /* ------------------------------------ firebase section -----------------------------------------*/
const dr = getDatabase();
const auth = getAuth();
var userId = null;
var opponentName = "carter2"
var username = null;
const mainMenuDiv = document.querySelector(".home-menu");
const ingameMenuDiv = document.querySelector(".ingame-menu");
const matchMenuDiv = document.querySelector(".match-menu");

// left side menus navigation
function goToMainMenu() {
  mainMenuDiv.style.display = "flex";
  ingameMenuDiv.style.display = "none";
  matchMenuDiv.style.display = "none";
}

function goToIngameMenu() {
  mainMenuDiv.style.display = "none";
  ingameMenuDiv.style.display = "flex";
}

function gotToMatchMenu() {
  matchMenuDiv.style.display = "flex";
  ingameMenuDiv.style.display = "none";
}

function leaveMatchMenu() {
  matchMenuDiv.style.display = "none";
  ingameMenuDiv.style.display = "flex";
}

// sign up and login
const signupForm = document.querySelector('.signup-login')
signupForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const email = signupForm.email.value
  const password = signupForm.password.value
  username = signupForm.username.value

  if (username != null && username !== "must enter when creating account") {
    createUserWithEmailAndPassword(auth, email, password)
      .then(cred => {
        signupForm.reset()
        userId = cred.user.uid;
        goToIngameMenu();
      })
      .catch(err => {
        console.log(err.message)
      })
  } else {
    console.log("username cannot be empty when signing up");
    signupForm.username.value = "must enter when creating account";
  }
})

// logging in and out
const logoutButton = document.querySelector('.logout')
logoutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      console.log('user signed out')
      goToMainMenu();
      if (localStorage.getItem("savedEmail") != null && localStorage.getItem("savedPassword") != null && localStorage.getItem("savedUsername") != null) {
        document.querySelector(".email-input").value = localStorage.getItem("savedEmail");
        document.querySelector(".password-input").value = localStorage.getItem("savedPassword");
        document.querySelector(".username-input").value = localStorage.getItem("savedUsername");
      }
    })
    .catch(err => {
      console.log(err.message)
    })
})

const loginForm = document.querySelector('.signup-login')
loginForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const email = loginForm.email.value
  const password = loginForm.password.value
  const username = loginForm.username.value

  if (rememberMe) {
    localStorage.setItem("savedEmail", email);
    localStorage.setItem("savedPassword", password);
    localStorage.setItem("savedUsername", username);
  } else {
    localStorage.removeItem("savedEmail");
    localStorage.removeItem("savedPassword");
    localStorage.removeItem("savedUsername");
  }
  
  signInWithEmailAndPassword(auth, email, password)
    .then(cred => {
      loginForm.reset()
      userId = cred.user.uid;
      goToIngameMenu();
    })
    .catch(err => {
      console.log(err.message)
    })
})

// buttons after logging in
const joinMatchButton = document.querySelector(".join-game");
joinMatchButton.addEventListener("click", (e) => {
  e.preventDefault();
  joinMatch();
});

const createMatchButton = document.querySelector(".create-game");
createMatchButton.addEventListener("click", (e) => {
  e.preventDefault();
  createMatch();
});

const leaveMatchButton = document.querySelector(".leave-game");
leaveMatchButton.addEventListener("click", (e) => {
  e.preventDefault();
  leaveMatch();
});

// remeber user details or not: 
var rememberMe = true;
document.querySelector('.control-checkbox').checked = false;
var controlElement = document.querySelector('.control-checkbox');
  var inputElement = controlElement.querySelector('.remember-me-check');
  controlElement.addEventListener('click', function() {
    if (inputElement.checked) {
      rememberMe = true;
    } else {
      rememberMe = false;
    }
  });

if (localStorage.getItem("savedEmail") != null && localStorage.getItem("savedPassword") != null && localStorage.getItem("savedUsername") != null) {
  document.querySelector(".email-input").value = localStorage.getItem("savedEmail");
  document.querySelector(".password-input").value = localStorage.getItem("savedPassword");
  document.querySelector(".username-input").value = localStorage.getItem("savedUsername");
}

function getMatchRef() {
  if (team == "w") {
    return `games/${username}-${opponentName}`;
  } else {
    return `games/${opponentName}-${username}`;
  }
}

var matchRef = `games/${username}-${opponentName}`;

function updateGameBoardDatabase(op = " ") {
  matchRef = getMatchRef();
  set(ref(dr, matchRef), {
    board: encode_board()
  })
  .then(() => {
    
  })
  .catch((error) => {
    console.log("Error writing data to Realtime Database:", error.message);
  });
}

// listen for changes in the database of game board
let isMatchRefInitialized = false;
var prevBoard = null;
var piecesToAdd = [
  [0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
  [1,0],[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],
  [6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6],[6,7],
  [7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],
];
const setupMatchRefListener = () => {
  if (matchRef && !isMatchRefInitialized) {
    onValue(ref(dr, matchRef), (snapshot) =>  {
      if (isMatchRefInitialized) {
        if (turn != team) {
          console.log("loaded previous board inside of math ref listener")
          prevBoard = copy2DArray(board)
        }
        const boardData = snapshot.val();
        if (boardData != null) {
          piecesToAdd = [];
          board = decode_board(boardData["board"]);
          for (let r = 0;r < 8;r++) {
            for (let c = 0;c < 8;c++) {
              console.log(prevBoard[r][c].piece, "|", board[r][c].piece, "|", prevBoard[r][c].piece != board[r][c].piece)
              if (prevBoard[r][c].piece != board[r][c].piece && board[r][c].team != "-") {
                piecesToAdd.push([r,c]);
              }
            }
          }
          updateBoardMeshes();
        }
      } else {
        isMatchRefInitialized = true;
      }
    });
    isMatchRefInitialized = true;
  }
};


const removeMatchRefListener = () => {
  if (matchRef && isMatchRefInitialized) {
    off(matchRef);
    isMatchRefInitialized = false;
  }
};

// creating and joining a match
function createMatch() {
  team = "w";
  opponentName = document.querySelector(".opponent-username-input").value;
  matchRef = getMatchRef();
  setupMatchRefListener();
  updateGameBoardDatabase("newMatch");
  gotToMatchMenu();
}

function joinMatch() {
  opponentName = document.querySelector(".opponent-username-input").value;
  team = "b";
  matchRef = getMatchRef();
  get(ref(dr, matchRef)).then((snapshot) => {
    if (!(snapshot.exists())) {
      document.querySelector(".opponent-username-input").value = "game not created";
    } else {
      setupMatchRefListener();
      gotToMatchMenu();
    }
  })
  .catch(error => {
    console.error('Error checking path:', error);
  });
}

function leaveMatch() {
  leaveMatchMenu();
  isMatchRefInitialized = false;
  removeMatchRefListener();
}

// subscribing to auth changes
const unsubAuth = onAuthStateChanged(auth, (user) => {
  console.log('user status changed:', user);
});

goToMainMenu();

function gameOver(winner) {
  console.log('game over - winner: ', winner);
}

/*-------------------------------------- three js section ---------------------------------------*/

// threejs imports
import * as THREE from 'three';
import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

// starting camera position
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 20;
camera.position.y = 10;

// orbit controls
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

class piece3d {
  constructor(r,c,mesh,piece) {
    this.mesh = mesh;
    this.r = r;
    this.c = c;
    this.piece = piece;
  }
  removePiece() {
    scene.remove(this.mesh);
  }
}

//board pieces placed ** currently for development only cubes **
var meshes = [];
const pieceModels = {
  'wp': 'pieces/white-pawn.gltf',
  'wk': 'pieces/white-king.gltf',
  'wq': 'pieces/white-queen.gltf',
  'wr': 'pieces/white-rook.gltf',
  'wb': 'pieces/white-bishop.gltf',
  'wn': 'pieces/white-knight.gltf',
  'bp': 'pieces/black-pawn.gltf',
  'bk': 'pieces/black-king.gltf',
  'bq': 'pieces/black-queen.gltf',
  'br': 'pieces/black-rook.gltf',
  'bb': 'pieces/black-bishop.gltf',
  'bn': 'pieces/black-knight.gltf',
};

function updateBoardMeshes() {
  kingLoc = findKing(team);
  if (board[kingLoc[0]][kingLoc[1]].isCheck()) {
    inCheckLoc = [kingLoc[0], kingLoc[1]];
    inCheck = true;
    highlightPlane(kingLoc[0], kingLoc[1], "red");
    if (board[kingLoc[0]][kingLoc[1]].find_moves() == []) {
      gameOver(opp[team]);
    }
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let needToPlace = true;
      for (let i = 0; i < meshes.length; i++) {
        if (meshes[i].r == r && meshes[i].c == c && board[r][c].id != meshes[i].piece) {
          console.log("removed pece because: board piece is: ", board[r][c].piece, " and mesh piece is: ", meshes[i].piece);
          console.log("removed piece");
          meshes[i].removePiece();
          meshes.splice(i, 1);
        }
      }
    }
  }

  console.log("pieces to add: ", piecesToAdd);
  for (let i = 0; i < piecesToAdd.length; i++) {
    console.log("loaded a mesh");
    let r = piecesToAdd[i][0];
    let c = piecesToAdd[i][1];
    console.log("r: " + r + ", c: " + c);
    const pieceKey = board[r][c].team + board[r][c].piece;
    const modelPath = pieceModels[pieceKey];
    console.log("modelPath: " + modelPath, "pieceKey: " + pieceKey);

    gltfLoader.load(modelPath, function(gltf) {
      const model = gltf.scene;
      const scaleFactor = 0.5;
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);
      model.position.set((c - 3.5) * gridSquareSize, 1.25, (r - 3.5) * gridSquareSize);
      model.userData.index = { r, c };
      const piece = new piece3d(r, c, model, pieceKey);
      meshes.push(piece);
      scene.add(model);
    }, undefined, function(error) {
      console.error(error);
    });
  }
}

// board location planes for raycast and game logic
var prevClickedMesh = null;

function highlightMoves(moves) {
  for (let i = 0; i < moves.length; i++) {
    highlightPlane(moves[i][0],moves[i][1]);
  }
}

function highlightPlane(r,c,color="yellow") {
  if (color == "yellow") {
    planesArray[r][c].material.color.set(0xffff00);
  } else if (color == "red") {
    planesArray[r][c].material.color.set(0xff0000);
  }
}

function resetPlanes() {
  for (let i = 0; i < 8;i++) {
    for (let j = 0; j < 8; j++) {
      if (inCheck && kingLoc[0] == i && kingLoc[1] == j) {
        highlightPlane(kingLoc[0], kingLoc[1],"red")
      }
      else if (planesArray[i][j].userData.defaultColor == "b") {
        planesArray[i][j].material.color.set(0x000000);
      } else {
        planesArray[i][j].material.color.set(0xffffff);
      }
    }
  }
}

function onCanvasClick(event) {
  kingLoc = findKing(team);
  resetPlanes();
  const canvasBounds = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2();
  mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
  mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true); // Set the second parameter to true to check all descendants of an object

  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    let targetObject = clickedMesh;
    while (!targetObject.userData.index && targetObject.parent) {
      targetObject = targetObject.parent;
    }
    const clickedMeshIndex = targetObject.userData.index;
    if (clickedMeshIndex) {
      const { r, c } = clickedMeshIndex;
      prevClickedMesh = targetObject;
      /* ------------------------------------------------------------ game logic ----------------------------------------------------------------------*/
      if (state == "unselected") {
        if (board[r][c].team == team && turn == team) {
          if (board[r][c].team != "-") {
            resetPlanes();
            availableMoves = board[r][c].find_moves();
            highlightMoves(availableMoves);
            rSelected = r;
            cSelected = c;
            state = "selected";
          }
        }
      } else if (state == "selected") {
        for (let i = 0; i < availableMoves.length; i++) {
          if (availableMoves[i][0] == r && availableMoves[i][1] == c) {
            prevBoard = copy2DArray(board);
            board[r][c] = new Spot(r, c, board[rSelected][cSelected].id);
            board[rSelected][cSelected] = new Spot(rSelected, cSelected, "-=");
            scene.remove();
            log_board();
            encodedBoard = encode_board();
            updateGameBoardDatabase();
            state = "unselected";
            resetPlanes();
          }
        }
        state = "unselected";
      }
      /* ----------------------------------------------------------------------------------------------------------------------------------------------*/
    } else {

    }
  }
}


var planesArray = Array(8).fill().map(() => Array(8).fill(null));
var altCounter = 1;
var rayPlaneColor = 0xffffff;
for(let r = 0; r < 8; r++) {
  let row = [];
  altCounter *= -1;
  for(let c = 0; c < 8; c++) {
    if (altCounter == -1) {
      rayPlaneColor = 0x000000; 
    } else {
      rayPlaneColor = 0xffffff;
    }
    let planeGeometry = new THREE.PlaneGeometry(gridSquareSize, gridSquareSize);
    let planeMaterial = new THREE.MeshBasicMaterial({color: rayPlaneColor});
    let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    if (altCounter == -1) {
      planeMesh.userData.defaultColor = "b";
    } else {
      planeMesh.userData.defaultColor = "w";
    }
    planeMesh.rotation.x = degToRad(-90);
    planeMesh.position.set((c - 3.5) * gridSquareSize, 1.25, (r - 3.5) * gridSquareSize);
    planeMesh.userData.index = { r, c };
    renderer.domElement.addEventListener('click', onCanvasClick);
    scene.add(planeMesh);
    altCounter *= -1;
    planesArray[r][c] = planeMesh;
  }
}

// ambient scene light
/*
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight);
*/

// directional light
function addPointLight(color, intensity, distance, position) {
  const pointLight = new THREE.PointLight(color, intensity, distance);
  pointLight.position.set(position.x, position.y, position.z);
  scene.add(pointLight);
}

addPointLight(0xffffff, 3, 80, new THREE.Vector3(30, 25, 0));
addPointLight(0xffffff, 3, 80, new THREE.Vector3(-30, 25, 0));
addPointLight(0xffffff, 3, 80, new THREE.Vector3(0, 25, 30));
addPointLight(0xffffff, 3, 80, new THREE.Vector3(0, 25, -30));


function rgbToHex(r, g, b) {
  var redHex = r.toString(16).padStart(2, '0');
  var greenHex = g.toString(16).padStart(2, '0');
  var blueHex = b.toString(16).padStart(2, '0');
  return parseInt(redHex + greenHex + blueHex, 16);
}

// background
const backgrounds = {
  "white" : "white_background.jpeg",
}
var choice = "white";
const background_texture = new THREE.TextureLoader().load(backgrounds[choice]);
scene.background = background_texture;

// chess board
gltfLoader.load("chess_board/scene.gltf", function(gltf) {
  const model = gltf.scene;
  scene.add(model);
  model.position.set(0,0,0)
}, undefined, function(error) {
  console.error(error);
});

updateBoardMeshes(decode_board(encode_board()));

// main loop
function animate() {
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);