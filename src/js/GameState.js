export default class GameState {
  constructor(activePlayer = 'player') {
    this.activePlayer = activePlayer;
  }
  static from(object) {
    const gameState = new GameState(object.activePlayer);
    return gameState ;
  }
}
