/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/js/utils.js
/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
function calcTileType(index, boardSize) {
  const topRow = 0;
  const bottomRow = boardSize * (boardSize - 1);
  const leftColumn = index % boardSize === 0;
  const rightColumn = index % boardSize === boardSize - 1;
  if (index === topRow) {
    return 'top-left';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  }
  if (index === bottomRow) {
    return 'bottom-left';
  }
  if (index === boardSize * boardSize - 1) {
    return 'bottom-right';
  }
  if (index > topRow && index < boardSize - 1) {
    return 'top';
  }
  if (index > bottomRow && boardSize * boardSize - 1) {
    return 'bottom';
  }
  if (leftColumn && index !== topRow && index !== bottomRow) {
    return 'left';
  }
  if (rightColumn && index !== boardSize - 1 && index !== boardSize * boardSize - 1) {
    return 'right';
  }
  return 'center';
}
function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }
  if (health < 50) {
    return 'normal';
  }
  return 'high';
}
;// CONCATENATED MODULE: ./src/js/GamePlay.js

class GamePlay {
  constructor() {
    this.boardSize = 8;
    this.container = null;
    this.boardEl = null;
    this.cells = [];
    this.cellClickListeners = [];
    this.cellEnterListeners = [];
    this.cellLeaveListeners = [];
    this.newGameListeners = [];
    this.saveGameListeners = [];
    this.loadGameListeners = [];
  }
  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }
    this.container = container;
  }

  /**
  * Draws boardEl with specific theme
  *
  * @param theme
  */
  drawUi(theme) {
    this.checkBinding();
    this.container.innerHTML = `
      <div class="controls">
        <button data-id="action-restart" class="btn">New Game</button>
        <button data-id="action-save" class="btn">Save Game</button>
        <button data-id="action-load" class="btn">Load Game</button>
      </div>
      <div class="board-container">
        <div data-id="board" class="board"></div>
      </div>
    `;
    this.newGameEl = this.container.querySelector('[data-id=action-restart]');
    this.saveGameEl = this.container.querySelector('[data-id=action-save]');
    this.loadGameEl = this.container.querySelector('[data-id=action-load]');
    this.newGameEl.addEventListener('click', event => this.onNewGameClick(event));
    this.saveGameEl.addEventListener('click', event => this.onSaveGameClick(event));
    this.loadGameEl.addEventListener('click', event => this.onLoadGameClick(event));
    this.boardEl = this.container.querySelector('[data-id=board]');
    this.boardEl.classList.add(theme);
    for (let i = 0; i < this.boardSize ** 2; i += 1) {
      const cellEl = document.createElement('div');
      cellEl.classList.add('cell', 'map-tile', `map-tile-${calcTileType(i, this.boardSize)}`);
      cellEl.addEventListener('mouseenter', event => this.onCellEnter(event));
      cellEl.addEventListener('mouseleave', event => this.onCellLeave(event));
      cellEl.addEventListener('click', event => this.onCellClick(event));
      this.boardEl.appendChild(cellEl);
    }
    this.cells = Array.from(this.boardEl.children);
  }

  /**
  * Draws positions (with chars) on boardEl
  *
  * @param positions array of PositionedCharacter objects
  */
  redrawPositions(positions) {
    for (const cell of this.cells) {
      cell.innerHTML = '';
    }
    for (const position of positions) {
      const cellEl = this.boardEl.children[position.position];
      const charEl = document.createElement('div');
      charEl.classList.add('character', position.character.type);
      charEl.dataset.level = position.character.level;
      charEl.dataset.attack = position.character.attack;
      charEl.dataset.defence = position.character.defence;
      charEl.dataset.health = position.character.health;
      const healthEl = document.createElement('div');
      healthEl.classList.add('health-level');
      const healthIndicatorEl = document.createElement('div');
      healthIndicatorEl.classList.add('health-level-indicator', `health-level-indicator-${calcHealthLevel(position.character.health)}`);
      healthIndicatorEl.style.width = `${position.character.health}%`;
      healthEl.appendChild(healthIndicatorEl);
      charEl.appendChild(healthEl);
      cellEl.appendChild(charEl);
    }
  }

  /**
  * Add listener to mouse enter for cell
  *
  * @param callback
  */
  addCellEnterListener(callback) {
    this.cellEnterListeners.push(callback);
  }

  /**
  * Add listener to mouse leave for cell
  *
  * @param callback
  */
  addCellLeaveListener(callback) {
    this.cellLeaveListeners.push(callback);
  }

  /**
  * Add listener to mouse click for cell
  *
  * @param callback
  */
  addCellClickListener(callback) {
    this.cellClickListeners.push(callback);
  }

  /**
  * Add listener to "New Game" button click
  *
  * @param callback
  */
  addNewGameListener(callback) {
    this.newGameListeners.push(callback);
  }

  /**
  * Add listener to "Save Game" button click
  *
  * @param callback
  */
  addSaveGameListener(callback) {
    this.saveGameListeners.push(callback);
  }

  /**
  * Add listener to "Load Game" button click
  *
  * @param callback
  */
  addLoadGameListener(callback) {
    this.loadGameListeners.push(callback);
  }
  onCellEnter(event) {
    event.preventDefault();
    const index = this.cells.indexOf(event.currentTarget);
    this.cellEnterListeners.forEach(o => o.call(null, index));
  }
  onCellLeave(event) {
    event.preventDefault();
    const index = this.cells.indexOf(event.currentTarget);
    this.cellLeaveListeners.forEach(o => o.call(null, index));
  }
  onCellClick(event) {
    const index = this.cells.indexOf(event.currentTarget);
    this.cellClickListeners.forEach(o => o.call(null, index));
  }
  onNewGameClick(event) {
    event.preventDefault();
    this.newGameListeners.forEach(o => o.call(null));
  }
  onSaveGameClick(event) {
    event.preventDefault();
    this.saveGameListeners.forEach(o => o.call(null));
  }
  onLoadGameClick(event) {
    event.preventDefault();
    this.loadGameListeners.forEach(o => o.call(null));
  }
  static showError(message) {
    alert(message);
  }
  static showMessage(message) {
    alert(message);
  }
  selectCell(index, color = 'yellow') {
    this.deselectCell(index);
    this.cells[index].classList.add('selected', `selected-${color}`);
  }
  deselectCell(index) {
    const cell = this.cells[index];
    cell.classList.remove(...Array.from(cell.classList).filter(o => o.startsWith('selected')));
  }
  showCellTooltip(message, index) {
    this.cells[index].title = message;
  }
  hideCellTooltip(index) {
    this.cells[index].title = '';
  }
  showDamage(index, damage) {
    return new Promise(resolve => {
      const cell = this.cells[index];
      const damageEl = document.createElement('span');
      damageEl.textContent = damage;
      damageEl.classList.add('damage');
      cell.appendChild(damageEl);
      damageEl.addEventListener('animationend', () => {
        cell.removeChild(damageEl);
        resolve();
      });
    });
  }
  setCursor(cursor) {
    this.boardEl.style.cursor = cursor;
  }
  checkBinding() {
    if (this.container === null) {
      throw new Error('GamePlay not bind to DOM');
    }
  }
}
;// CONCATENATED MODULE: ./src/js/themes.js
const themes = {
  prairie: 'prairie',
  desert: 'desert',
  arctic: 'arctic',
  mountain: 'mountain'
};

;// CONCATENATED MODULE: ./src/js/Team.js
/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
class Team {
  constructor() {
    this.members = new Set();
  }
  add(character) {
    this.members.add(character);
  }
  toArray() {
    return [...this.members];
  }
}
;// CONCATENATED MODULE: ./src/js/generators.js


/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const RandomType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const level = Math.floor(Math.random() * maxLevel) + 1;
    yield new RandomType(level);
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = new Team();
  const generator = characterGenerator(allowedTypes, maxLevel);
  for (let i = 0; i < characterCount; i++) {
    const character = generator.next().value;
    team.add(character);
  }
  return team;
}
;// CONCATENATED MODULE: ./src/js/GameState.js
class GameState {
  constructor(activePlayer = 'player', level = 1, score = 0, maxScore = 0, characters = [], theme = 'prairie') {
    this.activePlayer = activePlayer;
    this.level = level;
    this.score = score;
    this.maxScore = maxScore;
    this.characters = characters;
    this.theme = theme;
  }
}
;// CONCATENATED MODULE: ./src/js/Character.js
/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
class Character {
  constructor(level, type = 'generic') {
    if (new.target === Character) {
      throw new Error('Cannot instantiate Character');
    }
    this.level = 1;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
  }
}
;// CONCATENATED MODULE: ./src/js/PositionedCharacter.js

class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }
    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }
    this.character = character;
    this.position = position;
  }
}
;// CONCATENATED MODULE: ./src/js/characters/Bowman.js

class Bowman extends Character {
  constructor(level) {
    super(level, 'bowman');
    this.attack = 25;
    this.defence = 25;
  }
}
;// CONCATENATED MODULE: ./src/js/characters/Daemon.js

class Daemon extends Character {
  constructor(level) {
    super(level, 'daemon');
    this.attack = 10;
    this.defence = 10;
  }
}
;// CONCATENATED MODULE: ./src/js/characters/Magician.js

class Magician extends Character {
  constructor(level) {
    super(level, 'magician');
    this.attack = 10;
    this.defence = 40;
  }
}
;// CONCATENATED MODULE: ./src/js/characters/Swordsman.js

class Swordsman extends Character {
  constructor(level) {
    super(level, 'swordsman');
    this.attack = 40;
    this.defence = 10;
  }
}
;// CONCATENATED MODULE: ./src/js/characters/Undead.js

class Undead extends Character {
  constructor(level) {
    super(level, 'undead');
    this.attack = 40;
    this.defence = 10;
  }
}
;// CONCATENATED MODULE: ./src/js/characters/Vampire.js

class Vampire extends Character {
  constructor(level) {
    super(level, 'vampire');
    this.attack = 25;
    this.defence = 25;
  }
}
;// CONCATENATED MODULE: ./src/js/cursors.js
const cursors = {
  auto: 'auto',
  pointer: 'pointer',
  crosshair: 'crosshair',
  notallowed: 'not-allowed'
};
/* harmony default export */ const js_cursors = (cursors);
;// CONCATENATED MODULE: ./src/js/GameController.js












class GameController {
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
  }
  async init() {
    this.loadGame();
    this.gamePlay.drawUi(this.selectedTheme);
    if (!this.characters || this.characters.length === 0) {
      await this.startNewGame();
    }
    this.gamePlay.redrawPositions(this.characters);
    this.gamePlay.addCellEnterListener(index => this.onCellEnter(index));
    this.gamePlay.addCellLeaveListener(index => this.onCellLeave(index));
    this.gamePlay.addCellClickListener(index => this.onCellClick(index));
    this.gamePlay.addNewGameListener(() => this.startNewGame());
    this.gamePlay.addSaveGameListener(() => this.saveGame());
    this.gamePlay.addLoadGameListener(() => this.loadGame());
  }
  loadGame() {
    const savedState = this.stateService.load();
    if (savedState) {
      this.gameState = new GameState(savedState.activePlayer, savedState.level, savedState.score, savedState.maxScore, savedState.characters, savedState.theme);
      this.characters = savedState.characters.map(item => {
        let character;
        switch (item.character.type) {
          case 'bowman':
            character = new Bowman(item.character.level);
            break;
          case 'swordsman':
            character = new Swordsman(item.character.level);
            break;
          case 'magician':
            character = new Magician(item.character.level);
            break;
          case 'daemon':
            character = new Daemon(item.character.level);
            break;
          case 'undead':
            character = new Undead(item.character.level);
            break;
          case 'vampire':
            character = new Vampire(item.character.level);
            break;
          default:
            throw new Error(`Unknown character type: ${item.character.type}`);
        }
        character.attack = item.character.attack;
        character.defence = item.character.defence;
        character.health = item.character.health;
        return new PositionedCharacter(character, item.position);
      });
    } else {
      this.startNewGame();
    }
  }
  async startNewGame() {
    this.gameState = new GameState();
    this.characters = [];
    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Daemon, Undead, Vampire];
    const playerTeam = generateTeam(playerTypes, 1, 1).toArray();
    const enemyTeam = generateTeam(enemyTypes, 1, 1).toArray();
    const playerPositions = this.generatePositions(0, 1, 8);
    const enemyPositions = this.generatePositions(6, 7, 8);
    const positionedPlayer = playerTeam.map((character, index) => new PositionedCharacter(character, playerPositions[index]));
    const positionedEnemy = enemyTeam.map((character, index) => new PositionedCharacter(character, enemyPositions[index]));
    this.characters = [...positionedPlayer, ...positionedEnemy];
    this.gamePlay.redrawPositions(this.characters);
  }
  saveGame() {
    this.gameState.characters = this.characters.map(c => ({
      character: c.character,
      position: c.position
    }));
    this.stateService.save(this.gameState);
    console.log(this.gameState);
  }
  generatePositions(startCol1, startCol2, boardSize) {
    const positions = new Set();
    while (positions.size < boardSize * 2) {
      const row = Math.floor(Math.random() * boardSize);
      const position1 = startCol1 + row * boardSize;
      if (position1 < boardSize ** 2) {
        positions.add(position1);
      }
      const position2 = startCol2 + row * boardSize;
      if (position2 < boardSize ** 2 && !positions.has(position2)) {
        positions.add(position2);
      }
    }
    return [...positions];
  }
  getCharacterInfo(characterEl) {
    const {
      level
    } = characterEl.dataset;
    const {
      attack
    } = characterEl.dataset;
    const {
      defence
    } = characterEl.dataset;
    const {
      health
    } = characterEl.dataset;
    return `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`;
  }
  calculateValidMoves(index, range) {
    const {
      boardSize
    } = this.gamePlay;
    const moves = [];
    const currentRow = Math.floor(index / boardSize);
    const currentCol = index % boardSize;
    for (let rowOffset = -range; rowOffset <= range; rowOffset++) {
      for (let colOffset = -range; colOffset <= range; colOffset++) {
        const newRow = currentRow + rowOffset;
        const newCol = currentCol + colOffset;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && (rowOffset !== 0 || colOffset !== 0)) {
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
          await this.handleEnemyClick(index);
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
  async handleEnemyClick(index) {
    if (this.selectedPlayerIndex !== null && this.validMoves.includes(index)) {
      const attacker = this.characters.find(c => c.position === this.selectedPlayerIndex).character;
      const targetCharacter = this.characters.find(c => c.position === index).character;
      const damage = Math.max(attacker.attack - targetCharacter.defence, attacker.attack * 0.1);
      await this.gamePlay.showDamage(index, damage);
      targetCharacter.health -= damage;
      if (targetCharacter.health <= 0) {
        this.characters = this.characters.filter(c => c.position !== index);
        this.maxScore++;
      }
      this.deselectAllCells();
      this.gamePlay.redrawPositions(this.characters);
      this.selectedPlayerIndex = null;
      await this.switchActivePlayer();
      if (this.activePlayer === 'enemy') {
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
      if (this.activePlayer === 'enemy') {
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
      this.gamePlay.setCursor(js_cursors.pointer);
    } else if (this.isEnemyCharacter(characterType) && this.selectedPlayerIndex !== null && this.validMoves.includes(index)) {
      this.handleEnemyHover(index);
    } else if (this.selectedPlayerIndex !== null) {
      this.gamePlay.setCursor(js_cursors.notallowed);
    } else {
      this.gamePlay.setCursor(js_cursors.auto);
    }
  }
  handleEmptyCellEnter(index) {
    if (this.selectedPlayerIndex !== null && this.validMoves && this.validMoves.includes(index)) {
      this.validBoardIndex = index;
      this.gamePlay.setCursor(js_cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    } else {
      this.gamePlay.setCursor(js_cursors.notallowed);
    }
  }
  handleEnemyHover(index) {
    this.selectedEnemyIndex = index;
    this.gamePlay.setCursor(js_cursors.crosshair);
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
    this.switchActivePlayer();
  }
  moveToClosest(attacker, target) {
    const possibleMoves = this.calculateValidMoves(attacker.position, 1);
    let bestMove = attacker.position;
    let minDistance = this.calculateDistance(attacker.position, target.position);
    possibleMoves.forEach(move => {
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
        this.startNewGame();
      }
    }
  }
  calculateDistance(attackerPosition, targetPosition) {
    const {
      boardSize
    } = this.gamePlay;
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
    const themesList = [themes.prairie, themes.desert, themes.arctic, themes.mountain];
    const currentIndex = themesList.indexOf(this.selectedTheme);
    this.selectedTheme = themesList[(currentIndex + 1) % themesList.length];
    this.gamePlay.drawUi(this.selectedTheme);
  }
}
;// CONCATENATED MODULE: ./src/js/GameStateService.js
class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }
  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }
  load() {
    try {
      const stateJson = this.storage.getItem('state');
      if (!stateJson) return null;
      return JSON.parse(stateJson);
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
  clear() {
    this.storage.removeItem('state');
  }
}
;// CONCATENATED MODULE: ./src/js/app.js
/**
 * Entry point of app: don't change this
 */



const gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector('#game-container'));
const stateService = new GameStateService(localStorage);
const gameCtrl = new GameController(gamePlay, stateService);
gameCtrl.init();

// don't write your code here
;// CONCATENATED MODULE: ./src/index.js



// Точка входа webpack
// Не пишите код в данном файле
/******/ })()
;