/**
 * High-frequency clean English word lists for Typing Typhon practice.
 */
export const ENGLISH_COMMON_WORDS = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for',
  'they', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do',
  'but', 'his', 'from', 'they', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
  'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who',
  'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just',
  'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
  'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well',
  'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'great', 'between', 'need', 'large', 'under', 'water', 'write', 'learn', 'call', 'world',
  'again', 'still', 'found', 'hand', 'small', 'keep', 'live', 'point', 'home', 'page',
  'letter', 'study', 'sound', 'change', 'light', 'form', 'kind', 'house', 'picture', 'try',
  'differ', 'animal', 'mother', 'father', 'world', 'head', 'stand', 'own', 'page', 'should',
  'country', 'answer', 'school', 'grow', 'study', 'still', 'learn', 'plant', 'cover', 'food',
  'sun', 'four', 'state', 'keep', 'eye', 'never', 'last', 'let', 'thought', 'city', 'tree',
  'cross', 'farm', 'hard', 'start', 'might', 'story', 'saw', 'far', 'sea', 'draw', 'left',
  'late', 'run', 'don', 'while', 'press', 'close', 'night', 'real', 'life', 'few', 'north',
  'open', 'seem', 'together', 'next', 'white', 'children', 'begin', 'got', 'walk', 'example',
  'ease', 'paper', 'group', 'always', 'music', 'those', 'both', 'mark', 'often', 'letter',
  'until', 'mile', 'river', 'car', 'feet', 'care', 'second', 'book', 'carry', 'took', 'science'
];

/**
 * Generate a list of words for a test session (supports deterministic seed to avoid SSR hydration mismatch).
 */
export function generateTestWords(count = 100, seed?: number): string[] {
  const words: string[] = [];
  const pool = ENGLISH_COMMON_WORDS;
  let currentSeed = seed;

  for (let i = 0; i < count; i++) {
    let index: number;
    if (typeof currentSeed === 'number') {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      index = Math.floor((currentSeed / 233280) * pool.length);
    } else {
      index = Math.floor(Math.random() * pool.length);
    }
    words.push(pool[index]);
  }
  return words;
}
