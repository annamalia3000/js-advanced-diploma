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
export function calcTileType(index, boardSize) {
  const topRow = 0;
  const bottomRow = boardSize * (boardSize - 1);
  const leftColumn = index % boardSize === 0;
  const rightColumn = index % boardSize === boardSize - 1;

  if (index === topRow) {
    return 'top-left';
  };

  if (index === boardSize - 1) {
    return 'top-right';
  };

  if (index === bottomRow) {
    return 'bottom-left';
  }

  if (index === (boardSize * boardSize) - 1) {
    return 'bottom-right';
  }

  if (index > topRow && index < boardSize - 1) {
    return 'top';
  }

  if (index > bottomRow && (boardSize * boardSize) - 1) {
    return 'bottom';
  }

  if (leftColumn && index !== topRow && index !== bottomRow) {
    return 'left';
  }

  if (rightColumn && index !== boardSize - 1 && index !== (boardSize * boardSize) - 1) {
    return 'right';
  }
  
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
