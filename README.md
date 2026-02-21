# Complaint Box

A modern, serverless complaint management web application built with React and Firebase.

Features role-based access control (user/admin), real-time complaint and comment updates, secure authentication, and a polished glassmorphic UI with light/dark mode.

## Features

- Public landing page with protected application routes
- Firebase Authentication (email/password and Google sign-in from login page)
- Role-based access control using Firestore user profiles
- Create, view, comment, and manage complaints in real time
- Admin capabilities for status management and user role management
- Soft delete for complaints (`isDeleted: true`)
- Automatic server-side timestamping for complaints and comments
- Custom, user-friendly auth error messages
- In-app notifications

## Tech Stack

- Frontend: React 19, TypeScript, Vite
- Styling/UI: Tailwind CSS v4, shadcn/ui, Radix UI, Lucide icons
- Backend (Serverless): Firebase Authentication and Cloud Firestore (No custom backend server)
- Hosting: Firebase Hosting

## Project Structure

- `src/pages` - route-level pages
- `src/components` - reusable UI/app components
- `src/contexts` - auth/theme context providers
- `src/services` - Firestore data access layer
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore composite indexes

## Prerequisites

- Node.js 18+
- npm
- Firebase project
- Firebase CLI (`npm i -g firebase-tools`)

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_UIDS=uid1,uid2
```

Notes:
- `VITE_ADMIN_UIDS` is optional (comma-separated list).
- Storage is not used by the current app flow, but keeping `VITE_FIREBASE_STORAGE_BUCKET` is harmless.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Firebase Setup & Deploy

Deploy Firestore rules/indexes and Hosting:

```bash
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only hosting
```

Or deploy all configured Firebase targets:

```bash
firebase deploy
```

## Security Model (High Level)

- Users can create/read complaints and comments when authenticated.
- Role data is stored in `users/{uid}`.
- Once a complaint is marked as resolved, further comment mutations are restricted.
- Complaint deletion is soft delete (`isDeleted=true`) via update, not physical delete.

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - type-check + production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Notes

- After changing `firestore.rules` or `firestore.indexes.json`, redeploy Firestore targets.
- If Firebase asks about index drift during deploy, keep `firestore.indexes.json` aligned with what you want retained in the project.

## Architecture Overview

The application follows a client-driven, serverless architecture:

- React (Vite) SPA frontend
- Firebase Authentication for identity management
- Firestore as the real-time NoSQL database
- Security enforced via Firestore security rules (role-based)
- Firebase Hosting for deployment
