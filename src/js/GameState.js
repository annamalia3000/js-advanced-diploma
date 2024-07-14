export default class GameState {
  constructor(activePlayer = 'player', level = 1, score = 0, maxScore = 0, characters = [], theme = 'prairie') {
    this.activePlayer = activePlayer;
    this.level = level;
    this.score = score;
    this.maxScore = maxScore;
    this.characters = characters;
    this.theme = theme;
  }
}
