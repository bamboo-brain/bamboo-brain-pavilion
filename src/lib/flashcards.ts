import type {
  FlashcardDeck,
  Flashcard,
  CreateDeckRequest,
  CreateDeckFromDocumentRequest,
  AddCardRequest,
  ReviewCardRequest,
  ReviewCardResponse,
  FlashcardStats,
} from '@/types/flashcard';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type { FlashcardDeck, Flashcard, CreateDeckRequest, CreateDeckFromDocumentRequest, AddCardRequest, ReviewCardRequest, ReviewCardResponse, FlashcardStats };

export async function getDecks(accessToken: string): Promise<FlashcardDeck[]> {
  const res = await fetch(`${API_URL}/api/flashcards/decks`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch decks');
  return res.json();
}

export async function getDeck(id: string, accessToken: string): Promise<FlashcardDeck> {
  const res = await fetch(`${API_URL}/api/flashcards/decks/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch deck');
  return res.json();
}

export async function createDeck(
  request: CreateDeckRequest,
  accessToken: string,
): Promise<FlashcardDeck> {
  const res = await fetch(`${API_URL}/api/flashcards/decks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to create deck');
  return data;
}

export async function createDeckFromDocument(
  request: CreateDeckFromDocumentRequest,
  accessToken: string,
): Promise<FlashcardDeck> {
  const res = await fetch(`${API_URL}/api/flashcards/decks/from-document`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to create deck');
  return data;
}

export async function addCard(
  deckId: string,
  request: AddCardRequest,
  accessToken: string,
): Promise<FlashcardDeck> {
  const res = await fetch(`${API_URL}/api/flashcards/decks/${deckId}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to add card');
  return data;
}

export async function removeCard(
  deckId: string,
  cardId: string,
  accessToken: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/flashcards/decks/${deckId}/cards/${cardId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to remove card');
}

export async function getDueCards(
  deckId: string,
  accessToken: string,
): Promise<{ cards: Flashcard[]; count: number; deckId: string }> {
  const res = await fetch(`${API_URL}/api/flashcards/decks/${deckId}/due`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch due cards');
  return res.json();
}

export async function reviewCard(
  deckId: string,
  request: ReviewCardRequest,
  accessToken: string,
): Promise<ReviewCardResponse> {
  const res = await fetch(`${API_URL}/api/flashcards/decks/${deckId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to submit review');
  return data;
}

export async function deleteDeck(id: string, accessToken: string): Promise<void> {
  await fetch(`${API_URL}/api/flashcards/decks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getFlashcardStats(accessToken: string): Promise<FlashcardStats> {
  const res = await fetch(`${API_URL}/api/flashcards/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
