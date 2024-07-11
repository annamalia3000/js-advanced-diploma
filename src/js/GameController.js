import { selectedTheme } from './themes';
import { generateTeam } from './generators';
import GamePlay from './GamePlay';
import GameState from './GameState';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = new GameState();
    this.selectedPlayerIndex = null;
    this.selectedEnemyIndex = null;
    this.validBoardIndex = null;
    this.validMoves = [];
    this.activePlayer = 'player';
  }

  init() {
    this.gamePlay.drawUi(selectedTheme);

    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Daemon, Undead, Vampire];

    const playerTeam = generateTeam(playerTypes, 3, 1).toArray();
    const enemyTeam = generateTeam(enemyTypes, 3, 1).toArray();

    const playerPositions = this.generatePositions(0, 1, 8);
    const enemyPositions = this.generatePositions(6, 7, 8);

    const positionedPlayer = playerTeam.map((character, index) => new PositionedCharacter(character, playerPositions[index]));
    const positionedEnemy = enemyTeam.map((character, index) => new PositionedCharacter(character, enemyPositions[index]));

    this.characters = [...positionedPlayer, ...positionedEnemy];
    this.gamePlay.redrawPositions(this.characters);


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

  getCharacterInfo(characterEl) {
    const level = characterEl.dataset.level;
    const attack = characterEl.dataset.attack;
    const defence = characterEl.dataset.defence;
    const health = characterEl.dataset.health;
  
    return `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`;
  }
  
  calculateValidMoves(index, range) {
    const boardSize = this.gamePlay.boardSize;
    const moves = [];
  
    const currentRow = Math.floor(index / boardSize);
    const currentCol = index % boardSize;

    for (let rowOffset = -range; rowOffset <= range; rowOffset++) {
      for (let colOffset = -range; colOffset <= range; colOffset++) {
        const newRow = currentRow + rowOffset;
        const newCol = currentCol + colOffset;
  
        if (
          newRow >= 0 && newRow < boardSize &&
          newCol >= 0 && newCol < boardSize &&
          (rowOffset !== 0 || colOffset !== 0) 
          
        ) {
          const newIndex = newRow * boardSize + newCol;
          moves.push(newIndex);
        }
      }
    }
  
    return moves;
  }

  getCharacterRange(type) {
    switch (type) {
      case 'swordsman':
      case 'undead':
        return 4;
      case 'bowman':
      case 'vampire':
        return 2;
      case 'magician':
      case 'daemon':
        return 1;
    }
  }

  async onCellClick(index) {
    const cellEl = this.gamePlay.cells[index];
    const characterEl = cellEl.querySelector('.character');
  
    if (characterEl) {
      const characterType = characterEl.classList[1];
      if (this.isEnemyCharacter(characterType)) {
        if (this.selectedPlayerIndex === null) {
          GamePlay.showError('Choose your character!');
          this.deselectAllCells();
          this.selectedPlayerIndex = null;
        } else {
          this.handleEnemyClick(index, characterType);
        }
      } else {
        this.handlePlayerCharacterSelection(index, characterType);
      }
    } else {
      this.handleEmptyCellClick(index);
    }
  }
  
  isEnemyCharacter(characterType) {
    const enemyTypes = ['undead', 'daemon', 'vampire'];
    return enemyTypes.includes(characterType);
  }
  
  isPlayerCharacter(characterType) {
    const playerTypes = ['bowman', 'swordsman', 'magician'];
    return playerTypes.includes(characterType);
  }
  
  deselectAllCells() {
    this.gamePlay.cells.forEach((cell, index) => {
      if (cell.classList.contains('selected')) {
        this.gamePlay.deselectCell(index);
      }
    });
  }
  
  async handleEnemyClick(index, characterType) {
    if (this.selectedPlayerIndex !== null && this.validMoves.includes(index)) {
      const attacker = this.characters.find(c => c.position === this.selectedPlayerIndex).character;
      const targetCharacter = this.characters.find(c => c.position === index).character;
      const target = this.characters.find(c => c.position === index);
  
      const damage = Math.max(attacker.attack - targetCharacter.defence, attacker.attack * 0.1);
  
      await this.gamePlay.showDamage(index, damage);
  
      targetCharacter.health -= damage;
      if (targetCharacter.health <= 0) {
        this.characters = this.characters.filter(c => c.position !== index);
      }
  
      this.gamePlay.redrawPositions(this.characters);
      this.stateService.switchActivePlayer();
      this.activePlayer = this.stateService.activePlayer;
      this.deselectAllCells();
      this.selectedPlayerIndex = null;
    } else {
      GamePlay.showError('Enemy out of attack range!');
    }
  }
  
  handlePlayerCharacterSelection(index, characterType) {
    if (this.isPlayerCharacter(characterType)) {
      this.deselectAllCells();
      this.gamePlay.selectCell(index, 'yellow');
      this.selectedPlayerIndex = index;
      const range = this.getCharacterRange(characterType);
      this.validMoves = this.calculateValidMoves(index, range);
    }
  }
  
  handleEmptyCellClick(index) {
    if (this.selectedPlayerIndex !== null && this.validMoves.includes(index)) {
      const character = this.characters.find(c => c.position === this.selectedPlayerIndex);
      character.position = index;
  
      this.gamePlay.redrawPositions(this.characters);
      this.stateService.switchActivePlayer();
      this.activePlayer = this.stateService.activePlayer;
      this.deselectAllCells();
      this.selectedPlayerIndex = null;
    } else {
      GamePlay.showError('Invalid move!');
    }
  }
  
  deselectAllCells() {
    this.gamePlay.cells.forEach((cell, index) => {
      if (cell.classList.contains('selected')) {
        this.gamePlay.deselectCell(index);
      }
    });
  }

  onCellEnter(index) {
    const cellEl = this.gamePlay.cells[index];
    const characterEl = cellEl.querySelector('.character');
  
    if (characterEl) {
      this.handleCharacterEnter(index, characterEl);
    } else {
      this.handleEmptyCellEnter(index);
    }
  }
  
  handleCharacterEnter(index, characterEl) {
    const characterType = characterEl.classList[1];
    const message = this.getCharacterInfo(characterEl);
    this.gamePlay.showCellTooltip(message, index);
  
    if (this.isPlayerCharacter(characterType) && this.selectedPlayerIndex !== null) {
      this.gamePlay.setCursor(cursors.pointer);
    } else if (this.isEnemyCharacter(characterType) && this.selectedPlayerIndex !== null && this.validMoves.includes(index)) {
      this.handleEnemyHover(index);
    } else if (this.selectedPlayerIndex !== null) {
      this.gamePlay.setCursor(cursors.notallowed);
    } else {
      this.gamePlay.setCursor(cursors.auto);
    }
  }
  
  handleEmptyCellEnter(index) {
    if (this.validMoves && this.validMoves.includes(index)) {
      this.validBoardIndex = index;
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    } else {
      this.gamePlay.setCursor(cursors.notallowed);
    }
  }
  
  handleEnemyHover(index) {
    this.selectedEnemyIndex = index;
    this.gamePlay.setCursor(cursors.crosshair);
    this.gamePlay.selectCell(index, 'red');
  }
  
  isEnemyCharacter(characterType) {
    const enemyTypes = ['undead', 'daemon', 'vampire'];
    return enemyTypes.includes(characterType);
  }
  
  isPlayerCharacter(characterType) {
    const playerTypes = ['bowman', 'swordsman', 'magician'];
    return playerTypes.includes(characterType);
  }  

  onCellLeave(index) {
    const cellEl = this.gamePlay.cells[index];
    const characterEl = cellEl.querySelector('.character');

    this.gamePlay.hideCellTooltip(index);
    
    if (!characterEl && this.validBoardIndex === index) {
      this.gamePlay.deselectCell(index);
      this.validBoardIndex = null;
    }

    if (characterEl && this.selectedEnemyIndex === index) {
      this.gamePlay.deselectCell(index);
      this.selectedEnemyIndex = null;
    }
  }
}
