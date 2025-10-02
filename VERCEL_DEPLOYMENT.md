# Vercel Deployment Configuration for Content Repository Separation

## ✅ What's Already Set Up

Since you mentioned the GitHub token is already in Vercel environment variables, and you've created the content repository, here's what you need to verify for cloud deployment.

## 📋 Prerequisites
- ✅ Vercel account created (done)
- ✅ Repository configured for Vercel (done)  
- ✅ Content repository created (done)
- ✅ GitHub token in Vercel (done)

## 🔧 Vercel Environment Variables

Make sure these environment variables are set in your Vercel dashboard:

### Required Variables:
```env
CONTENT_GITHUB_REPO=zscore-content
CONTENT_GITHUB_OWNER=zscorenotes
GITHUB_TOKEN=your_existing_token
NODE_ENV=production
```

### How to Set Them:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`zscorenotes-github-io` or similar)
3. Go to **Settings** → **Environment Variables**
4. Add the new variables:

| Name | Value | Environment |
|------|-------|-------------|
| `CONTENT_GITHUB_REPO` | `zscore-content` | Production, Preview, Development |
| `CONTENT_GITHUB_OWNER` | `zscorenotes` | Production, Preview, Development |

**Note**: Your `GITHUB_TOKEN` should already be set and working.

## 🏗️ How It Works in Production

### Storage Logic:
- **Development**: Uses local `content-data/` folder (if exists)
- **Production**: Automatically uses GitHub API with content repository
- **Vercel**: Will use GitHub storage since `NODE_ENV=production`

### Content Loading:
- **JSON Metadata**: Fetched from `zscore-content` repository root
- **HTML Content**: Fetched from `zscore-content/content/` folders
- **Images**: Served from `zscore-content/images/` via raw GitHub URLs

### Image URLs in Production:
```
https://raw.githubusercontent.com/zscorenotes/zscore-content/main/images/[filename]
```

## 🚀 Deployment Steps

### 1. Set Environment Variables (If Not Done)
Add the required variables above to your Vercel dashboard.

### 2. Deploy to Vercel
```bash
# Push your changes
git add .
git commit -m "Update for content repository separation"
git push origin main
```

### 3. Verify Deployment
After deployment, check:
- ✅ Content loads from content repository
- ✅ Images display correctly
- ✅ Admin panel works (if accessible in production)
- ✅ No console errors

## 🔧 What's Now Working on Vercel

### ✅ Features Enabled:
- **Contact Form**: Server-side processing works
- **Admin Panel**: Full functionality with image uploads
- **API Routes**: `/api/upload-image` and future endpoints
- **Dynamic Content**: Real-time updates
- **Secure Data**: Private server-side storage

### 🛡️ Security Features:
- Server-side form validation
- Protected admin routes
- Secure file uploads
- Environment variable protection

### 📱 Performance Benefits:
- Edge functions for fast global access
- Automatic image optimization
- CDN distribution
- Real-time deployments from GitHub

## 🔗 Expected URLs After Deployment:
- **Live Site**: `https://your-project-name.vercel.app`
- **Custom Domain**: `https://zscore.studio` (after DNS setup)
- **Admin Panel**: `https://zscore.studio/admin`
- **Contact Form**: Server-side processing enabled

## 📞 Next Steps After Deployment:
1. Test contact form submission
2. Test admin panel login and image upload
3. Configure DNS for custom domain
4. Set up environment variables for security
5. Test all functionality on live site

## 🆘 Troubleshooting:
- If build fails, check the build logs in Vercel dashboard
- If domain doesn't work, verify DNS propagation (can take up to 48 hours)
- If admin panel needs auth, add environment variables

---
**Note**: This deployment includes all server-side functionality that GitHub Pages couldn't support!