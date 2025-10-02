# Content Repository Separation Guide

This guide will help you complete the separation of your content and codebase into two repositories.

## Overview

Your codebase has been updated to work with a separate content repository. The content repository structure has been prepared in `../zscore-content-temp/`.

## Steps to Complete the Separation

### 1. Create the Content Repository on GitHub

1. Go to GitHub and create a new **public** repository named `zscore-content`
2. Make sure it's under the `zscorenotes` organization/username
3. Initialize it with a README (optional)

### 2. Upload Content to the New Repository

```bash
# Navigate to the prepared content directory
cd ../zscore-content-temp

# Initialize git repository
git init
git add .
git commit -m "Initial content migration from zscore.studio"

# Add your GitHub repository as remote
git remote add origin https://github.com/zscorenotes/zscore-content.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Update Environment Variables

Copy `.env.example` to `.env.local` (or your preferred environment file):

```bash
# In your main codebase directory
cp .env.example .env.local
```

Edit `.env.local` and set:
```env
CONTENT_GITHUB_REPO=zscore-content
CONTENT_GITHUB_OWNER=zscorenotes
GITHUB_TOKEN=your_github_token_here
```

### 4. Generate GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "ZSCORE Content Management"
4. Select scopes: **repo** (full repository access)
5. Copy the token and add it to your `.env.local` file

### 5. Test the Setup

1. Start your development server: `npm run dev`
2. Visit your site and check that content loads correctly
3. Try accessing the admin panel (Ctrl/Cmd + Shift + A in development)
4. Test creating/editing content to ensure GitHub integration works

### 6. Update Image URLs (Migration)

Your existing content may reference images with old URLs. You'll need to:

1. **Option A: Automatic Migration** - Run the migration script (will be created)
2. **Option B: Manual Update** - Update image URLs in your content from:
   - Old: `https://raw.githubusercontent.com/zscorenotes/zscorenotes.github.io/main/public/images/...`
   - New: `https://raw.githubusercontent.com/zscorenotes/zscore-content/main/images/...`

### 7. Clean Up Old Content (Optional)

After verifying everything works:

```bash
# Remove old content from main repository
rm -rf content-data/
rm -rf public/images/
rm -rf ../zscore-content-temp/
```

### 8. Make Main Repository Private

Once content is separated, you can make your main codebase repository private:

1. Go to your main repository settings
2. Scroll to "Danger Zone"
3. Click "Change repository visibility"
4. Select "Private"

## Repository Structure After Separation

### Main Repository (zscore.studio) - PRIVATE
```
├── src/
├── public/ (no more images/)
├── .env.local (with content repo config)
└── package.json
```

### Content Repository (zscore-content) - PUBLIC
```
├── content/
│   ├── services/
│   ├── portfolio/
│   └── news/
├── images/
├── *.json (all content metadata)
└── README.md
```

## Benefits

✅ **Security**: Main codebase is now private  
✅ **Separation**: Clean separation of code and content  
✅ **Collaboration**: Others can contribute to content without code access  
✅ **Performance**: Optimized content delivery  
✅ **Version Control**: Separate versioning for content and code changes  

## Troubleshooting

### Content Not Loading
- Check environment variables are set correctly
- Verify GitHub token has repo permissions
- Ensure content repository is public and accessible

### Admin Panel Issues
- Verify GitHub token is valid and has write permissions
- Check network requests in browser developer tools
- Ensure content repository structure matches expected format

### Image Loading Issues
- Verify image URLs point to the content repository
- Check that images exist in the content repository
- Confirm raw GitHub URLs are accessible

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set
3. Test GitHub API access manually
4. Ensure repository permissions are correct