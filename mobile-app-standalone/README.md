# LifeSet Mobile App

Standalone mobile application for the LifeSet Platform built with React Native and Expo.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API endpoint
```

3. Start the development server:
```bash
npm start
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run build` - Build the app

## Project Structure

- `src/` - Source code
  - `screens/` - Screen components
  - `components/` - Reusable components
  - `navigation/` - Navigation setup
  - `services/` - API services
  - `store/` - State management

## Notes

This is a standalone version of the mobile application, previously part of a monorepo.
