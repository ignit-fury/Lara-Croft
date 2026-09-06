# Task 12 — Seed Script

**Status:** Complete

## Changes

| File | Action |
|------|--------|
| `server/src/seed.ts` | Created — seed script with 6 categories, 12 products |
| `server/package.json` | Updated — added `"seed": "tsx src/seed.ts"` script |

## Product Catalog

| Category | Products |
|----------|----------|
| Lehengas | Royal Velvet Maroon, Pastel Tulle Mint |
| Sarees | Banarasi Silk Gold, Chiffon Georgette Rose |
| Suits & Salwar | Anarkali Navy, Palazzo Ivory |
| Western Wear | Sequin Gown Black, Drape Maxi Wine |
| Jewellery | Kundan Bridal Set, Pearl Choker Classic |
| Accessories | Embroidered Clutch Gold, Silk Stole Multi |

## Usage

```bash
cd server && npm run seed
```

Requires `MONGODB_URI` in `.env`. Clears existing data before seeding.

## Notes

- All prices in paise (integer)
- 8 products marked as featured
- Placeholder images via picsum.photos
- Category references resolved via slug→ObjectId map
