# Nobin Portfolio

Professional portfolio with admin panel, live chat, and contact form.

## 🚀 Quick Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add Environment Variables (for email):
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = your Gmail address
   - `SMTP_PASS` = Gmail App Password (not your regular password)
   - `CONTACT_TO` = where to receive contact emails

4. Click **Deploy** ✅

## 📧 Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to App Passwords → Create one for "Mail"
4. Use that 16-character password as `SMTP_PASS`

## 🔐 Admin Panel

- URL: `yourdomain.com/admin`
- Username: `admin@nobin`
- Password: `77441122`

## 📁 Structure

```
portfolio/
├── index.html          ← Main portfolio page
├── admin/
│   ├── index.html      ← Admin dashboard
│   ├── admin.css
│   └── admin.js
├── api/
│   ├── contact.js      ← Email sending (Vercel serverless)
│   └── chat.js         ← Chat auto-reply
├── assets/
│   ├── css/
│   ├── js/
│   └── images/         ← Add profile.jpg here
├── package.json
└── vercel.json
```

## 🖼️ Adding Your Profile Photo

Replace `assets/images/profile.jpg` with your photo.

## ✏️ Admin Features

- ✅ Add / Edit / Delete Services
- ✅ Add / Edit / Delete Projects (with image upload)
- ✅ Add / Remove Skills
- ✅ Edit Workflow Steps
- ✅ View & manage contact messages
- ✅ Edit About section and profile settings
