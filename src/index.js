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

function encodeBoard(op="") {
  let result = "";
  if (op == "w") {
    result = "w";
  } else {
    result = `${opp[turn]}`;
  }
  let counter = 0;
  let empty = false;

  if (gm == "double" || op == "double") {
    outerloop:
    for (let r = 0; r < 16; r++) {
      inerloop:
      for (let c = 0; c < 16; c++) {
        if (r > 16 && c > 16) {
          break outerloop;
        }
        if (board2[r][c].team != "-") {
          if (empty) {
            result += `${counter}`;
            counter = 0;
            empty = false;
          }
          result += board2[r][c].id;
        } else {
          counter++;
          empty = true;
          if (r == 16 && c == 16) {
            result += `${counter}`;
          }
        }
      }
    }
  } else {
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
          if (r == 7 && c == 7) {
            result += `${counter}`;
          }
        }
      }
    }
  }
  return result;
}

function isNumber(char) {
  return /^\d$/.test(char);
}

function decodeBoard(code,keepTurn = false) {

  let result;
  if (gm == "double") {
    result = Array(16).fill().map(() => Array(16).fill(null));
    let r = 0;
    let c = 0;
    if (!(keepTurn)) {
      turn = code[0];
    };
    while (i < code.length) {
      let ch = code[i];
      if (isNumber(ch)) {
        if (isNumber(code[i+1])) {
          ch += code[i+1];
          i++;
          if (isNumber(code[i+1])) {
            ch += code[i+1];
            i++;
          }
        }
        let count = parseInt(ch);
        for (let j = 0; j < count; j++) {
          result[r][c] = new Spot(r,c,"-=")
          c++;
          if (c == 16) {
            c = 0;
            r++;
          }
        }
        i++;
      } else {
        let id = ch + code.charAt(i + 1);
        result[r][c] = new Spot(r,c,id);
        c++;
        if (c == 16) {
          c = 0;
          r++;
        }
        i += 2;
      }
    }
  } else {
    result = Array(8).fill().map(() => Array(8).fill(null));
    let r = 0;
    let c = 0;
    if (!(keepTurn)) {
      turn = code[0];
    } else {
      turn = " w";
    }
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

  if (gm == "double") {
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        if (board2[r][c].id == `${team}k`) {
          return [r,c];
        }
      }
    }
  } else {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c].id == `${team}k`) {
          return [r,c];
        }
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
    let b;
    if (gm == "double") {
      if (op == "next") {
        b = nextBoard2;
      } else {
        b = board2;
      }
    } else {
      if (op == "next") {
        b = nextBoard;
      } else {
        b = board;
      }
    }
    let team = this.team;
    let r = this.r;
    let c = this.c;

    if (gm == "standard" || gm == "queen attack" || gm == "lava bridge") {
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

    //---------------------------------------------------------------  double check for check ----------------------------------------------------------
    } else if (gm == "double") {
      // checks if black pawn will make check
      if (team == "w") {
        if (r > 0 && c < 15) {
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
        if (r < 15 && c < 15) {
          if (b[r+1][c+1].id == "wp") /* down 1 right 1 */ {
            return true;
          }
        }
        if (r < 15 && c > 0) {
          if (b[r+1][c-1].id == "wp") /* down 1 left 1 */ {
            return true;
          }
        }
      }

      // checks if knight will make check
      ir = [1,2,2,1,-1,-2,-2,-1]; 
      ic = [2,1,-1,-2,-2,-1,1,2]; // locations to check for pieces relative to the piece
      for (let i = 0; i < 16;i++) {
        if (r+ir[i] > -1 && r+ir[i] < 16 && c+ic[i] > -1 && c+ic[i] < 16) {
          if (b[r+ir[i]][c+ic[i]].id == `${opp[team]}n`) {
            return true;
          }
        }
      }

      // checks if rook will make check or queen in rook directions
      if (r < 15) {
        for (let i = r+1;i < 16;i++) {
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
      if (c < 15) {
        for (let i = c+1;i < 16;i++) {
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
      for (let i = 1;i < 16;i++) {
        if (r+i == 16 || c+i == 16) {
          break;
        }
        if (b[r+i][c+i].team == team) {
          break;
        }
        if (b[r+i][c+i].id == `${opp[team]}b` || b[r+i][c+i].id == `${opp[team]}q`) /* down right */ {
          return true;
        }
      }
      for (let i = 1;i < 16;i++) {
        if (r+i == 16 || c-i == -1) {
          break;
        }
        if (b[r+i][c-i].team == team) {
          break;
        }
        if (b[r+i][c-i].id == `${opp[team]}b` || b[r+i][c-i].id == `${opp[team]}q`) /* down left */ {
          return true;
        } 
      }
      for (let i = 1;i < 16;i++) {
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
      for (let i = 1;i < 16;i++) {
        if (r-i == -1 || c+i == 16) {
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
      for (let i = 0;i < 16;i++) {
        if (r+ir[i] > 0 && r+ir[i] < 16 && c+ic[i] > 0 && c+ic[i] < 16) {
          if (b[r+ir[i]][c+ic[i]].id == `${opp[team]}k`) {
            return true;
          }
        }
      }
    }

    return false;
  } // end of isCheck

  findMoves () {      

    let ir = [];
    let ic = [];
    let b;
    if (gm == "double") {
      b = board2;
    } else {
      b = board;
    }
    let m = gm
    let team = this.team;
    let r = this.r;
    let c = this.c;
    let moves = [];
    let piece = this.piece;
    let id = this.id;

    if (gm == "standard" || gm == "queen attack" || gm == "lava bridge") {
      // checks for moves king can make
      if (piece == "k") {
        ir = [0,1,1, 1, 0,-1,-1,-1];
        ic = [1,1,0,-1,-1,-1, 0, 1];
        for (let i = 0;i < 8;i++) {
          if (r+ir[i] > -1 && r+ir[i] < 8 && c+ic[i] > -1 && c+ic[i] < 8 && board[r+ir[i]][c+ic[i]].team != team) {
            nextBoard = getNextBoard(r,c,r+ir[i],c+ic[i]);
            if (!(nextBoard[r+ir[i]][c+ic[i]].isCheck("next"))) {
              moves.push([r+ir[i],c+ic[i]]);
            }
          }
        }
      }

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
            if (b[i][c].team == team || (m == "lava bridge" && (c < 3 || c > 4) && (i == 3 || i == 4))) {
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
            if (b[i][c].team == team || (m == "lava bridge" && (c < 3 || c > 4) && (i == 3 || i == 4))) {
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
          if (m == "lava bridge" && (r+i == 3 || r+i == 4) && (c+i < 3 || c+i  > 4)) {
            break;
          } 
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
          if (m == "lava bridge" && (r+i == 3 || r+i == 4) && (c-i < 3 || c-i > 4)) {
            break;
          } 
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
          if (m == "lava bridge" && (r-i == 3 || r-i == 4) && (c-i < 3 || c-i > 4)) {
            break;
          } 
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
          if (m == "lava bridge" && (r-i == 3 || r-i == 4) && (c+i < 3 || c+i > 4)) {
            break;
          } 
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
    //---------------------------------------------------------- finding move for double mode ------------------------------------------------------
    } else if (gm == "double") {
      // checks for moves king can make
      if (piece == "k") {
        ir = [0,1,1, 1, 0,-1,-1,-1];
        ic = [1,1,0,-1,-1,-1, 0, 1];
        for (let i = 0;i < 16;i++) {
          if (r+ir[i] > -1 && r+ir[i] < 16 && c+ic[i] > -1 && c+ic[i] < 16 && board2[r+ir[i]][c+ic[i]].team != team) {
            nextBoard2 = getNextBoard(r,c,r+ir[i],c+ic[i]);
            if (!(nextBoard2[r+ir[i]][c+ic[i]].isCheck("next"))) {
              moves.push([r+ir[i],c+ic[i]]);
            }
          }
        }
      }

      // finds moves for white pawns
      if(id == "wp") {
        if (r > 0) {
          if (b[r-1][c].team == "-") /* up 1 */ {
            nextBoard2 = getNextBoard(r,c,r-1,c);
            if (inCheck) {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r-1,c])
              }
            } else {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r-1,c]);
              }
            }
            if (r > 1) {  
              if (r > 11 && b[r-2][c].team == "-") /* up 2 at start */ {
                nextBoard2 = getNextBoard(r,c,r-2,c);
                if (inCheck) {
                  if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                    moves.push([r-2,c]);
                  }
                } else {
                  if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                    moves.push([r-2,c]);
                  }
                }
              }
            }
          }
        }
        if (r > 0 && c < 15) {
          if (b[r-1][c+1].team == opp[team]) /* capture piece up 1 right 1 */ {
            if (inCheck) {
              nextBoard2 = getNextBoard(r,c,r-1,c+1);
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r-1,c+1]);
              }
            } else {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r-1,c+1]);
              }
            }
          }
        }
        if (r > 0 && c > 0) {
          if (b[r-1][c-1].team == opp[team]) /* capture piece up 1 right 1 */ {
            if (inCheck) {
              nextBoard2 = getNextBoard(r,c,r-1,c-1);
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r-1,c-1]);
              }
            } else {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r-1,c-1]);
              }
            }
          }
        }
      }

      // finds moves for black pawns
      if(id == "bp") {
        if (r < 15) {
          if (b[r+1][c].team == "-") /* up 1 */ {
            nextBoard2 = getNextBoard(r,c,r+1,c);
            if (inCheck) {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r+1,c])
              }
            } else {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r+1,c]);
              }
            }
            if (r < 14) {  
              if (r < 4 && b[r+2][c].team == "-") /* up 2 at start */ {
                nextBoard2 = getNextBoard(r,c,r+2,c);
                if (inCheck) {
                  if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                    moves.push([r+2,c]);
                  }
                } else {
                  if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                    moves.push([r+2,c]);
                  }
                }
              }
            }
          }
        }
        if (r < 15 && c < 15) {
          if (b[r+1][c+1].team == opp[team]) /* capture piece up 1 right 1 */ {
            if (inCheck) {
              nextBoard2 = getNextBoard(r,c,r+1,c+1);
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r+1,c+1]);
              }
            } else {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r+1,c+1]);
              }
            }
          }
        }
        if (r < 15 && c > 0) {
          if (b[r+1][c-1].team == opp[team]) /* capture piece up 1 right 1 */ {
            if (inCheck) {
              nextBoard2 = getNextBoard(r,c,r+1,c-1);
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r+1,c-1]);
              }
            } else {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
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
        for (let i = 0; i < 16;i++) {
          if (r+ir[i] > -1 && r+ir[i] < 16 && c+ic[i] > -1 && c+ic[i] < 16 ) {
            if (inCheck) {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r+ir[i], c+ic[i]]);
              }
            } else if (b[r+ir[i]][c+ic[i]].team != team) {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r+ir[i], c+ic[i]]);
              }
            }
          }
        }
      }

      // finds moves for rooks an queen in rook directions
      if (piece == "r" || piece == "q") {
        if (r < 15) {
          for (let i = r+1;i < 16;i++) {
            if (b[i][c].team == team || (m == "lava bridge" && (c < 3 || c > 4) && (i == 3 || i == 4))) {
              break;
            } else {
              nextBoard2 = getNextBoard(r,c,i,c);
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([i,c]);
              }
              if (b[i][c].team == opp[team]) {
                break;
              }
            }
          }
        }
        if (c < 15) {
          for (let i = c+1;i < 16;i++) {
            if (b[r][i].team == team) {
              break;
            } else {
              nextBoard2 = getNextBoard(r,c,r,i);
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
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
            if (b[i][c].team == team || (m == "lava bridge" && (c < 3 || c > 4) && (i == 3 || i == 4))) {
              break;
            } else {
              nextBoard2 = getNextBoard(r,c,i,c);
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
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
              nextBoard2 = getNextBoard(r,c,r,i);
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
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
        for (let i = 1;i < 16;i++) {
          if (r+i == 16 || c+i == 16) {
            break;
          }
          nextBoard2 = getNextBoard(r,c,r+i,c+i);
          if (m == "lava bridge" && (r+i == 3 || r+i == 4) && (c+i < 3 || c+i  > 4)) {
            break;
          } 
          if (b[r+i][c+i].team == "-") {
            if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+i, c+i]);
            }
          } else {
            if (b[r+i][c+i].team == team) /* down right */ {
              break;
            } else {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r+i, c+i]);
              }
              break;
            }
          } 
        }
        for (let i = 1;i < 16;i++) {
          if (r+i == 16 || c-i == -1) {
            break;
          }
          nextBoard2 = getNextBoard(r,c,r+i,c-i);
          if (m == "lava bridge" && (r+i == 3 || r+i == 4) && (c-i < 3 || c-i > 4)) {
            break;
          } 
          if (b[r+i][c-i].team == "-") {
            if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r+i, c-i]);
            }
          } else {
            if (b[r+i][c-i].team == team) /* down left */ {
              break;
            } else {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r+i, c-i]);
              }
              break;
            }
          } 
        }
        for (let i = 1;i < 16;i++) {
          if (r-i == -1 || c-i == -1) {
            break;
          }
          nextBoard2 = getNextBoard(r,c,r-i,c-i);
          if (m == "lava bridge" && (r-i == 3 || r-i == 4) && (c-i < 3 || c-i > 4)) {
            break;
          } 
          if (b[r-i][c-i].team == "-") {
            if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
              moves.push([r-i, c-i]);
            }
          } else {
            if (b[r-i][c-i].team == team) /* up left */ {
              break;
            } else {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) {
                moves.push([r-i, c-i]);
              }
              break;
            }
          } 
        }
        for (let i = 1;i < 16;i++) {
          if (r-i == -1 || c+i == 16) {
            break;
          }
          nextBoard2 = getNextBoard(r,c,r-i,c+i);
          if (m == "lava bridge" && (r-i == 3 || r-i == 4) && (c+i < 3 || c+i > 4)) {
            break;
          } 
          if (b[r-i][c+i].team == "-") {
            if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) { 
              moves.push([r-i, c+i]);
            }
          } else {
            if (b[r-i][c+i].team == team) /* up right */ {
              break;
            } else {
              if (!(nextBoard2[kingLoc[0]][kingLoc[1]].isCheck("next"))) { 
                moves.push([r-i, c+i]);
              }
              break;
            }
          } 
        }
      }
    }

    return moves;
  } // end of moves
}

const defaultBoard2 = 
  `wbrbrbnbnbbbbbqbqbkbqbbbbbnbnbrbrbrbrbnbnbbbbbqbqbqbqbbbbbnbnbrbrbp
  bpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbpbp
  bpbp128wpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpwpw
  pwpwpwrwrwnwnwbwbwqwqwqwbwbwnwnwrwrwrwrwnwnwbwbwqwqwqwkwbwbwnwnwrwr`;

const defaultBoard = "wbrbnbbbqbkbbbnbrbpbpbpbpbpbpbpbp32wpwpwpwpwpwpwpwpwrwnwbwqwkwbwnwr";
const queenAttackBoard = "wbqbqbqbqbkbqbqbqbpbpbpbpbpbpbpbp32wpwpwpwpwpwpwpwpwqwqwqwqwkwqwqwq";

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
  let result;
  if (gm == "double") {
    result = copy2DArray(board2);
  } else {
    result = copy2DArray(board);
  }
  result[r2][c2] = new Spot(r2,c2,`${result[r1][c1].team}${result[r1][c1].piece}`);
  result[r1][c1] = new Spot(r1,c1,"-=");
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

var prevBoard = [
  // row 0
  [new Spot(0,0,"-="), new Spot(0,1,"-="), new Spot(0,2,"-="), new Spot(0,3,"-="),
   new Spot(0,4,"-="), new Spot(0,5,"-="), new Spot(0,6,"-="), new Spot(0,7,"-="),],
  // row 1
  [new Spot(1,0,"-="), new Spot(1,1,"-="), new Spot(1,2,"-="), new Spot(1,3,"-="),
   new Spot(1,4,"-="), new Spot(1,5,"-="), new Spot(1,6,"-="), new Spot(1,7,"-="),],
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
  [new Spot(6,0,"-="), new Spot(6,1,"-="), new Spot(6,2,"-="), new Spot(6,3,"-="),
   new Spot(6,4,"-="), new Spot(6,5,"-="), new Spot(6,6,"-="), new Spot(6,7,"-="),],
  // row 7
  [new Spot(7,0,"-="), new Spot(7,1,"-="), new Spot(7,2,"-="), new Spot(7,3,"-="),
   new Spot(7,4,"-="), new Spot(7,5,"-="), new Spot(7,6,"-="), new Spot(7,7,"-="),],
];


//----------------------------------------------------------- double boards ----------------------------------------------------------------
var prevBoard2 = [
  // row 0
  [new Spot(0,0,"-="),  new Spot(0,1,"-="),  new Spot(0,2,"-="),  new Spot(0,3,"-="),
   new Spot(0,4,"-="),  new Spot(0,5,"-="),  new Spot(0,6,"-="),  new Spot(0,7,"-="),
   new Spot(0,8,"-="),  new Spot(0,9,"-="),  new Spot(0,10,"-="), new Spot(0,11,"-="),
   new Spot(0,12,"-="), new Spot(0,13,"-="), new Spot(0,14,"-="), new Spot(0,15,"-="),],
  // row 1
  [new Spot(1,0,"-="),  new Spot(1,1,"-="),  new Spot(1,2,"-="),  new Spot(1,3,"-="),
   new Spot(1,4,"-="),  new Spot(1,5,"-="),  new Spot(1,6,"-="),  new Spot(1,7,"-="),
   new Spot(1,8,"-="),  new Spot(1,9,"-="),  new Spot(1,10,"-="), new Spot(1,11,"-="),
   new Spot(1,12,"-="), new Spot(1,13,"-="), new Spot(1,14,"-="), new Spot(1,15,"-="),],
  // row 2
  [new Spot(2,0,"-="),  new Spot(2,1,"-="),  new Spot(2,2,"-="),  new Spot(2,3,"-="),
   new Spot(2,4,"-="),  new Spot(2,5,"-="),  new Spot(2,6,"-="),  new Spot(2,7,"-="),
   new Spot(2,8,"-="),  new Spot(2,9,"-="),  new Spot(2,10,"-="), new Spot(2,11,"-="),
   new Spot(2,12,"-="), new Spot(2,13,"-="), new Spot(2,14,"-="), new Spot(2,15,"-="),],
  // row 3
  [new Spot(3,0,"-="),  new Spot(3,1,"-="),  new Spot(3,2,"-="),  new Spot(3,3,"-="),
   new Spot(3,4,"-="),  new Spot(3,5,"-="),  new Spot(3,6,"-="),  new Spot(3,7,"-="),
   new Spot(3,8,"-="),  new Spot(3,9,"-="),  new Spot(3,10,"-="), new Spot(3,11,"-="),
   new Spot(3,12,"-="), new Spot(3,13,"-="), new Spot(3,14,"-="), new Spot(3,15,"-="),],
  // row 4
  [new Spot(4,0,"-="),  new Spot(4,1,"-="),  new Spot(4,2,"-="),  new Spot(4,3,"-="),
   new Spot(4,4,"-="),  new Spot(4,5,"-="),  new Spot(4,6,"-="),  new Spot(4,7,"-="),
   new Spot(4,8,"-="),  new Spot(4,9,"-="),  new Spot(4,10,"-="), new Spot(4,11,"-="),
   new Spot(4,12,"-="), new Spot(4,13,"-="), new Spot(4,14,"-="), new Spot(4,15,"-="),],
  // row 5
  [new Spot(5,0,"-="),  new Spot(5,1,"-="),  new Spot(5,2,"-="),  new Spot(5,3,"-="),
   new Spot(5,4,"-="),  new Spot(5,5,"-="),  new Spot(5,6,"-="),  new Spot(5,7,"-="),
   new Spot(5,8,"-="),  new Spot(5,9,"-="),  new Spot(5,10,"-="), new Spot(5,11,"-="),
   new Spot(5,12,"-="), new Spot(5,13,"-="), new Spot(5,14,"-="), new Spot(5,15,"-="),],
  // row 6
  [new Spot(6,0,"-="),  new Spot(6,1,"-="),  new Spot(6,2,"-="),  new Spot(6,3,"-="),
   new Spot(6,4,"-="),  new Spot(6,5,"-="),  new Spot(6,6,"-="),  new Spot(6,7,"-="),
   new Spot(6,8,"-="),  new Spot(6,9,"-="),  new Spot(6,10,"-="), new Spot(6,11,"-="),
   new Spot(6,12,"-="), new Spot(6,13,"-="), new Spot(6,14,"-="), new Spot(6,15,"-="),],
  // row 7
  [new Spot(7,0,"-="),  new Spot(7,1,"-="),  new Spot(7,2,"-="),  new Spot(7,3,"-="),
   new Spot(7,4,"-="),  new Spot(7,5,"-="),  new Spot(7,6,"-="),  new Spot(7,7,"-="),
   new Spot(7,8,"-="),  new Spot(7,9,"-="),  new Spot(7,10,"-="), new Spot(7,11,"-="),
   new Spot(7,12,"-="), new Spot(7,13,"-="), new Spot(7,14,"-="), new Spot(7,15,"-="),],
  // row 8
  [new Spot(8,0,"-="),  new Spot(8,1,"-="),  new Spot(8,2,"-="),  new Spot(8,3,"-="),
   new Spot(8,4,"-="),  new Spot(8,5,"-="),  new Spot(8,6,"-="),  new Spot(8,7,"-="),
   new Spot(8,8,"-="),  new Spot(8,9,"-="),  new Spot(8,10,"-="), new Spot(8,11,"-="),
   new Spot(8,12,"-="), new Spot(8,13,"-="), new Spot(8,14,"-="), new Spot(8,15,"-="),],
  // row 9
  [new Spot(9,0,"-="),  new Spot(9,1,"-="),  new Spot(9,2,"-="),  new Spot(9,3,"-="),
   new Spot(9,4,"-="),  new Spot(9,5,"-="),  new Spot(9,6,"-="),  new Spot(9,7,"-="),
   new Spot(9,8,"-="),  new Spot(9,9,"-="),  new Spot(9,10,"-="), new Spot(9,11,"-="),
   new Spot(9,12,"-="), new Spot(9,13,"-="), new Spot(9,14,"-="), new Spot(9,15,"-="),],
  // row 10
  [new Spot(10,0,"-="),  new Spot(10,1,"-="),  new Spot(10,2,"-="),  new Spot(10,3,"-="),
   new Spot(10,4,"-="),  new Spot(10,5,"-="),  new Spot(10,6,"-="),  new Spot(10,7,"-="),
   new Spot(10,8,"-="),  new Spot(10,9,"-="),  new Spot(10,10,"-="), new Spot(10,11,"-="),
   new Spot(10,12,"-="), new Spot(10,13,"-="), new Spot(10,14,"-="), new Spot(10,15,"-="),],
  // row 11
  [new Spot(11,0,"-="),  new Spot(11,1,"-="),  new Spot(11,2,"-="),  new Spot(11,3,"-="),
   new Spot(11,4,"-="),  new Spot(11,5,"-="),  new Spot(11,6,"-="),  new Spot(11,7,"-="),
   new Spot(11,8,"-="),  new Spot(11,9,"-="),  new Spot(11,10,"-="), new Spot(11,11,"-="),
   new Spot(11,12,"-="), new Spot(11,13,"-="), new Spot(11,14,"-="), new Spot(11,15,"-="),],
  // row 12
  [new Spot(12,0,"-="),  new Spot(12,1,"-="),  new Spot(12,2,"-="),  new Spot(12,3,"-="),
   new Spot(12,4,"-="),  new Spot(12,5,"-="),  new Spot(12,6,"-="),  new Spot(12,7,"-="),
   new Spot(12,8,"-="),  new Spot(12,9,"-="),  new Spot(12,10,"-="), new Spot(12,11,"-="),
   new Spot(12,12,"-="), new Spot(12,13,"-="), new Spot(12,14,"-="), new Spot(12,15,"-="),],
  // row 13
  [new Spot(13,0,"-="),  new Spot(13,1,"-="),  new Spot(13,2,"-="),  new Spot(13,3,"-="),
   new Spot(13,4,"-="),  new Spot(13,5,"-="),  new Spot(13,6,"-="),  new Spot(13,7,"-="),
   new Spot(13,8,"-="),  new Spot(13,9,"-="),  new Spot(13,10,"-="), new Spot(13,11,"-="),
   new Spot(13,12,"-="), new Spot(13,13,"-="), new Spot(13,14,"-="), new Spot(13,15,"-="),],
  // row 14
  [new Spot(14,0,"-="),  new Spot(14,1,"-="),  new Spot(14,2,"-="),  new Spot(14,3,"-="),
   new Spot(14,4,"-="),  new Spot(14,5,"-="),  new Spot(14,6,"-="),  new Spot(14,7,"-="),
   new Spot(14,8,"-="),  new Spot(14,9,"-="),  new Spot(14,10,"-="), new Spot(14,11,"-="),
   new Spot(14,12,"-="), new Spot(14,13,"-="), new Spot(14,14,"-="), new Spot(14,15,"-="),],
  // row 15
  [new Spot(15,0,"-="),  new Spot(15,1,"-="),  new Spot(15,2,"-="),  new Spot(15,3,"-="),
   new Spot(15,4,"-="),  new Spot(15,5,"-="),  new Spot(15,6,"-="),  new Spot(15,7,"-="),
   new Spot(15,8,"-="),  new Spot(15,9,"-="),  new Spot(15,10,"-="), new Spot(15,11,"-="),
   new Spot(15,12,"-="), new Spot(15,13,"-="), new Spot(15,14,"-="), new Spot(15,15,"-="),],
];

var board2 = [
  // row 0
  [new Spot(0,0,"br"),  new Spot(0,1,"br"),  new Spot(0,2,"bn"),  new Spot(0,3,"bn"),
   new Spot(0,4,"bb"),  new Spot(0,5,"bb"),  new Spot(0,6,"bq"),  new Spot(0,7,"bq"),
   new Spot(0,8,"bk"),  new Spot(0,9,"bq"),  new Spot(0,10,"bb"), new Spot(0,11,"bb"),
   new Spot(0,12,"bn"), new Spot(0,13,"bn"), new Spot(0,14,"br"), new Spot(0,15,"br"),],
  // row 1
  [new Spot(1,0,"br"),  new Spot(1,1,"br"),  new Spot(1,2,"bn"),  new Spot(1,3,"bn"),
   new Spot(1,4,"bb"),  new Spot(1,5,"bb"),  new Spot(1,6,"bq"),  new Spot(1,7,"bq"),
   new Spot(1,8,"bq"),  new Spot(1,9,"bq"),  new Spot(1,10,"bb"), new Spot(1,11,"bb"),
   new Spot(1,12,"bn"), new Spot(1,13,"bn"), new Spot(1,14,"br"), new Spot(1,15,"br"),],
  // row 2
  [new Spot(2,0,"bp"),  new Spot(2,1,"bp"),  new Spot(2,2,"bp"),  new Spot(2,3,"bp"),
   new Spot(2,4,"bp"),  new Spot(2,5,"bp"),  new Spot(2,6,"bp"),  new Spot(2,7,"bp"),
   new Spot(2,8,"bp"),  new Spot(2,9,"bp"),  new Spot(2,10,"bp"), new Spot(2,11,"bp"),
   new Spot(2,12,"bp"), new Spot(2,13,"bp"), new Spot(2,14,"bp"), new Spot(2,15,"bp"),],
  // row 3
  [new Spot(3,0,"bp"),  new Spot(3,1,"bp"),  new Spot(3,2,"bp"),  new Spot(3,3,"bp"),
   new Spot(3,4,"bp"),  new Spot(3,5,"bp"),  new Spot(3,6,"bp"),  new Spot(3,7,"bp"),
   new Spot(3,8,"bp"),  new Spot(3,9,"bp"),  new Spot(3,10,"bp"), new Spot(3,11,"bp"),
   new Spot(3,12,"bp"), new Spot(3,13,"bp"), new Spot(3,14,"bp"), new Spot(3,15,"bp"),],
  // row 4
  [new Spot(4,0,"-="),  new Spot(4,1,"-="),  new Spot(4,2,"-="),  new Spot(4,3,"-="),
   new Spot(4,4,"-="),  new Spot(4,5,"-="),  new Spot(4,6,"-="),  new Spot(4,7,"-="),
   new Spot(4,8,"-="),  new Spot(4,9,"-="),  new Spot(4,10,"-="), new Spot(4,11,"-="),
   new Spot(4,12,"-="), new Spot(4,13,"-="), new Spot(4,14,"-="), new Spot(4,15,"-="),],
  // row 5
  [new Spot(5,0,"-="),  new Spot(5,1,"-="),  new Spot(5,2,"-="),  new Spot(5,3,"-="),
   new Spot(5,4,"-="),  new Spot(5,5,"-="),  new Spot(5,6,"-="),  new Spot(5,7,"-="),
   new Spot(5,8,"-="),  new Spot(5,9,"-="),  new Spot(5,10,"-="), new Spot(5,11,"-="),
   new Spot(5,12,"-="), new Spot(5,13,"-="), new Spot(5,14,"-="), new Spot(5,15,"-="),],
  // row 6
  [new Spot(6,0,"-="),  new Spot(6,1,"-="),  new Spot(6,2,"-="),  new Spot(6,3,"-="),
   new Spot(6,4,"-="),  new Spot(6,5,"-="),  new Spot(6,6,"-="),  new Spot(6,7,"-="),
   new Spot(6,8,"-="),  new Spot(6,9,"-="),  new Spot(6,10,"-="), new Spot(6,11,"-="),
   new Spot(6,12,"-="), new Spot(6,13,"-="), new Spot(6,14,"-="), new Spot(6,15,"-="),],
  // row 7
  [new Spot(7,0,"-="),  new Spot(7,1,"-="),  new Spot(7,2,"-="),  new Spot(7,3,"-="),
   new Spot(7,4,"-="),  new Spot(7,5,"-="),  new Spot(7,6,"-="),  new Spot(7,7,"-="),
   new Spot(7,8,"-="),  new Spot(7,9,"-="),  new Spot(7,10,"-="), new Spot(7,11,"-="),
   new Spot(7,12,"-="), new Spot(7,13,"-="), new Spot(7,14,"-="), new Spot(7,15,"-="),],
  // row 8
  [new Spot(8,0,"-="),  new Spot(8,1,"-="),  new Spot(8,2,"-="),  new Spot(8,3,"-="),
   new Spot(8,4,"-="),  new Spot(8,5,"-="),  new Spot(8,6,"-="),  new Spot(8,7,"-="),
   new Spot(8,8,"-="),  new Spot(8,9,"-="),  new Spot(8,10,"-="), new Spot(8,11,"-="),
   new Spot(8,12,"-="), new Spot(8,13,"-="), new Spot(8,14,"-="), new Spot(8,15,"-="),],
  // row 9
  [new Spot(9,0,"-="),  new Spot(9,1,"-="),  new Spot(9,2,"-="),  new Spot(9,3,"-="),
   new Spot(9,4,"-="),  new Spot(9,5,"-="),  new Spot(9,6,"-="),  new Spot(9,7,"-="),
   new Spot(9,8,"-="),  new Spot(9,9,"-="),  new Spot(9,10,"-="), new Spot(9,11,"-="),
   new Spot(9,12,"-="), new Spot(9,13,"-="), new Spot(9,14,"-="), new Spot(9,15,"-="),],
  // row 10
  [new Spot(10,0,"-="),  new Spot(10,1,"-="),  new Spot(10,2,"-="),  new Spot(10,3,"-="),
   new Spot(10,4,"-="),  new Spot(10,5,"-="),  new Spot(10,6,"-="),  new Spot(10,7,"-="),
   new Spot(10,8,"-="),  new Spot(10,9,"-="),  new Spot(10,10,"-="), new Spot(10,11,"-="),
   new Spot(10,12,"-="), new Spot(10,13,"-="), new Spot(10,14,"-="), new Spot(10,15,"-="),],
  // row 11
  [new Spot(11,0,"-="),  new Spot(11,1,"-="),  new Spot(11,2,"-="),  new Spot(11,3,"-="),
   new Spot(11,4,"-="),  new Spot(11,5,"-="),  new Spot(11,6,"-="),  new Spot(11,7,"-="),
   new Spot(11,8,"-="),  new Spot(11,9,"-="),  new Spot(11,10,"-="), new Spot(11,11,"-="),
   new Spot(11,12,"-="), new Spot(11,13,"-="), new Spot(11,14,"-="), new Spot(11,15,"-="),],
  // row 12
  [new Spot(12,0,"wp"),  new Spot(12,1,"wp"),  new Spot(12,2,"wp"),  new Spot(12,3,"wp"),
   new Spot(12,4,"wp"),  new Spot(12,5,"wp"),  new Spot(12,6,"wp"),  new Spot(12,7,"wp"),
   new Spot(12,8,"wp"),  new Spot(12,9,"wp"),  new Spot(12,10,"wp"), new Spot(12,11,"wp"),
   new Spot(12,12,"wp"), new Spot(12,13,"wp"), new Spot(12,14,"wp"), new Spot(12,15,"wp"),],
  // row 13
  [new Spot(13,0,"wp"),  new Spot(13,1,"wp"),  new Spot(13,2,"wp"),  new Spot(13,3,"wp"),
   new Spot(13,4,"wp"),  new Spot(13,5,"wp"),  new Spot(13,6,"wp"),  new Spot(13,7,"wp"),
   new Spot(13,8,"wp"),  new Spot(13,9,"wp"),  new Spot(13,10,"wp"), new Spot(13,11,"wp"),
   new Spot(13,12,"wp"), new Spot(13,13,"wp"), new Spot(13,14,"wp"), new Spot(13,15,"wp"),],
  // row 14
  [new Spot(14,0,"wr"),  new Spot(14,1,"wr"),  new Spot(14,2,"wn"),  new Spot(14,3,"wn"),
   new Spot(14,4,"wb"),  new Spot(14,5,"wb"),  new Spot(14,6,"wq"),  new Spot(14,7,"wq"),
   new Spot(14,8,"wq"),  new Spot(14,9,"wq"),  new Spot(14,10,"wb"), new Spot(14,11,"wb"),
   new Spot(14,12,"wn"), new Spot(14,13,"wn"), new Spot(14,14,"wr"), new Spot(14,15,"wr"),],
  // row 15
  [new Spot(15,0,"wr"),  new Spot(15,1,"wr"),  new Spot(15,2,"wn"),  new Spot(15,3,"wn"),
   new Spot(15,4,"wb"),  new Spot(15,5,"wb"),  new Spot(15,6,"wq"),  new Spot(15,7,"wq"),
   new Spot(15,8,"wq"),  new Spot(15,9,"wk"),  new Spot(15,10,"wb"), new Spot(15,11,"wb"),
   new Spot(15,12,"wn"), new Spot(15,13,"wn"), new Spot(15,14,"wr"), new Spot(15,15,"wr"),],
];

var nextBoard2 = [
  // row 0
  [new Spot(0,0,"br"),  new Spot(0,1,"br"),  new Spot(0,2,"bn"),  new Spot(0,3,"bn"),
   new Spot(0,4,"bb"),  new Spot(0,5,"bb"),  new Spot(0,6,"bq"),  new Spot(0,7,"bq"),
   new Spot(0,8,"bk"),  new Spot(0,9,"bq"),  new Spot(0,10,"bb"), new Spot(0,11,"bb"),
   new Spot(0,12,"bn"), new Spot(0,13,"bn"), new Spot(0,14,"br"), new Spot(0,15,"br"),],
  // row 1
  [new Spot(1,0,"br"),  new Spot(1,1,"br"),  new Spot(1,2,"bn"),  new Spot(1,3,"bn"),
   new Spot(1,4,"bb"),  new Spot(1,5,"bb"),  new Spot(1,6,"bq"),  new Spot(1,7,"bq"),
   new Spot(1,8,"bq"),  new Spot(1,9,"bq"),  new Spot(1,10,"bb"), new Spot(1,11,"bb"),
   new Spot(1,12,"bn"), new Spot(1,13,"bn"), new Spot(1,14,"br"), new Spot(1,15,"br"),],
  // row 2
  [new Spot(2,0,"bp"),  new Spot(2,1,"bp"),  new Spot(2,2,"bp"),  new Spot(2,3,"bp"),
   new Spot(2,4,"bp"),  new Spot(2,5,"bp"),  new Spot(2,6,"bp"),  new Spot(2,7,"bp"),
   new Spot(2,8,"bp"),  new Spot(2,9,"bp"),  new Spot(2,10,"bp"), new Spot(2,11,"bp"),
   new Spot(2,12,"bp"), new Spot(2,13,"bp"), new Spot(2,14,"bp"), new Spot(2,15,"bp"),],
  // row 3
  [new Spot(3,0,"bp"),  new Spot(3,1,"bp"),  new Spot(3,2,"bp"),  new Spot(3,3,"bp"),
   new Spot(3,4,"bp"),  new Spot(3,5,"bp"),  new Spot(3,6,"bp"),  new Spot(3,7,"bp"),
   new Spot(3,8,"bp"),  new Spot(3,9,"bp"),  new Spot(3,10,"bp"), new Spot(3,11,"bp"),
   new Spot(3,12,"bp"), new Spot(3,13,"bp"), new Spot(3,14,"bp"), new Spot(3,15,"bp"),],
  // row 4
  [new Spot(4,0,"-="),  new Spot(4,1,"-="),  new Spot(4,2,"-="),  new Spot(4,3,"-="),
   new Spot(4,4,"-="),  new Spot(4,5,"-="),  new Spot(4,6,"-="),  new Spot(4,7,"-="),
   new Spot(4,8,"-="),  new Spot(4,9,"-="),  new Spot(4,10,"-="), new Spot(4,11,"-="),
   new Spot(4,12,"-="), new Spot(4,13,"-="), new Spot(4,14,"-="), new Spot(4,15,"-="),],
  // row 5
  [new Spot(5,0,"-="),  new Spot(5,1,"-="),  new Spot(5,2,"-="),  new Spot(5,3,"-="),
   new Spot(5,4,"-="),  new Spot(5,5,"-="),  new Spot(5,6,"-="),  new Spot(5,7,"-="),
   new Spot(5,8,"-="),  new Spot(5,9,"-="),  new Spot(5,10,"-="), new Spot(5,11,"-="),
   new Spot(5,12,"-="), new Spot(5,13,"-="), new Spot(5,14,"-="), new Spot(5,15,"-="),],
  // row 6
  [new Spot(6,0,"-="),  new Spot(6,1,"-="),  new Spot(6,2,"-="),  new Spot(6,3,"-="),
   new Spot(6,4,"-="),  new Spot(6,5,"-="),  new Spot(6,6,"-="),  new Spot(6,7,"-="),
   new Spot(6,8,"-="),  new Spot(6,9,"-="),  new Spot(6,10,"-="), new Spot(6,11,"-="),
   new Spot(6,12,"-="), new Spot(6,13,"-="), new Spot(6,14,"-="), new Spot(6,15,"-="),],
  // row 7
  [new Spot(7,0,"-="),  new Spot(7,1,"-="),  new Spot(7,2,"-="),  new Spot(7,3,"-="),
   new Spot(7,4,"-="),  new Spot(7,5,"-="),  new Spot(7,6,"-="),  new Spot(7,7,"-="),
   new Spot(7,8,"-="),  new Spot(7,9,"-="),  new Spot(7,10,"-="), new Spot(7,11,"-="),
   new Spot(7,12,"-="), new Spot(7,13,"-="), new Spot(7,14,"-="), new Spot(7,15,"-="),],
  // row 8
  [new Spot(8,0,"-="),  new Spot(8,1,"-="),  new Spot(8,2,"-="),  new Spot(8,3,"-="),
   new Spot(8,4,"-="),  new Spot(8,5,"-="),  new Spot(8,6,"-="),  new Spot(8,7,"-="),
   new Spot(8,8,"-="),  new Spot(8,9,"-="),  new Spot(8,10,"-="), new Spot(8,11,"-="),
   new Spot(8,12,"-="), new Spot(8,13,"-="), new Spot(8,14,"-="), new Spot(8,15,"-="),],
  // row 9
  [new Spot(9,0,"-="),  new Spot(9,1,"-="),  new Spot(9,2,"-="),  new Spot(9,3,"-="),
   new Spot(9,4,"-="),  new Spot(9,5,"-="),  new Spot(9,6,"-="),  new Spot(9,7,"-="),
   new Spot(9,8,"-="),  new Spot(9,9,"-="),  new Spot(9,10,"-="), new Spot(9,11,"-="),
   new Spot(9,12,"-="), new Spot(9,13,"-="), new Spot(9,14,"-="), new Spot(9,15,"-="),],
  // row 10
  [new Spot(10,0,"-="),  new Spot(10,1,"-="),  new Spot(10,2,"-="),  new Spot(10,3,"-="),
   new Spot(10,4,"-="),  new Spot(10,5,"-="),  new Spot(10,6,"-="),  new Spot(10,7,"-="),
   new Spot(10,8,"-="),  new Spot(10,9,"-="),  new Spot(10,10,"-="), new Spot(10,11,"-="),
   new Spot(10,12,"-="), new Spot(10,13,"-="), new Spot(10,14,"-="), new Spot(10,15,"-="),],
  // row 11
  [new Spot(11,0,"-="),  new Spot(11,1,"-="),  new Spot(11,2,"-="),  new Spot(11,3,"-="),
   new Spot(11,4,"-="),  new Spot(11,5,"-="),  new Spot(11,6,"-="),  new Spot(11,7,"-="),
   new Spot(11,8,"-="),  new Spot(11,9,"-="),  new Spot(11,10,"-="), new Spot(11,11,"-="),
   new Spot(11,12,"-="), new Spot(11,13,"-="), new Spot(11,14,"-="), new Spot(11,15,"-="),],
  // row 12
  [new Spot(12,0,"wp"),  new Spot(12,1,"wp"),  new Spot(12,2,"wp"),  new Spot(12,3,"wp"),
   new Spot(12,4,"wp"),  new Spot(12,5,"wp"),  new Spot(12,6,"wp"),  new Spot(12,7,"wp"),
   new Spot(12,8,"wp"),  new Spot(12,9,"wp"),  new Spot(12,10,"wp"), new Spot(12,11,"wp"),
   new Spot(12,12,"wp"), new Spot(12,13,"wp"), new Spot(12,14,"wp"), new Spot(12,15,"wp"),],
  // row 13
  [new Spot(13,0,"wp"),  new Spot(13,1,"wp"),  new Spot(13,2,"wp"),  new Spot(13,3,"wp"),
   new Spot(13,4,"wp"),  new Spot(13,5,"wp"),  new Spot(13,6,"wp"),  new Spot(13,7,"wp"),
   new Spot(13,8,"wp"),  new Spot(13,9,"wp"),  new Spot(13,10,"wp"), new Spot(13,11,"wp"),
   new Spot(13,12,"wp"), new Spot(13,13,"wp"), new Spot(13,14,"wp"), new Spot(13,15,"wp"),],
  // row 14
  [new Spot(14,0,"wr"),  new Spot(14,1,"wr"),  new Spot(14,2,"wn"),  new Spot(14,3,"wn"),
   new Spot(14,4,"wb"),  new Spot(14,5,"wb"),  new Spot(14,6,"wq"),  new Spot(14,7,"wq"),
   new Spot(14,8,"wq"),  new Spot(14,9,"wq"),  new Spot(14,10,"wb"), new Spot(14,11,"wb"),
   new Spot(14,12,"wn"), new Spot(14,13,"wn"), new Spot(14,14,"wr"), new Spot(14,15,"wr"),],
  // row 15
  [new Spot(15,0,"wr"),  new Spot(15,1,"wr"),  new Spot(15,2,"wn"),  new Spot(15,3,"wn"),
   new Spot(15,4,"wb"),  new Spot(15,5,"wb"),  new Spot(15,6,"wq"),  new Spot(15,7,"wq"),
   new Spot(15,8,"wq"),  new Spot(15,9,"wk"),  new Spot(15,10,"wb"), new Spot(15,11,"wb"),
   new Spot(15,12,"wn"), new Spot(15,13,"wn"), new Spot(15,14,"wr"), new Spot(15,15,"wr"),],
];

const boardLocs = Object.fromEntries([...Array(8)].flatMap((_,i) => [...Array(8)].map((_,j) => [`${i},${j}`, [-21+6*j, -21+6*i]])));
const doubleBoardLocs = Object.fromEntries([...Array(16)].flatMap((_,i) => [...Array(16)].map((_,j) => [`${i},${j}`, [-45+6*j, -45+6*i]])));
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
var kingLoc;
var oppKingLoc;

encodeBoard();

var gm = "standard";

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
  get,
  push
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
const localMatchMenuDiv = document.querySelector(".local-menu");

// left side menus navigation
function goToMainMenu() {
  mainMenuDiv.style.display = "flex";
  ingameMenuDiv.style.display = "none";
  matchMenuDiv.style.display = "none";
  localMatchMenuDiv.style.display = "none";
}

function goToIngameMenu() {
  mainMenuDiv.style.display = "none";
  ingameMenuDiv.style.display = "flex";
}

function goToMatchMenu() {
  matchMenuDiv.style.display = "flex";
  ingameMenuDiv.style.display = "none";
}

function goToLocalMatchMenu() {
  localMatchMenuDiv.style.display = "flex";
  ingameMenuDiv.style.display = "none";
}

function leaveMatchMenu() {
  matchMenuDiv.style.display = "none";
  ingameMenuDiv.style.display = "flex";
  board = decodeBoard(defaultBoard);
  gm = ("standard")
  switchBoard("standard-board");
  updateBoardMeshes();
}

function leaveLocalMatch() {
  localMatchMenuDiv.style.display = "none";
  mainMenuDiv.style.display = "flex";
  prevBoard = copy2DArray(board);
  board = decodeBoard(defaultBoard);
  gm = ("standard")
  switchBoard("standard-board");
  updateBoardMeshes();
  startSpin();
}

var email;
// sign up and login
const signupForm = document.querySelector('.signup-login')
signupForm.addEventListener('submit', (e) => {
  e.preventDefault()

  email = signupForm.email.value
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

function admin () {
  if (username == "admin" && email == "admin@carterross.dev") {
    return true;
  } 
  return false;
}

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

// playing offline button
var mode = "online";
const localMultiplayerButton = document.querySelector(".local-multiplayer-button");
localMultiplayerButton.addEventListener("click", () => {
  goToLocalMatchMenu();
  team = "w";
  turn = "w";
  mode = "offline";
  goToTeamCamera(team);
})

// ---------------------------------------------------------------- joining game ----------------------------------------------------

// buttons after logging in
const joinMatchButton = document.querySelector(".join-game");
joinMatchButton.addEventListener("click", (e) => {
  e.preventDefault();
  joinMatch("b");
});

const createMatchButton = document.querySelector(".create-game");
createMatchButton.addEventListener("click", (e) => {
  e.preventDefault();
  createMatch();
});

const leaveMatchButton = document.querySelector(".leave-game");
leaveMatchButton.addEventListener("click", (e) => {
  e.preventDefault();
  prevBoard = copy2DArray(board);
  leaveMatch();
});

const leaveLocalMatchButton = document.querySelector(".leave-local");
leaveLocalMatchButton.addEventListener("click", (e) => {
  e.preventDefault();
  leaveLocalMatch();
});

const resumeAsWhiteButton = document.querySelector(".resume-white");
resumeAsWhiteButton.addEventListener("click", (e) => {
  e.preventDefault();
  joinMatch("w");
});

const resumeAsBlackButton = document.querySelector(".resume-black");
resumeAsBlackButton.addEventListener("click", (e) => {
  e.preventDefault();
  joinMatch("b");
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

function updateGameBoardDatabase() {
  const matchRef = getMatchRef();
  const boardRef = ref(dr, `${matchRef}/board`);
  set(boardRef, encodeBoard())
    .then(() => {
      
    })
    .catch((error) => {
      console.log("Error writing data to Realtime Database:", error.message);
    });
}

// listen for changes in the database of game board
let isMatchRefInitialized = false;
const setupMatchRefListener = () => {
  if (matchRef && !isMatchRefInitialized) {
    onValue(ref(dr, `${matchRef}/board`), (snapshot) =>  {
      console.log("change in game board database reference")
      if (isMatchRefInitialized) {
        if (mode == "offline") {
          prevBoard = copy2DArray(board)
        }
        const boardData = snapshot.val();
        if (boardData != null) {
          if (gm == "double") {
            board2 = decodeBoard(boardData);
          } else {
            board = decodeBoard(boardData);
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
  goToTeamCamera(team);
  opponentName = document.querySelector(".opponent-username-input").value;
  matchRef = getMatchRef();
  setupMatchRefListener();
  initChat();
  var selectElement = document.getElementById('gameModeSelect');
  gm = selectElement.options[selectElement.selectedIndex].value;
  switch (gm) {
    case "standard":
      switchBoard("standard-board");
      break;
    case "queen attack":
      switchBoard("standard-board");
      board = decodeBoard(queenAttackBoard)
      updateGameBoardDatabase();
      break;
    case "lava bridge":
      switchBoard("lava-chess");
      break;
    case "double":
      switchBoard("double-board");
      break;
  }
  createPlanes();
  updateGameBoardDatabase();
  goToMatchMenu();
}

function joinMatch(teamRequest="b") {
  opponentName = document.querySelector(".opponent-username-input").value;
  team = teamRequest;
  goToTeamCamera(team);
  matchRef = getMatchRef();
  get(ref(dr, matchRef)).then((snapshot) => {
    if (!(snapshot.exists())) {
      document.querySelector(".opponent-username-input").value = "game not created";
    } else {
      initChat();
      goToMatchMenu();
      var selectElement = document.getElementById('gameModeSelect');
      gm = selectElement.options[selectElement.selectedIndex].value;
      switch (gm) {
        case "standard":
          switchBoard("standard-board");
          break;
        case "queen attack":
          switchBoard("standard-board");
          break;
        case "lava bridge":
          switchBoard("lava-chess");
          break;
        case "double":
          switchBoard("double-board");
          break;
      }
      createPlanes();

      setupMatchRefListener();
      get(ref(dr, matchRef)).then((snapshot) => {
        if (gm == "double") {
          prevBoard2 = copy2DArray(board2);
          board2 = decodeBoard(snapshot.val());
        } else {
          prevBoard = copy2DArray(board);
          board = decodeBoard(snapshot.val());
        }
      }).catch((error) => {
        console.error(error);
      });
      updateBoardMeshes();
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
  startSpin();
}

// subscribing to auth changes
const unsubAuth = onAuthStateChanged(auth, (user) => {
  console.log('user status changed:', user);
});

goToMainMenu();

function gameOver(winner) {
  prevBoard = copy2DArray(board);
  if (gm == "double") {
    board2 = decodeBoard(defaultBoard2);
  } else if (gm == "queen attack") {
    board = decodeBoard(queenAttackBoard, true);
  } else {
    board = decodeBoard(defaultBoard);
  }
  turn = "w";
  updateBoardMeshes();
  updateGameBoardDatabase();
  sendChatMessage(`${winner} won, game restarted.`, "result", getMatchRef());
}

// ingame messaging
async function sendChatMessage(message, username, gameID) {
  const chatID = push(ref(dr, `${gameID}/chat`)).key;
  const chatData = {
    message: message,
    timestamp: Date.now(),
    username: username,
  };
  await set(ref(dr, `${gameID}/chat/${chatID}`), chatData);
}

function listenForNewMessages(gameID, callback) {
  const chatRef = ref(dr, `${gameID}/chat`);
  onValue(chatRef, (snapshot) => {
    const messages = snapshot.val();
    callback(messages);
  });
}

function initChat() {
  listenForNewMessages(getMatchRef(), (messages) => {
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";

    for (const messageKey in messages) {
      const messageData = messages[messageKey];
      const messageElement = document.createElement("div");
      messageElement.textContent = `${messageData.username}: ${messageData.message}`;
      chatMessages.appendChild(messageElement);
    }
  });

  const chatInput = document.getElementById("chatInput");
  const sendButton = document.getElementById("sendButton");

  sendButton.addEventListener("click", () => {
    const message = chatInput.value;
    if (message) {
      sendChatMessage(message, username, getMatchRef());
      chatInput.value = "";
    }
  });
}

/*-------------------------------------- three js section ---------------------------------------*/

// threejs imports
import * as THREE from 'three';
import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const gltfLoader = new GLTFLoader();
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

// starting camera position
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 20;
camera.position.y = 30;
camera.position.x = 20;
camera.lookAt(new THREE.Vector3(0, 0, 0));

function goToTeamCamera(team) {
  stopSpin();
  if (gm == "double") {
    if (team == "w") {
      camera.position.z = 60;
      camera.position.y = 60;
      if (mode == "online") {
        camera.position.x = -10;
        camera.lookAt(new THREE.Vector3(-10, 0, 0));
      } else {
        camera.position.x = -10;
        camera.lookAt(new THREE.Vector3(-10, 0, 0));
      }
    } else {
      camera.position.z = -60;
      camera.position.y = 60;
      if (mode == "online") {
        camera.position.x = 10;
        camera.lookAt(new THREE.Vector3(10, 0, 0));
      } else {
        camera.position.x = 10;
        camera.lookAt(new THREE.Vector3(10, 0, 0));
      }
    }
  } else {
    if (team == "w") {
      camera.position.z = 30;
      camera.position.y = 30;
      if (mode == "online") {
        camera.position.x = -5;
        camera.lookAt(new THREE.Vector3(-5, 0, 0));
      } else {
        camera.position.x = -5;
        camera.lookAt(new THREE.Vector3(-5, 0, 0));
      }
    } else {
      camera.position.z = -30;
      camera.position.y = 30;
      if (mode == "online") {
        camera.position.x = 5;
        camera.lookAt(new THREE.Vector3(5, 0, 0));
      } else {
        camera.position.x = 5;
        camera.lookAt(new THREE.Vector3(5, 0, 0));
      }
    }
  }
}

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

function updateBoardMeshes(op="") {

  resetPlanes();

  if (gm == "double") {
    if (op == "gameOver") {
      prevBoard2 = copy2DArray(board2);
    }
    kingLoc = findKing(team);
    oppKingLoc = findKing(opp[team]);
    if (board2[kingLoc[0]][kingLoc[1]].isCheck()) {
      inCheckLoc = [kingLoc[0], kingLoc[1]];
      inCheck = true;
      highlightPlane(kingLoc[0], kingLoc[1], "red");
      if (board2[kingLoc[0]][kingLoc[1]].findMoves().length === 0) {
        gameOver(opp[team]);
      }
    } else {
      inCheck = false;
    }
  } else {
    if (op == "gameOver") {
      prevBoard = copy2DArray(board);
    }
    kingLoc = findKing(team);
    oppKingLoc = findKing(opp[team]);
    if (board[kingLoc[0]][kingLoc[1]].isCheck()) {
      inCheckLoc = [kingLoc[0], kingLoc[1]];
      inCheck = true;
      highlightPlane(kingLoc[0], kingLoc[1], "red");
      if (board[kingLoc[0]][kingLoc[1]].findMoves().length === 0) {
        gameOver(opp[team]);
      }
    } else {
      inCheck = false;
    }
  }

  if (gm == "double") {
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        for (let i = 0; i < meshes.length; i++) {
          if (meshes[i].r == r && meshes[i].c == c && board2[r][c].id != meshes[i].piece) {
            meshes[i].removePiece();
            meshes.splice(i, 1);
          }
        }
      }
    }

    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        if (prevBoard2[r][c].id != board2[r][c].id) {
          const pieceKey = board2[r][c].team + board2[r][c].piece;
          const modelPath = pieceModels[pieceKey];       
            if(pieceKey == "-=") {
            break;
          }
          gltfLoader.load(modelPath, function(gltf) {
            const model = gltf.scene;
            const scaleFactor = 0.5;
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
            model.position.set((c - 7.5) * gridSquareSize, 1.25, (r - 7.5) * gridSquareSize);
            model.userData.index = { r, c };
            const piece = new piece3d(r, c, model, pieceKey);
            meshes.push(piece);
            scene.add(model);
          }, undefined, function(error) {
            console.error(error);
          });
        }
      }
    }
  } else {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        for (let i = 0; i < meshes.length; i++) {
          if (meshes[i].r == r && meshes[i].c == c && board[r][c].id != meshes[i].piece) {
            meshes[i].removePiece();
            meshes.splice(i, 1);
          }
        }
      }
    }

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (prevBoard[r][c].id != board[r][c].id) {
          const pieceKey = board[r][c].team + board[r][c].piece;
          const modelPath = pieceModels[pieceKey];       
            if(pieceKey == "-=") {
            break;
          }
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
    }
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
  if (gm == "double") {
    for (let i = 0; i < 16;i++) {
      for (let j = 0; j < 16; j++) {
        if (board2[i][j].isCheck() && board2[i][j].piece == "k") {
          highlightPlane(i,j,"red")
        }
        else if (planesArray[i][j].userData.defaultColor == "b") {
          planesArray[i][j].material.color.set(0x000000);
        } else {
          planesArray[i][j].material.color.set(0xffffff);
        }
      }
    }
  } else {
    for (let i = 0; i < 8;i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j].isCheck() && board[i][j].piece == "k") {
          highlightPlane(i,j,"red")
        }
        else if (planesArray[i][j].userData.defaultColor == "b") {
          planesArray[i][j].material.color.set(0x000000);
        } else {
          planesArray[i][j].material.color.set(0xffffff);
        }
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
        if (gm == "double") {
          if ((board2[r][c].team == team && turn == team)) {
            if (board2[r][c].team != "-") {
              resetPlanes();
              availableMoves = board2[r][c].findMoves();
              highlightMoves(availableMoves);
              rSelected = r;
              cSelected = c;
              state = "selected";
            }
          }
        } else {
          if ((board[r][c].team == team && turn == team)) {
            if (board[r][c].team != "-") {
              resetPlanes();
              availableMoves = board[r][c].findMoves();
              highlightMoves(availableMoves);
              rSelected = r;
              cSelected = c;
              state = "selected";
            }
          }
        }
      } else if (state == "selected") {
        for (let i = 0; i < availableMoves.length; i++) {
          if (availableMoves[i][0] == r && availableMoves[i][1] == c) {
            if (gm == "double") {
              prevBoard2 = copy2DArray(board2);
              if (board2[rSelected][cSelected].id == "wp" && r == 0) {
                board2[r][c] = new Spot(r, c, "wq");
              } else if (board2[rSelected][cSelected].id == "bp" && r == 15) {
                board2[r][c] = new Spot(r, c, "bq");
              } else {
                board2[r][c] = new Spot(r, c, board2[rSelected][cSelected].id);
              }
              board2[rSelected][cSelected] = new Spot(rSelected, cSelected, "-=");
            } else {
              prevBoard = copy2DArray(board);
              if (board[rSelected][cSelected].id == "wp" && r == 0) {
                board[r][c] = new Spot(r, c, "wq");
              } else if (board[rSelected][cSelected].id == "bp" && r == 7) {
                board[r][c] = new Spot(r, c, "bq");
              } else {
                board[r][c] = new Spot(r, c, board[rSelected][cSelected].id);
              }
              board[rSelected][cSelected] = new Spot(rSelected, cSelected, "-=");
            }
            scene.remove();
            log_board();
            encodedBoard = encodeBoard();
            if (mode == "online") {
              updateGameBoardDatabase();
            }
            state = "unselected";
            resetPlanes();
            if (mode == "offline") {
              team = opp[team];
              goToTeamCamera(team);
              turn = team;
              updateBoardMeshes();
            }
          }
        }
        state = "unselected";
      }
      /* ----------------------------------------------------------------------------------------------------------------------------------------------*/
    } else {

    }
  }
}

// creating planes that go on top of game board
var planesArray = Array(16).fill().map(() => Array(16).fill(null));;
function createPlanes() {
  for (let row of planesArray) {
    for (let plane of row) {
        if (plane) {
            scene.remove(plane);
        }
    }
  }
  if (gm == "double") {
    var altCounter = 1;
    var rayPlaneColor = 0xffffff;
    for(let r = 0; r < 16; r++) {
      let row = [];
      altCounter *= -1;
      for(let c = 0; c < 16; c++) {
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
        planeMesh.position.set((c - 7.5) * gridSquareSize, 1.25, (r - 7.5) * gridSquareSize);
        planeMesh.userData.index = { r, c };
        renderer.domElement.addEventListener('click', onCanvasClick);
        scene.add(planeMesh);
        altCounter *= -1;
        planesArray[r][c] = planeMesh;
      }
    }
  } else {
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
  }
}
createPlanes()

// ambient scene light
/*
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight);
*/

function rgbToHex(r, g, b) {
  var redHex = r.toString(16).padStart(2, '0');
  var greenHex = g.toString(16).padStart(2, '0');
  var blueHex = b.toString(16).padStart(2, '0');
  return parseInt(redHex + greenHex + blueHex, 16);
}

// background
let backgrounds = {
  "space clouds": "space_clouds.jpg", 
  "mountain": "mountain.jpg",
  "falling lights": "falling_lights.jpg",
  "white": "white_background.jpeg",
  "night sky": "night_sky.jpg",
  "nebula": "nebula.jpg",
  "future_abstract": "future_abstract.jpg",
  "green blue nebula": "green_blue_nebula.jpg",
  "gold_abstract": "gold_abstract.jpg",
  "colors": "colors.jpg",
}
let keys = Object.keys(backgrounds);
let currentBackgroundIndex = 9;

// Set the initial background
let background_texture = new THREE.TextureLoader().load(backgrounds[keys[currentBackgroundIndex]]);
scene.background = background_texture;

// Listen to keydown event
window.addEventListener('keydown', function(event) {
  if (event.key === 'q') {
    console.log(encodeBoard());
  } else if (event.key === 't') {
    console.log(`turn: ${turn} | team: ${team}`);
  } else if (event.key == 'b') {
    console.log("board:");
    console.log(board);
  } else if (event.key == 'v') {
    console.log("board2:");
    console.log(board2);
  }
  switch (event.key) {
    case 'ArrowUp':
      currentBackgroundIndex++;
      if (currentBackgroundIndex >= keys.length) {
        currentBackgroundIndex = 0;
      }
      break;
    case 'ArrowDown':
      currentBackgroundIndex--;
      if (currentBackgroundIndex < 0) {
        currentBackgroundIndex = keys.length - 1;
      }
      break;
  }
  let newBackgroundTexture = new THREE.TextureLoader().load(backgrounds[keys[currentBackgroundIndex]]);
  scene.background = newBackgroundTexture;
});


// chess board
var model;
var pointLights = [];
gltfLoader.load("chess_board/standard-board.gltf", function(gltf) {
  model = gltf.scene;
  scene.add(model);
  model.position.set(0,0,0)
}, undefined, function(error) {
  console.error(error);
});
addPointLight(0xffffff, 3, 80, new THREE.Vector3(30, 25, 0));
addPointLight(0xffffff, 3, 80, new THREE.Vector3(-30, 25, 0));
addPointLight(0xffffff, 3, 80, new THREE.Vector3(0, 25, 30));
addPointLight(0xffffff, 3, 80, new THREE.Vector3(0, 25, -30));

function switchBoard(name) {
  scene.remove(model);
  clearPointLights();
  gltfLoader.load(`chess_board/${name}.gltf`, function(gltf) {
    model = gltf.scene;
    scene.add(model);
    model.position.set(0,0,0)
  }, undefined, function(error) {
    console.error(error);
  });
  if (name == "double-board") {
    addPointLight(0xffffff, 3, 160, new THREE.Vector3(60, 25, 0));
    addPointLight(0xffffff, 3, 160, new THREE.Vector3(-60, 25, 0));
    addPointLight(0xffffff, 3, 160, new THREE.Vector3(0, 25, 60));
    addPointLight(0xffffff, 3, 160, new THREE.Vector3(0, 25, -60));
  } else {
    addPointLight(0xffffff, 3, 80, new THREE.Vector3(30, 25, 0));
    addPointLight(0xffffff, 3, 80, new THREE.Vector3(-30, 25, 0));
    addPointLight(0xffffff, 3, 80, new THREE.Vector3(0, 25, 30));
    addPointLight(0xffffff, 3, 80, new THREE.Vector3(0, 25, -30));
  }
}

// directional light
function addPointLight(color, intensity, distance, position) {
  const pointLight = new THREE.PointLight(color, intensity, distance);
  pointLight.position.set(position.x, position.y, position.z);
  pointLights.push(pointLight);
  scene.add(pointLight);
}
function clearPointLights() {
  for (var light of pointLights) {
    scene.remove(light);
  }
  pointLights = [];
}

updateBoardMeshes(decodeBoard(encodeBoard()));

// main loop
let spin = false;
let angle = 0;
let radius = 40;
function stopSpin() {
  spin = false;
}
function startSpin() {
  spin = true;
  camera.position.x = 0;
  camera.position.z = 0;
  camera.position.y = 7;
}
startSpin();
function animate() {
  
  if (spin) {

    angle += 0.003;
    camera.lookAt(new THREE.Vector3(radius * Math.sin(angle), 10, radius * Math.cos(angle)));

  }
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);