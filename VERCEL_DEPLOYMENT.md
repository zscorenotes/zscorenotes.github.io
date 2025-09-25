# Vercel Deployment Instructions

## 📋 Prerequisites
- ✅ Vercel account created (done)
- ✅ Repository configured for Vercel (done)
- ✅ API routes enabled (done)
- ✅ Next.js config updated (done)

## 🚀 Deployment Steps

### 1. Push Changes to GitHub
```bash
git push origin main
```

### 2. Deploy to Vercel (Choose One Method)

#### Method A: Via Vercel CLI (Recommended)
```bash
# Login to Vercel
vercel login

# Deploy (first time will ask for configuration)
vercel

# For production deployment
vercel --prod
```

#### Method B: Via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository `zscorenotes/zscorenotes.github.io`
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. Click "Deploy"

### 3. Configure Custom Domain
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add `zscore.studio`
4. Copy the DNS records Vercel provides
5. Update your domain DNS settings:
   - Type: `CNAME`
   - Name: `@` (or leave empty)
   - Value: `cname.vercel-dns.com`

### 4. Environment Variables (Optional)
For admin panel security, add environment variables:
1. Go to "Settings" → "Environment Variables"
2. Add:
   - `ADMIN_PASSWORD`: Your admin password
   - `NEXTAUTH_SECRET`: Random secret key
   - `NEXTAUTH_URL`: Your domain URL

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