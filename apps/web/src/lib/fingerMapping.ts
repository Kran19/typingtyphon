export type FingerId =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export interface FingerInfo {
  id: FingerId;
  name: string;
  hand: 'left' | 'right';
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

export const FINGER_DATA: Record<FingerId, FingerInfo> = {
  'left-pinky': {
    id: 'left-pinky',
    name: 'Left Pinky',
    hand: 'left',
    color: '#c084fc', // Violet/Purple
    badgeBg: 'rgba(192, 132, 252, 0.15)',
    badgeBorder: 'rgba(192, 132, 252, 0.4)',
  },
  'left-ring': {
    id: 'left-ring',
    name: 'Left Ring',
    hand: 'left',
    color: '#60a5fa', // Blue
    badgeBg: 'rgba(96, 165, 250, 0.15)',
    badgeBorder: 'rgba(96, 165, 250, 0.4)',
  },
  'left-middle': {
    id: 'left-middle',
    name: 'Left Middle',
    hand: 'left',
    color: '#2dd4bf', // Teal/Cyan
    badgeBg: 'rgba(45, 212, 191, 0.15)',
    badgeBorder: 'rgba(45, 212, 191, 0.4)',
  },
  'left-index': {
    id: 'left-index',
    name: 'Left Index',
    hand: 'left',
    color: '#34d399', // Emerald/Green
    badgeBg: 'rgba(52, 211, 153, 0.15)',
    badgeBorder: 'rgba(52, 211, 153, 0.4)',
  },
  thumb: {
    id: 'thumb',
    name: 'Thumb',
    hand: 'left', // Shared by both thumbs
    color: '#38bdf8', // Sky Cyan
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    badgeBorder: 'rgba(56, 189, 248, 0.4)',
  },
  'right-index': {
    id: 'right-index',
    name: 'Right Index',
    hand: 'right',
    color: '#34d399', // Emerald/Green
    badgeBg: 'rgba(52, 211, 153, 0.15)',
    badgeBorder: 'rgba(52, 211, 153, 0.4)',
  },
  'right-middle': {
    id: 'right-middle',
    name: 'Right Middle',
    hand: 'right',
    color: '#2dd4bf', // Teal/Cyan
    badgeBg: 'rgba(45, 212, 191, 0.15)',
    badgeBorder: 'rgba(45, 212, 191, 0.4)',
  },
  'right-ring': {
    id: 'right-ring',
    name: 'Right Ring',
    hand: 'right',
    color: '#60a5fa', // Blue
    badgeBg: 'rgba(96, 165, 250, 0.15)',
    badgeBorder: 'rgba(96, 165, 250, 0.4)',
  },
  'right-pinky': {
    id: 'right-pinky',
    name: 'Right Pinky',
    hand: 'right',
    color: '#c084fc', // Violet/Purple
    badgeBg: 'rgba(192, 132, 252, 0.15)',
    badgeBorder: 'rgba(192, 132, 252, 0.4)',
  },
};

// Maps any standard keyboard character to its touch typing finger
export const CHAR_TO_FINGER_MAP: Record<string, FingerId> = {
  // Left Pinky
  '`': 'left-pinky',
  '~': 'left-pinky',
  '1': 'left-pinky',
  '!': 'left-pinky',
  q: 'left-pinky',
  Q: 'left-pinky',
  a: 'left-pinky',
  A: 'left-pinky',
  z: 'left-pinky',
  Z: 'left-pinky',

  // Left Ring
  '2': 'left-ring',
  '@': 'left-ring',
  w: 'left-ring',
  W: 'left-ring',
  s: 'left-ring',
  S: 'left-ring',
  x: 'left-ring',
  X: 'left-ring',

  // Left Middle
  '3': 'left-middle',
  '#': 'left-middle',
  e: 'left-middle',
  E: 'left-middle',
  d: 'left-middle',
  D: 'left-middle',
  c: 'left-middle',
  C: 'left-middle',

  // Left Index
  '4': 'left-index',
  $: 'left-index',
  '5': 'left-index',
  '%': 'left-index',
  r: 'left-index',
  R: 'left-index',
  t: 'left-index',
  T: 'left-index',
  f: 'left-index',
  F: 'left-index',
  g: 'left-index',
  G: 'left-index',
  v: 'left-index',
  V: 'left-index',
  b: 'left-index',
  B: 'left-index',

  // Thumbs
  ' ': 'thumb',

  // Right Index
  '6': 'right-index',
  '^': 'right-index',
  '7': 'right-index',
  '&': 'right-index',
  y: 'right-index',
  Y: 'right-index',
  u: 'right-index',
  U: 'right-index',
  h: 'right-index',
  H: 'right-index',
  j: 'right-index',
  J: 'right-index',
  n: 'right-index',
  N: 'right-index',
  m: 'right-index',
  M: 'right-index',

  // Right Middle
  '8': 'right-middle',
  '*': 'right-middle',
  i: 'right-middle',
  I: 'right-middle',
  k: 'right-middle',
  K: 'right-middle',
  ',': 'right-middle',
  '<': 'right-middle',

  // Right Ring
  '9': 'right-ring',
  '(': 'right-ring',
  o: 'right-ring',
  O: 'right-ring',
  l: 'right-ring',
  L: 'right-ring',
  '.': 'right-ring',
  '>': 'right-ring',

  // Right Pinky
  '0': 'right-pinky',
  ')': 'right-pinky',
  '-': 'right-pinky',
  _: 'right-pinky',
  '=': 'right-pinky',
  '+': 'right-pinky',
  p: 'right-pinky',
  P: 'right-pinky',
  '[': 'right-pinky',
  '{': 'right-pinky',
  ']': 'right-pinky',
  '}': 'right-pinky',
  ';': 'right-pinky',
  ':': 'right-pinky',
  "'": 'right-pinky',
  '"': 'right-pinky',
  '/': 'right-pinky',
  '?': 'right-pinky',
  '\\': 'right-pinky',
  '|': 'right-pinky',
};

export interface KeyLayoutItem {
  key: string;
  display: string;
  finger: FingerId;
  width?: number; // flex basis or relative multiplier
  isHomeAnchor?: boolean;
}

export const KEYBOARD_LAYOUT_ROWS: KeyLayoutItem[][] = [
  // Number row
  [
    { key: '`', display: '`', finger: 'left-pinky' },
    { key: '1', display: '1', finger: 'left-pinky' },
    { key: '2', display: '2', finger: 'left-ring' },
    { key: '3', display: '3', finger: 'left-middle' },
    { key: '4', display: '4', finger: 'left-index' },
    { key: '5', display: '5', finger: 'left-index' },
    { key: '6', display: '6', finger: 'right-index' },
    { key: '7', display: '7', finger: 'right-index' },
    { key: '8', display: '8', finger: 'right-middle' },
    { key: '9', display: '9', finger: 'right-ring' },
    { key: '0', display: '0', finger: 'right-pinky' },
    { key: '-', display: '-', finger: 'right-pinky' },
    { key: '=', display: '=', finger: 'right-pinky' },
    { key: 'Backspace', display: 'Bksp', finger: 'right-pinky', width: 1.5 },
  ],
  // Top row (QWERTY)
  [
    { key: 'Tab', display: 'Tab', finger: 'left-pinky', width: 1.4 },
    { key: 'q', display: 'Q', finger: 'left-pinky' },
    { key: 'w', display: 'W', finger: 'left-ring' },
    { key: 'e', display: 'E', finger: 'left-middle' },
    { key: 'r', display: 'R', finger: 'left-index' },
    { key: 't', display: 'T', finger: 'left-index' },
    { key: 'y', display: 'Y', finger: 'right-index' },
    { key: 'u', display: 'U', finger: 'right-index' },
    { key: 'i', display: 'I', finger: 'right-middle' },
    { key: 'o', display: 'O', finger: 'right-ring' },
    { key: 'p', display: 'P', finger: 'right-pinky' },
    { key: '[', display: '[', finger: 'right-pinky' },
    { key: ']', display: ']', finger: 'right-pinky' },
    { key: '\\', display: '\\', finger: 'right-pinky', width: 1.1 },
  ],
  // Home row (ASDF JKL;)
  [
    { key: 'Caps', display: 'Caps', finger: 'left-pinky', width: 1.7 },
    { key: 'a', display: 'A', finger: 'left-pinky' },
    { key: 's', display: 'S', finger: 'left-ring' },
    { key: 'd', display: 'D', finger: 'left-middle' },
    { key: 'f', display: 'F', finger: 'left-index', isHomeAnchor: true },
    { key: 'g', display: 'G', finger: 'left-index' },
    { key: 'h', display: 'H', finger: 'right-index' },
    { key: 'j', display: 'J', finger: 'right-index', isHomeAnchor: true },
    { key: 'k', display: 'K', finger: 'right-middle' },
    { key: 'l', display: 'L', finger: 'right-ring' },
    { key: ';', display: ';', finger: 'right-pinky' },
    { key: "'", display: "'", finger: 'right-pinky' },
    { key: 'Enter', display: 'Enter', finger: 'right-pinky', width: 1.8 },
  ],
  // Bottom row (ZXCVBNM)
  [
    { key: 'ShiftLeft', display: 'Shift', finger: 'left-pinky', width: 2.2 },
    { key: 'z', display: 'Z', finger: 'left-pinky' },
    { key: 'x', display: 'X', finger: 'left-ring' },
    { key: 'c', display: 'C', finger: 'left-middle' },
    { key: 'v', display: 'V', finger: 'left-index' },
    { key: 'b', display: 'B', finger: 'left-index' },
    { key: 'n', display: 'N', finger: 'right-index' },
    { key: 'm', display: 'M', finger: 'right-index' },
    { key: ',', display: ',', finger: 'right-middle' },
    { key: '.', display: '.', finger: 'right-ring' },
    { key: '/', display: '/', finger: 'right-pinky' },
    { key: 'ShiftRight', display: 'Shift', finger: 'right-pinky', width: 2.3 },
  ],
  // Space row
  [
    { key: 'Ctrl', display: 'Ctrl', finger: 'left-pinky', width: 1.3 },
    { key: 'Alt', display: 'Alt', finger: 'thumb', width: 1.2 },
    { key: ' ', display: 'Spacebar', finger: 'thumb', width: 6.2 },
    { key: 'AltRight', display: 'Alt', finger: 'thumb', width: 1.2 },
    { key: 'CtrlRight', display: 'Ctrl', finger: 'right-pinky', width: 1.3 },
  ],
];

export function getFingerForKey(char: string): FingerInfo | null {
  if (!char) return null;
  const normalized = char.length === 1 ? char.toLowerCase() : char;
  const fingerId = CHAR_TO_FINGER_MAP[char] || CHAR_TO_FINGER_MAP[normalized];
  if (!fingerId) return null;
  return FINGER_DATA[fingerId] || null;
}
