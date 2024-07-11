import GameController from '../GameController';
import GamePlay from '../GamePlay';

let gameController;

beforeEach(() => {
  const gamePlay = new GamePlay();
  const stateService = {};
  gameController = new GameController(gamePlay, stateService);
  gamePlay.boardSize = 8; 
});

test ('should return character range 4', () => {
  expect(gameController.getCharacterRange('swordsman')).toBe(4);
  expect(gameController.getCharacterRange('undead')).toBe(4);
});

test ('should return character range 2', () => {
    expect(gameController.getCharacterRange('bowman')).toBe(2);
    expect(gameController.getCharacterRange('vampire')).toBe(2);
  });

  test ('should return character range 1', () => {
    expect(gameController.getCharacterRange('magician')).toBe(1);
    expect(gameController.getCharacterRange('daemon')).toBe(1);
  });

  test('should calculate valid moves for a character with the range 1', () => {
    let index = 19; 
    let range = 1; 
    let expectedMoves = [ 10, 11, 12, 18, 20, 26, 27, 28 ];
    let validMoves = gameController.calculateValidMoves(index, range);
    expect(validMoves.sort()).toEqual(expectedMoves.sort());
  })

  test('should calculate valid moves for a character with the range 2 and coner position', () => {
    let index = 0; 
    let range = 2; 
    let expectedMoves = [ 1, 2, 8, 9, 10, 16, 17, 18 ];
    let validMoves = gameController.calculateValidMoves(index, range);
    expect(validMoves.sort()).toEqual(expectedMoves.sort());
  })

  test('should calculate valid moves for a character with the range 4 and central', () => {
    let index = 27; 
    let range = 4; 
    let expectedMoves = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63
    ];
    let validMoves = gameController.calculateValidMoves(index, range);
    expect(validMoves.sort()).toEqual(expectedMoves.sort());
  })

