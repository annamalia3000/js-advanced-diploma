export default class GameState {
  constructor(activePlayer = 'player', level = 1, score = 0, maxScore = 0, isGameActive = true, characters = [], theme = 'prairie') {
    this.activePlayer = activePlayer;
    this.level = level;
    this.score = score;
    this.maxScore = maxScore;
    this.isGameActive = isGameActive;
    this.characters = characters;
    this.theme = theme;
  }

  static from(object) {
    const { activePlayer, level, score, maxScore, isGameActive } = object;
    return new GameState(activePlayer, level, score, maxScore, isGameActive);
  }

  updateGameState(level, score, maxScore, isGameActive) {
    this.level = level;
    this.score = score;
    this.maxScore = maxScore;
    this.isGameActive = isGameActive;
  }

  getState() {
    return {
      activePlayer: this.activePlayer,
      level: this.level,
      score: this.score,
      maxScore: this.maxScore,
      isGameActive: this.isGameActive,
      characters: this.characters,
      theme: this.theme
    };
  }
}
