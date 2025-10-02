# ✅ Vercel Cloud Deployment Checklist

## 🎯 Current Status
- ✅ Content repository (`zscore-content`) created
- ✅ GitHub token already in Vercel
- ✅ Codebase updated for content separation
- ✅ All files ready for production deployment

## 🔧 Required Vercel Environment Variables

Add these **two new variables** to your Vercel dashboard:

### In Vercel Dashboard → Settings → Environment Variables:

| Variable Name | Value | All Environments |
|---------------|-------|------------------|
| `CONTENT_GITHUB_REPO` | `zscore-content` | ✅ Production, Preview, Development |
| `CONTENT_GITHUB_OWNER` | `zscorenotes` | ✅ Production, Preview, Development |

**Note**: Your `GITHUB_TOKEN` is already configured ✅

## 🔧 Optional: Migrate Existing Content URLs

If you have existing content with old content_file paths, run this migration:

```bash
# Update existing content_file URLs to use raw GitHub URLs
node scripts/migrate-content-file-urls.js
```

This converts paths like:
- **Before**: `"/content-data/content/portfolio/portfolio_123.html"`
- **After**: `"https://raw.githubusercontent.com/zscorenotes/zscore-content/main/content/portfolio/portfolio_123.html"`

## 🚀 Deploy Now

```bash
# Commit and push the separation changes
git add .
git commit -m "Implement content repository separation for production"
git push origin main
```

**That's it!** Vercel will automatically deploy with the new content repository setup.

## 🔍 After Deployment - Verify These Work:

1. **Homepage loads content**: https://your-domain.com
2. **Images display correctly**: Check any news/portfolio items
3. **News detail pages**: https://your-domain.com/news/[article-slug]
4. **All images use new URLs**: Should be `raw.githubusercontent.com/zscorenotes/zscore-content/main/images/...`

## 🏗️ Production Architecture

```
Vercel App (zscore.studio)
    ↓ GitHub API calls
Content Repository (zscore-content) 
    ├── *.json (metadata)
    ├── content/ (HTML files)
    └── images/ (all images)
```

## 📱 What Happens in Production:

- **Content Loading**: Fetches from `zscore-content` repository via GitHub API
- **Images**: Served directly from `zscore-content/images/` via raw GitHub URLs
- **HTML Content**: Loaded directly from raw GitHub URLs (e.g., `https://raw.githubusercontent.com/zscorenotes/zscore-content/main/content/...`)
- **Admin Panel**: Creates/edits content in `zscore-content` repository
- **No Local Files**: Everything comes from the cloud content repository

## 🚨 Important Notes:

1. **Content Repository Must Be Public** ✅ (for raw file access)
2. **GitHub Token Needs Repo Access** ✅ (already configured)
3. **Automatic Fallback**: If content repo fails, shows empty content (graceful degradation)
4. **Environment Detection**: Automatically uses GitHub storage in production

## ⚡ Ready to Deploy!

Your setup is **production-ready**. Just add the two environment variables and deploy! 

The separation will work seamlessly with your existing Vercel + GitHub token setup.