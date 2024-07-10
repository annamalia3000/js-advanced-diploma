import GameController from '../GameController';
import GamePlay from '../GamePlay';

jest.mock('../GamePlay', () => {
    return jest.fn().mockImplementation(() => {
      return {
        drawUi: jest.fn(),
        addCellEnterListener: jest.fn(),
        addCellLeaveListener: jest.fn(),
        showCellTooltip: jest.fn(),
        hideCellTooltip: jest.fn(),
        boardEl: {
          children: [],
        },
      };
    });
  });  

test('getCharacterInfo should return information about character', () => {
    const gamePlay = new GamePlay();
  const stateService = {}; 
  const gameController = new GameController(gamePlay, stateService);

  const characterEl = {
    dataset: {
      level: '1',
      attack: '10',
      defence: '40',
      health: '50',
    },
  };

  const result = gameController.getCharacterInfo(characterEl);

  expect(result).toBe('🎖1 ⚔10 🛡40 ❤50');

});
