import { selectedTheme } from './themes';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(selectedTheme);

    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Daemon, Undead, Vampire];

    const playerTeam = generateTeam(playerTypes, 3, 4).toArray();
    const enemyTeam = generateTeam(enemyTypes, 3, 4).toArray();

    const playerPositions = this.generatePositions(0, 1, 8);
    const enemyPositions = this.generatePositions(6, 7, 8);

    const positionedPlayer = playerTeam.map((character, index) => new PositionedCharacter(character, playerPositions[index]));
    const positionedEnemy = enemyTeam.map((character, index) => new PositionedCharacter(character, enemyPositions[index]));

    this.gamePlay.redrawPositions([...positionedPlayer, ...positionedEnemy]);

    this.gamePlay.addCellEnterListener((index) => this.onCellEnter(index));
    this.gamePlay.addCellLeaveListener((index) => this.onCellLeave(index));
    this.gamePlay.addCellClickListener((index) => this.onCellClick(index));
  }

  generatePositions(startCol1, startCol2, boardSize) {
    const positions = new Set();

    while (positions.size < boardSize * 2) {
      const row = Math.floor(Math.random() * boardSize);

      const position1 = startCol1 + (row * boardSize);
      if (position1 < boardSize ** 2) {
        positions.add(position1);
      }

      const position2 = startCol2 + (row * boardSize);
      if (position2 < boardSize ** 2) {
        positions.add(position2);
      }
    }

    return [...positions];
  }

  onCellClick(index) {
    console.log(`Clicked on cell index ${index}`);
  }

  onCellEnter(index) {
    const cellEl = this.gamePlay.cells[index];

    const characterEl = cellEl.querySelector('.character');
  if (characterEl) {
    const message = this.getCharacterInfo(characterEl);
    this.gamePlay.showCellTooltip(message, index);
  }
}

getCharacterInfo(characterEl) {
  const level = characterEl.dataset.level;
  const attack = characterEl.dataset.attack;
  const defence = characterEl.dataset.defence;
  const health = characterEl.dataset.health;

  return `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`;
}

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }
}
