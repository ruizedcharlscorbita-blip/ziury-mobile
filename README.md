# Ziury Mobile Application

This directory contains the primary mobile application source code for **Ziury**, built with Expo v57, React Native 0.86, Drizzle ORM + SQLite for local context storage, and Vercel AI SDK for the swappable AI brain.

## Application Architecture

```
ziury-mobile/
├── app/              # Expo Router pages and screen components
├── components/       # Reusable UI components (buttons, inputs, cards)
├── db/               # Drizzle ORM schema, SQLite migrations, and helpers
│   ├── schema/       # Database tables (conversations, messages, notes, keys)
│   └── migrations/   # Generated SQL migrations
├── services/         # AI provider integrations & API key management
├── stores/           # Zustand state management
├── types/            # TypeScript interface & type definitions
├── utils/            # Helper functions & formatters
└── assets/           # Icons, images, and fonts
```

## Setup & Running

### 1. Install Dependencies
```bash
cd ziury-mobile
npm install
```

### 2. Start Expo Development Server
```bash
npm run start
```

### 3. Run on Platforms
```bash
npm run android   # Run on Android device/emulator
npm run ios       # Run on iOS simulator (macOS required)
npm run web       # Run in web browser
```

### 4. Database Commands (Drizzle)
```bash
npm run db:generate   # Generate database migrations from schema
npm run db:push       # Push schema changes to local SQLite
```

## Key Technologies
- **Expo**: v57.0.7
- **React Native**: v0.86.0
- **Local Storage**: `expo-sqlite` v15.0.0 + `drizzle-orm` v0.38.0
- **AI Integration**: Vercel AI SDK (`ai`), `@ai-sdk/google`, `@ai-sdk/anthropic`, `@ai-sdk/openai`
- **Security**: `expo-secure-store` v14.0.0
- **Styling**: `nativewind` v4.1.0 (Tailwind CSS)
- **State**: `zustand` v5.0.0
