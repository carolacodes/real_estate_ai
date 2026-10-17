# Property image uploads

The `property-images` public bucket is dedicated to WebP property photos.
Public image URLs can be read without authentication. No `anon` or
`authenticated` INSERT/UPDATE/DELETE policies are required or created.
Uploads use the existing server-only `SUPABASE_SECRET_KEY` in `libs/supabase.js`;
it must be a service-role JWT or a Supabase secret key. Never put it in Vite.

Local files (ignored by Git):

```
backend/data/property-images/<existing-property-slug>/
  01.webp
  02.webp
  03.webp
  04.webp
```

Any subset of these four names is accepted, including an empty directory.
Unexpected names, subdirectories, symlinks, unknown slugs, more than four files
or non-WebP file headers fail preflight before any Storage or database writes.
Only the root `.gitkeep` is ignored by the scanner.

From `backend`, using Node 22:

```
node scripts/uploadPropertyImages.js --dry-run
```

Dry-run reads properties and local files, validates the plan, and displays
planned object paths and ordered public URLs. It never uploads or updates rows.
The 0/1/2/3/4 counts describe **local images per property**, including properties
without a local directory. A missing/empty image directory performs no writes.
Properties with no local files retain their existing `image_urls` unchanged.

When real photos are available and uploads are explicitly intended:

```
node scripts/uploadPropertyImages.js
```

This uploads only to `<slug>/<filename>` with `contentType: image/webp` and
`upsert: true`. Re-runs overwrite those same named objects and rebuild the URL
array in filename order without duplicates. No objects are automatically deleted.
After every upload for one property succeeds, one update targets only its
`image_urls`, using the unique slug. A failure is reported and other properties
can continue. Exit status is nonzero if a property failed.

Storage uploads and the database update are not a cross-service transaction:
successful uploads/upserts may remain if a later upload or row update fails.
The array is never updated with a partial set of uploaded URLs. A retry can
complete the operation using the same paths. A database response failure should
be checked before retrying, since the complete update may already have committed.

Tests use temporary local format fixtures and mocked Storage/database clients;
they never upload photos or modify real properties.
