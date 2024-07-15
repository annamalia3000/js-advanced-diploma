import GameStateService from '../GameStateService';

const mockStorage = {
    data: {},
    setItem(key, value) {
        this.data[key] = value.toString();
    },
    getItem(key) {
        return this.data[key] || null;
    },
};

describe('GameStateService', () => {
    let gameStateService;

    beforeEach(() => {
        gameStateService = new GameStateService(mockStorage);
    });

    afterEach(() => {
        mockStorage.data = {};
    });

    it('should successfully load state', () => {
        const state = {
            activePlayer: 'player',
            level: 1,
            score: 0,
            maxScore: 0,
            characters: [],
            theme: 'prairie',
        };

        mockStorage.setItem('state', JSON.stringify(state));

        const loadedState = gameStateService.load();

        expect(loadedState).toEqual(state);
    });

    it('should handle invalid state format', () => {
        mockStorage.setItem('state', '{invalid_json}');

        expect(() => {
            gameStateService.load();
        }).toThrowError('Invalid state');
    });

    it('should handle missing state', () => {
        const loadedState = gameStateService.load();
        expect(loadedState).toBeNull();
    });
});
