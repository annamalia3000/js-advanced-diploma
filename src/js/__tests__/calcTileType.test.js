import { calcTileType } from '../utils.js';

test('should return top-left', () => {
  expect(calcTileType(0, 8)).toBe('top-left');
});

test('should return top', () => {
  expect(calcTileType(1, 8)).toBe('top');
});

test('should return top-right', () => {
  expect(calcTileType(7, 8)).toBe('top-right');
});

test('should return left', () => {
  expect(calcTileType(8, 8)).toBe('left');
});

test('should return center', () => {
  expect(calcTileType(9, 8)).toBe('center');
});

test('should return right', () => {
  expect(calcTileType(15, 8)).toBe('right');
});

test('should return bottom-left', () => {
  expect(calcTileType(56, 8)).toBe('bottom-left');
});

test('should return bottom', () => {
  expect(calcTileType(57, 8)).toBe('bottom');
});

test('should return bottom-right', () => {
  expect(calcTileType(63, 8)).toBe('bottom-right');
});
