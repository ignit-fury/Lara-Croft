import { useState } from 'react';

const STORAGE_KEY = 'guest_session_id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = generateUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return generateUUID();
  }
}

export function useGuestSession(): { guestSessionId: string } {
  const [guestSessionId] = useState<string>(() => getOrCreateSessionId());
  return { guestSessionId };
}
