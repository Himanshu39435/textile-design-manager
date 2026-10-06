# Narang Textile – Design Manager

A production-ready full-stack web app for a textile/garment business to manage design photos, detect duplicates, and quickly search previous uploads.

## Features

- Design photo uploads with gallery/camera support
- Duplicate detection based on file fingerprint + perceptual hash
- Design Number validation and auto-generation workflow
- Search-by-design-number and search-by-photo flows
- Dashboard with summary metrics and recent designs
- Responsive mobile-first UI with desktop sidebar and bottom nav
- Express + MongoDB backend with Cloudinary image storage

## Tech Stack

Frontend:
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

Backend:
- Node.js
- Express.js
- MongoDB + Mongoose
- Multer
- Sharp
- Cloudinary

## Project Structure

- /client
- /server
- /package.json
- /.env.example

## Setup

1. Copy `.env.example` to `.env` and fill the required values.
2. Start MongoDB locally on port 27017.
3. Install dependencies:
   `npm install`
4. Run the app in development mode:
   `npm run dev`
5. Frontend runs at `http://localhost:5173`
6. Backend runs at `http://localhost:5000`

## Environment Variables

See `.env.example` for configuration details.

## API Notes

The main backend routes are under `/api/designs` and include:
- `POST /api/designs`
- `GET /api/designs`
- `GET /api/designs/:id`
- `POST /api/designs/check-duplicate`
- `POST /api/designs/search-by-image`
- `GET /api/designs/dashboard/stats`

## Duplicate Detection

The duplicate service uses a layered approach:
- exact byte fingerprint via SHA-256
- comparison copy via Sharp
- perceptual hash matching for visually similar uploads
- future-ready structure for image embedding models

## Notes

This project is designed for a clean starting point and is ready for local development and continued expansion.
