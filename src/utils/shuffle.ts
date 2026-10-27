/** Returns a new array in random order (Fisher–Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks a slot (0..slots-1) for each of `count` items so that slots are used
 * evenly and no two neighbours share a slot. With 4 answer slots this means
 * the right answer is never in the same place twice in a row, and every slot
 * is used before any repeats.
 */
export function spreadPositions(count: number, slots: number): number[] {
  const positions: number[] = [];
  while (positions.length < count) {
    let round = shuffle([...Array(slots).keys()]);
    const last = positions[positions.length - 1];
    if (slots > 1 && round[0] === last) {
      round = [...round.slice(1), round[0]];
    }
    positions.push(...round);
  }
  return positions.slice(0, count);
}
