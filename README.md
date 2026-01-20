# JreX Trading Website

Static website for JreX with Firebase Authentication + Firestore for admin rate management.

## Local Preview
- Open `index.html` in a browser.
- Open `admin.html` to access the admin panel (requires Firebase auth setup).

## Deployment (GitHub Pages)
1. Push this repository to GitHub.
2. In GitHub: Settings → Pages → Deploy from `main` branch `/root`.
3. Add a `CNAME` file if using a custom domain.

## Firebase Setup
- Authentication: Email/Password
- Firestore: `products` collection (public read, authenticated write)
- Add your Firebase web app config into `admin.html`.
