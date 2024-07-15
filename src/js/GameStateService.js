export default class GameStateService {
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
