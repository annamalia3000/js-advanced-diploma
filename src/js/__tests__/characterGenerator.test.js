import { characterGenerator } from '../generators';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

test('should generate infinity cshould generate characters endlessly from allowedTypes', () => {
    const allowedTypes = [ Bowman, Swordsman, Magician, Daemon, Undead, Vampire ];
    const maxLevel = 4;
    const generator = characterGenerator(allowedTypes, maxLevel);

    for (let i = 0; i < 100; i++) {
        const character = generator.next().value;

        expect(character).toBeDefined();
        expect(allowedTypes).toContain(character.constructor);
        expect(character.level).toBeGreaterThanOrEqual(1);
        expect(character.level).toBeLessThanOrEqual(maxLevel);
    }
});
