# ZSCORE.studio

This app was created by Parham Behzad for ZSCORE.studio.

## Environment Setup

### Required Environment Variables

**For Production Deployment:**
- `GITHUB_TOKEN` - Required for HTML content storage in production
  - Create at: https://github.com/settings/tokens
  - Required permissions: `repo` (for content management)

### Optional Environment Variables
- `BLOB_READ_WRITE_TOKEN` - For Vercel Blob Storage
- `NEXT_PUBLIC_APP_URL` - Your domain URL

## Development

```bash
npm install
npm run dev
```

In development mode, content is stored locally in `content-data/` directory.

## Production Deployment

```bash
npm run build
```

**Important:** Ensure `GITHUB_TOKEN` is configured in your deployment environment (Vercel, etc.) for HTML content storage to work properly.

### Content Architecture

- **Development**: Content stored locally in `content-data/`
- **Production**: Metadata in GitHub JSON files, HTML content in separate GitHub files
- **SEO Optimized**: HTML content separated for better search engine indexing
