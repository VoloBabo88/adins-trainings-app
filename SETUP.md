# ADINS Trainings App — Setup

## 1. Node.js installieren
Lade Node.js von https://nodejs.org herunter (LTS Version).

## 2. Supabase SQL ausführen
Kopiere den SQL-Block aus der Prompt-Dokumentation und führe ihn im
Supabase SQL Editor aus: https://app.supabase.com

## 3. App starten

```bash
cd C:\Users\adinm\adins-trainings-app
npm install
npm run dev
```

Die App öffnet sich unter http://localhost:5173

## 4. PWA-Icons (optional)
Lege `icon-192.png` und `icon-512.png` in den `public/` Ordner.

## Struktur
```
adins-trainings-app/
├── .env                    ← Supabase Keys
├── src/
│   ├── App.tsx             ← Root, Auth-Guard
│   ├── lib/supabase.ts     ← Supabase Client
│   ├── hooks/              ← useAuth, useProfile, ...
│   ├── pages/
│   │   ├── AuthPage.tsx
│   │   ├── onboarding/     ← 7 Schritte
│   │   ├── TrainingPage.tsx
│   │   ├── FortschrittPage.tsx
│   │   ├── ErnährungPage.tsx
│   │   ├── ProfilPage.tsx
│   │   └── MehrPage.tsx
│   └── components/         ← BottomNav, Modal, MacroRing, ...
```
