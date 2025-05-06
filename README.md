# Snow and Avalanche Safety Awareness Web App

A React-based web application to promote snow and avalanche safety. The app provides real-time weather data, community-reported snow conditions, and educational content with user roles, an admin panel, incident reporting, and SOS alert capabilities.

## Features

- **Dashboard**: Current snow risk assessment, weather forecast, community reports
- **Authentication**: Email/password authentication with Firebase Auth and role-based access
- **Incident Reporting**: Report snow-related incidents with risk levels, descriptions, and photos
- **Alert Monitoring**: View local and global alerts with filtering capabilities 
- **SOS Emergency Notifications**: Trigger emergency SOS alerts for immediate attention
- **Admin Panel**: Manage and respond to SOS alerts, view incidents, issue warnings

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI
- **Routing**: React Router
- **State Management**: React Context + TanStack Query
- **Authentication**: Firebase Auth
- **Backend**: Firebase (Firestore)
- **APIs**: OpenWeatherMap API

## Getting Started

### Prerequisites

- Node.js 18+
- NPM or Yarn
- Firebase account
- OpenWeatherMap API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your Firebase and OpenWeatherMap API credentials

4. Start the development server:
   ```
   npm run dev
   ```

### Firebase Configuration

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication with Email/Password
3. Set up Firestore database
4. Update the Firebase configuration in `src/services/firebase.js`

## Project Structure

- `/src/components` - UI components organized by feature
- `/src/context` - React Context for state management
- `/src/pages` - Main application pages
- `/src/services` - API services and Firebase configuration
- `/src/layouts` - Page layouts and structure

## Deployment

To build for production:

```
npm run build
```

The built files will be in the `dist` directory and can be deployed to any static host like Firebase Hosting, Netlify, or Vercel.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
