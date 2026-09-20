import { Request, Response } from 'express';

interface GuestCartItem {
  product_id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

interface GuestCartEntry {
  items: GuestCartItem[];
  expiresAt: number;
}

const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CARTS = 10000;

const guestCarts = new Map<string, GuestCartEntry>();

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of guestCarts.entries()) {
    if (entry.expiresAt <= now) guestCarts.delete(key);
  }
  // Evict oldest if over cap
  if (guestCarts.size > MAX_CARTS) {
    const oldest = guestCarts.keys().next().value;
    if (oldest) guestCarts.delete(oldest);
  }
}

function getSessionId(req: Request): string {
  return String(req.params.sessionId || '');
}

export async function getGuestCart(req: Request, res: Response): Promise<void> {
  try {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      res.status(400).json({ success: false, error: 'Invalid session ID' });
      return;
    }
    cleanupExpired();
    const entry = guestCarts.get(sessionId);
    res.json({ success: true, data: { items: entry?.items || [] } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function addToGuestCart(req: Request, res: Response): Promise<void> {
  try {
    const sessionId = getSessionId(req);
    const { product_id, name, price, size, quantity, image } = req.body;

    if (!sessionId) {
      res.status(400).json({ success: false, error: 'Invalid session ID' });
      return;
    }
    if (!product_id || !name || price == null || quantity == null) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    cleanupExpired();
    const entry = guestCarts.get(sessionId) || { items: [], expiresAt: Date.now() + TTL_MS };

    const existing = entry.items.find(
      (i) => i.product_id === product_id && i.size === (size || ''),
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      entry.items.push({
        product_id,
        name,
        price,
        size: size || '',
        quantity,
        image: image || '',
      });
    }

    entry.expiresAt = Date.now() + TTL_MS;
    guestCarts.set(sessionId, entry);

    res.json({ success: true, data: { items: entry.items } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateGuestCart(req: Request, res: Response): Promise<void> {
  try {
    const sessionId = getSessionId(req);
    const { product_id, size, quantity } = req.body;

    if (!sessionId) {
      res.status(400).json({ success: false, error: 'Invalid session ID' });
      return;
    }

    cleanupExpired();
    const entry = guestCarts.get(sessionId);
    if (!entry) {
      res.status(404).json({ success: false, error: 'Guest cart not found' });
      return;
    }

    if (quantity === 0) {
      entry.items = entry.items.filter(
        (i) => !(i.product_id === product_id && i.size === (size || '')),
      );
    } else {
      const item = entry.items.find(
        (i) => i.product_id === product_id && i.size === (size || ''),
      );
      if (item) item.quantity = quantity;
    }

    entry.expiresAt = Date.now() + TTL_MS;
    guestCarts.set(sessionId, entry);

    res.json({ success: true, data: { items: entry.items } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function removeFromGuestCart(req: Request, res: Response): Promise<void> {
  try {
    const sessionId = getSessionId(req);
    const product_id = String(req.query.product_id || '');
    const size = String(req.query.size || '');

    if (!sessionId) {
      res.status(400).json({ success: false, error: 'Invalid session ID' });
      return;
    }

    cleanupExpired();
    const entry = guestCarts.get(sessionId);
    if (!entry) {
      res.status(404).json({ success: false, error: 'Guest cart not found' });
      return;
    }

    entry.items = entry.items.filter(
      (i) => !(i.product_id === product_id && i.size === size),
    );
    entry.expiresAt = Date.now() + TTL_MS;
    guestCarts.set(sessionId, entry);

    res.json({ success: true, data: { items: entry.items } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export function clearGuestCart(sessionId: string) {
  guestCarts.delete(sessionId);
}
