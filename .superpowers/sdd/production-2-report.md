# Production 2 Report: Image Upload + Admin Product Edit

**Date:** 2026-09-06  
**Task:** Add image upload with Supabase Storage and admin product edit page

## Files Created

| File | Purpose |
|------|---------|
| `server/src/controllers/uploadController.ts` | Multer handler → Supabase Storage → public URL |
| `server/src/routes/upload.ts` | POST `/api/upload` (admin/manager only) |
| `client/src/pages/admin/ProductEdit.tsx` | Create/edit product form with image upload UI |

## Files Modified

| File | Change |
|------|--------|
| `server/src/index.ts` | Added upload route import + `app.use('/api/upload', uploadRoutes)` |
| `client/src/pages/admin/Products.tsx` | Added Link import, "Add Product" button, "Edit" link per row |
| `client/src/App.tsx` | Added ProductEdit import + routes `/admin/products/new` and `/admin/products/:id/edit` |

## Dependencies Installed

- `multer` — multipart file handling
- `@types/multer` — TypeScript types

## Notes

- Supabase bucket must be named `product-images` with public access enabled
- Upload size limit: 5MB per image
- Images stored in `products/` path prefix in Supabase
- ProductEdit form handles both create (no id param) and edit (with id param)
- Price converted to paise on submit, from paise on load (matches existing convention)
