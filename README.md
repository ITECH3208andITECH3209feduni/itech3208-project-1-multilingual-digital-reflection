# StoryBond - Multilingual Digital Home Literacy Platform

A web-based platform for parents to track and reflect on their children's digital literacy activities.

## 🚀 Demo Credentials

For testing the login page:
- **Username:** `coolkid123`
- **Password:** `rainbow`

## 📁 Project Structure

```
storybond-app/
├── login.html          # Login page (entry point)
├── login-style.css     # Login page styles
├── login-script.js     # Login page functionality
├── index.html          # Home page (after login)
├── upload.html         # Upload media page
├── journal.html        # Journal page (placeholder)
├── weekly.html         # Weekly recap page (placeholder)
├── styles.css          # Shared styles for all pages
└── wireframe.html      # Wireframe for documentation
```

## 🎯 Features

### Login Page
- Playful, child-friendly design
- Animated background and emoji decorations
- Form validation
- Demo credentials for testing (no backend required)

### Home Page
- Dashboard with recent entries
- Weekly progress tracker
- Language toggle (EN/TR)
- Add children functionality

### Upload Page
- Photo upload with drag & drop
- Video upload with drag & drop
- File preview
- Multi-file selection

## 🌐 Deploy to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to project folder:
```bash
cd storybond-app
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts and your site will be live!

### Option 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub/GitLab/Bitbucket
3. Click "New Project"
4. Upload the `storybond-app` folder
5. Click "Deploy"
6. Your site will be live in seconds!

### Option 3: GitHub Integration

1. Create a new repository on GitHub
2. Upload all files from `storybond-app` folder
3. Go to [vercel.com](https://vercel.com)
4. Click "Import Project"
5. Select your GitHub repository
6. Click "Deploy"

## 🔗 Navigation Flow

```
login.html (START)
    ↓
  [Login with credentials]
    ↓
index.html (Home)
    ├→ upload.html (Upload Media)
    ├→ journal.html (Journal - Coming Soon)
    └→ weekly.html (Weekly Recap - Coming Soon)
```

## 📝 Usage

1. **Start at login page:** `login.html`
2. **Enter credentials:**
   - Username: `coolkid123`
   - Password: `rainbow`
3. **After successful login:** Automatically redirected to home page
4. **Navigate:** Use sidebar to switch between pages

## 🎨 Design Features

- Bilingual support (English/Turkish)
- Colorful, child-friendly interface
- Rainbow gradient accents
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Accessible markup

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Fonts:** Google Fonts (Poppins, Baloo 2, Nunito)
- **Deployment:** Vercel
- **No Backend Required:** Pure static site for demo/testing

## 📱 Responsive Design

- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 768px)
- ✅ Landscape orientation support

## 🚧 Coming Soon

- Journal entry creation
- Weekly analytics dashboard
- Profile settings
- Child management
- Backend integration

## 👥 Team

Sprint 1 - Capstone Project
Federation University Australia

---

**Note:** This is a prototype for presentation and testing. All data is stored locally in the browser and will be lost on refresh. Backend integration coming in future sprints.
