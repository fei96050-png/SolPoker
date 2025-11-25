export type Suit = 'H' | 'D' | 'C' | 'S';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface HandRank {
  rank: number;
  name: string;
  value: number;
}

const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const HAND_RANKS = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10
};

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], numCards: number): { dealt: Card[]; remaining: Card[] } {
  const dealt = deck.slice(0, numCards);
  const remaining = deck.slice(numCards);
  return { dealt, remaining };
}

function getRankCount(cards: Card[]): Map<Rank, number> {
  const counts = new Map<Rank, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  }
  return counts;
}

function getSuitCount(cards: Card[]): Map<Suit, number> {
  const counts = new Map<Suit, number>();
  for (const card of cards) {
    counts.set(card.suit, (counts.get(card.suit) || 0) + 1);
  }
  return counts;
}

function isFlush(cards: Card[]): boolean {
  const suitCounts = getSuitCount(cards);
  return Array.from(suitCounts.values()).some(count => count >= 5);
}

function isStraight(cards: Card[]): boolean {
  const uniqueValues = Array.from(new Set(cards.map(c => RANK_VALUES[c.rank]))).sort((a, b) => a - b);

  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (uniqueValues[i + 4] - uniqueValues[i] === 4) {
      return true;
    }
  }

  if (uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) &&
      uniqueValues.includes(4) && uniqueValues.includes(5)) {
    return true;
  }

  return false;
}

function isStraightFlush(cards: Card[]): boolean {
  const bySuit = new Map<Suit, Card[]>();
  for (const card of cards) {
    if (!bySuit.has(card.suit)) {
      bySuit.set(card.suit, []);
    }
    bySuit.get(card.suit)!.push(card);
  }

  for (const suitCards of bySuit.values()) {
    if (suitCards.length >= 5 && isStraight(suitCards)) {
      return true;
    }
  }

  return false;
}

function isRoyalFlush(cards: Card[]): boolean {
  const bySuit = new Map<Suit, Card[]>();
  for (const card of cards) {
    if (!bySuit.has(card.suit)) {
      bySuit.set(card.suit, []);
    }
    bySuit.get(card.suit)!.push(card);
  }

  for (const suitCards of bySuit.values()) {
    if (suitCards.length >= 5) {
      const ranks = suitCards.map(c => c.rank);
      if (ranks.includes('A') && ranks.includes('K') && ranks.includes('Q') &&
          ranks.includes('J') && ranks.includes('T')) {
        return true;
      }
    }
  }

  return false;
}

export function evaluateHand(holeCards: Card[], communityCards: Card[]): HandRank {
  const allCards = [...holeCards, ...communityCards];
  const rankCounts = getRankCount(allCards);
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);

  if (isRoyalFlush(allCards)) {
    return { rank: HAND_RANKS.ROYAL_FLUSH, name: 'Royal Flush', value: 10 };
  }

  if (isStraightFlush(allCards)) {
    return { rank: HAND_RANKS.STRAIGHT_FLUSH, name: 'Straight Flush', value: 9 };
  }

  if (counts[0] === 4) {
    return { rank: HAND_RANKS.FOUR_OF_KIND, name: 'Four of a Kind', value: 8 };
  }

  if (counts[0] === 3 && counts[1] === 2) {
    return { rank: HAND_RANKS.FULL_HOUSE, name: 'Full House', value: 7 };
  }

  if (isFlush(allCards)) {
    return { rank: HAND_RANKS.FLUSH, name: 'Flush', value: 6 };
  }

  if (isStraight(allCards)) {
    return { rank: HAND_RANKS.STRAIGHT, name: 'Straight', value: 5 };
  }

  if (counts[0] === 3) {
    return { rank: HAND_RANKS.THREE_OF_KIND, name: 'Three of a Kind', value: 4 };
  }

  if (counts[0] === 2 && counts[1] === 2) {
    return { rank: HAND_RANKS.TWO_PAIR, name: 'Two Pair', value: 3 };
  }

  if (counts[0] === 2) {
    return { rank: HAND_RANKS.PAIR, name: 'Pair', value: 2 };
  }

  return { rank: HAND_RANKS.HIGH_CARD, name: 'High Card', value: 1 };
}

export function compareHands(hand1: HandRank, hand2: HandRank): number {
  return hand1.value - hand2.value;
}

export function findWinner(
  players: Array<{ holeCards: Card[]; active: boolean }>,
  communityCards: Card[]
): number {
  let bestHandIndex = -1;
  let bestHand: HandRank | null = null;

  for (let i = 0; i < players.length; i++) {
    if (!players[i].active) continue;

    const hand = evaluateHand(players[i].holeCards, communityCards);

    if (bestHand === null || compareHands(hand, bestHand) > 0) {
      bestHand = hand;
      bestHandIndex = i;
    }
  }

  return bestHandIndex;
}

export function getCardDisplay(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    'H': '♥',
    'D': '♦',
    'C': '♣',
    'S': '♠'
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

export function getCardColor(suit: Suit): string {
  return suit === 'H' || suit === 'D' ? 'red' : 'black';
}
