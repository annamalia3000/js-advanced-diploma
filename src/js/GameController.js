import { themes } from './themes';
import { generateTeam } from './generators';
import GamePlay from './GamePlay';
import GameState from './GameState'; // Исправлено название импорта
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
    this.stateService = stateService;
    this.selectedPlayerIndex = null;
    this.selectedEnemyIndex = null;
    this.validBoardIndex = null;
    this.validMoves = [];
    this.activePlayer = 'player';
    this.selectedTheme = themes.prairie;
    this.gameState = new GameState(); 
    this.maxScore = 0; 
    this.isGameFinished = false;
  }

  async init() {
    this.loadGameState();
    this.gamePlay.drawUi(this.selectedTheme);

    if (!this.characters.length) {
      const playerTypes = [Bowman, Swordsman, Magician];
      const enemyTypes = [Daemon, Undead, Vampire];
  
      const playerTeam = generateTeam(playerTypes, 1, 1).toArray();
      const enemyTeam = generateTeam(enemyTypes, 1, 1).toArray();
  
      const playerPositions = this.generatePositions(0, 1, 8);
      const enemyPositions = this.generatePositions(6, 7, 8);
  
      const positionedPlayer = playerTeam.map((character, index) => new PositionedCharacter(character, playerPositions[index]));
      const positionedEnemy = enemyTeam.map((character, index) => new PositionedCharacter(character, enemyPositions[index]));

      this.characters = [...positionedPlayer, ...positionedEnemy];
  
    }

    this.gamePlay.redrawPositions(this.characters);

    this.gamePlay.addCellEnterListener((index) => this.onCellEnter(index));
    this.gamePlay.addCellLeaveListener((index) => this.onCellLeave(index));
    this.gamePlay.addCellClickListener((index) => this.onCellClick(index));

    this.gamePlay.addNewGameListener(() => this.startNewGame());
  }

  loadGameState() {
    try {
      const state = this.stateService.load();
      if (state) {
        this.gameState = GameState.from(state.gameState);
        this.maxScore = state.maxScore;
        this.characters = this.gameState.characters.map(charData => new PositionedCharacter(
          new (this.getCharacterClass(charData.character.type))(charData.character),
          charData.position
        ));
        this.selectedTheme = this.gameState.theme;
      } else {
        this.gameState = new GameState();
      }
    } catch (e) {
      console.error('Failed to load game state:', e.message);
      this.gameState = new GameState();
    }
  }

  startNewGame() {
    this.gameState = new GameState();
    this.maxScore = Math.max(this.maxScore, this.gameState.maxScore);
    this.characters = null;
    this.isGameFinished = false;
    this.init();
  }

  saveGameState() {
    const characters = this.characters.map((char) => ({ character: char.character, position: char.position })); 
    this.stateService.save({
      gameState: this.gameState,
      maxScore: this.maxScore,
      characters: characters 
    });
    console.log('save')
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
      if (position2 < boardSize ** 2 && !positions.has(position2)) { 
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
    if (this.isGameFinished) {
      return;
    }
  
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
          await this.handleEnemyClick(index, characterType);
        }
      } else {
        this.handlePlayerCharacterSelection(index, characterType);
      }
    } else {
      this.handleEmptyCellClick(index);
    }
  
    this.saveGameState();
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

  async handleEnemyClick(index) {
    if (this.selectedPlayerIndex !== null && this.validMoves.includes(index)) {
      const attacker = this.characters.find(c => c.position === this.selectedPlayerIndex).character;
      const targetCharacter = this.characters.find(c => c.position === index).character;

      const damage = Math.max(attacker.attack - targetCharacter.defence, attacker.attack * 0.1);

      await this.gamePlay.showDamage(index, damage);

      targetCharacter.health -= damage;
      if (targetCharacter.health <= 0) {
        this.characters = this.characters.filter(c => c.position !== index);
      }
        
      this.deselectAllCells();
      this.gamePlay.redrawPositions(this.characters);
      this.selectedPlayerIndex = null;

      await this.switchActivePlayer();

      if (this.activePlayer === "enemy") {
        await this.enemyAction();
      }

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

  async handleEmptyCellClick(index) {
    if (this.selectedPlayerIndex !== null && this.validMoves.includes(index)) {
      const character = this.characters.find(c => c.position === this.selectedPlayerIndex);
      character.position = index;

      this.gamePlay.redrawPositions(this.characters);
      this.selectedPlayerIndex = null;

      await this.switchActivePlayer();

      if (this.activePlayer === "enemy") {
        await this.enemyAction();
      }

    } else {
      GamePlay.showError('Invalid move!');
    }
    this.deselectAllCells();

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
    if (this.selectedPlayerIndex !== null && this.validMoves && this.validMoves.includes(index)) {
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

  async enemyAction() {
    const enemyCharacters = this.characters.filter(c => this.isEnemyCharacter(c.character.type));
    const playerCharacters = this.characters.filter(c => this.isPlayerCharacter(c.character.type));
  
    if (enemyCharacters.length === 0) {
      this.levelUpAllPlayers(playerCharacters);
    } else if (enemyCharacters.length === 1) {
      const enemy = enemyCharacters[0];
      let closestPlayer = null;
      let minDistance = Infinity;
  
      playerCharacters.forEach(player => {
        const distance = this.calculateDistance(enemy.position, player.position);
  
        if (distance < minDistance) {
          minDistance = distance;
          closestPlayer = player;
        }
      });
  
      if (minDistance <= this.getCharacterRange(enemy.character.type)) {
        await this.attack(enemy, closestPlayer);
      } else {
        this.moveToClosest(enemy, closestPlayer);
      }
    } else {
      enemyCharacters.forEach(enemy => {
        let closestPlayer = null;
        let minDistance = Infinity;
  
        playerCharacters.forEach(player => {
          const distance = this.calculateDistance(enemy.position, player.position);
  
          if (distance < minDistance) {
            minDistance = distance;
            closestPlayer = player;
          }
        });
  
        if (minDistance <= this.getCharacterRange(enemy.character.type)) {
          this.attack(enemy, closestPlayer);
        } else {
          this.moveToClosest(enemy, closestPlayer);
        }
      });
    }
  
    this.gamePlay.redrawPositions(this.characters);
  
    await this.switchActivePlayer();
  }
  
  moveToClosest(attacker, target) {
    const possibleMoves = this.calculateValidMoves(attacker.position, 1);
  
    let bestMove = attacker.position;
    let minDistance = this.calculateDistance(attacker.position, target.position);
  
    possibleMoves.forEach((move) => {
      
      if (!this.characters.some(c => c.position === move)) {
        const distance = this.calculateDistance(move, target.position);
        if (distance < minDistance) {
          minDistance = distance;
          bestMove = move;
        }
      }
    });
  
    attacker.position = bestMove;
  }

  async attack(attacker, target) {
    const damage = Math.max(attacker.character.attack - target.character.defence, attacker.character.attack * 0.1);

    await this.gamePlay.showDamage(target.position, damage);
    target.character.health -= damage;

    if (target.character.health <= 0) {
      this.characters = this.characters.filter(c => c.position !== target.position);
      const playerCharacters = this.characters.filter(c => this.isPlayerCharacter(c.character.type));
      if (playerCharacters.length === 0) {
        GamePlay.showError('Game over!');
        this.isGameFinished = true;
        this.startNewGame();
      }
    }
  }

  calculateDistance(attackerPosition, targetPosition) {
    const boardSize = this.gamePlay.boardSize;
    const attackerRow = Math.floor(attackerPosition / boardSize);
    const attackerCol = attackerPosition % boardSize;
    const targetRow = Math.floor(targetPosition / boardSize);
    const targetCol = targetPosition % boardSize;

    return Math.abs(attackerRow - targetRow) + Math.abs(attackerCol - targetCol);
  }

  async switchActivePlayer() {
    this.activePlayer = this.activePlayer === 'player' ? 'enemy' : 'player';
  }

  levelUp(character) {
    character.level += 1;
    character.attack = Math.max(character.attack, Math.round(character.attack * (1.8 - character.health / 100)));
    character.defence = Math.max(character.defence, Math.round(character.defence * (1.8 - character.health / 100)));
    character.health += 80;

    if (character.health > 100) {
      character.health = 100;
    }
  }

  levelUpAllPlayers(players) {
    players.forEach(player => this.levelUp(player.character));

    const enemyTypes = [Daemon, Undead, Vampire];

    const newEnemyTeam = generateTeam(enemyTypes, 1, this.gameState.level + 1).toArray();

    const playerPositions = this.characters.filter(c => this.isPlayerCharacter(c.character.type)).map(c => c.position);
    const newEnemyPositions = this.generatePositions(6, 7, 8).filter(pos => !playerPositions.includes(pos));

    const newEnemies = newEnemyTeam.map((character, index) => new PositionedCharacter(character, newEnemyPositions[index]));

    this.characters = [...this.characters.filter(c => this.isPlayerCharacter(c.character.type)), ...newEnemies];
  
    this.gameState.level += 1;

    if (this.selectedTheme === themes.prairie) {
      this.selectedTheme = themes.desert;
    } else if (this.selectedTheme === themes.desert) {
      this.selectedTheme = themes.arctic;
    } else if (this.selectedTheme === themes.arctic) {
      this.selectedTheme = themes.mountain;
    } else if (this.selectedTheme === themes.mountain) {
      this.selectedTheme = themes.prairie;
    } else {
      this.selectedTheme === themes.prairie;
    }

    this.gamePlay.drawUi(this.selectedTheme);
  }
}

