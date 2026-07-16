# Florassence 🌿

A React Native study companion app built during my frontend internship.

Florassence is designed to make productivity and learning more engaging by combining a daily task manager, a Pomodoro-style focus timer and an XP/level progression system.

The project started as a 4-day internship course project and evolved into a complete React Native capstone application through continuous improvements, feature additions and code refinement. 
Built with React Native + Expo.

## Development Journey
This project was developed over the span of 4 days 
Day 1 focused on building a static application interface with four main screens:
- Home
- Task Listing
- Details
- Profile

The focus was on UI development, layouts, reusable components, and establishing the application's visual identity.

Day 2 transformed the static application into an API-driven React Native app. This phase introduced:
- API integration
- Stack Navigation
- Bottom Tab Navigation
- Drawer Navigation
- Details screens
- Search functionality
- Favorites system
- AsyncStorage integration

Day 3 and Day 4 focused on advanced application features and final capstone improvements, including:
- Profile management
- Image picker integration
- Camera and gallery permissions
- Form validation
- Persistent storage
- Modal components
- Offline support
- Error handling UX
- Final code cleanup and documentation

The final application was completed with clean code structure, reusable components, and no major warnings or errors.

## The Look

Florassence follows a cozy, nature-inspired visual identity instead of relying on default React Native styling.

The design uses warm parchment backgrounds, forest green tones and lantern-inspired amber accents to create a calm watercolor-inspired study environment.
All colors, typography, spacing, border radius, and shadows are centralized inside `src/constants/theme.js`, allowing the entire application's visual system to be updated easily without changing individual screens.

## Features

### Authentication
The authentication system is mocked but designed to behave like a real application.

Features include:
- Persistent login sessions using AsyncStorage
- Loading state while checking authentication
- Logout confirmation
- Protected navigation flow

When users are logged out, protected screens are removed from the navigator instead of simply being hidden.

Implementation:
`src/navigation/index.js`

### Home Dashboard
The home screen provides a quick overview of productivity progress.

Includes:
- Daily goal progress ring
- Quick statistics
- Upcoming tasks
- Study progress overview

### Focus Timer
Florassence includes a Pomodoro-style focus timer to support productive study sessions.

Features:
- Focus countdown
- Break sessions
- XP rewards after completing sessions
- Customizable focus and break duration

Completed focus sessions contribute to the user's XP and level progression.

### Task Management
A complete local task management system.

Features:
- Create tasks
- Edit tasks
- Delete tasks
- Mark tasks as completed
- Add categories
- Set priorities
- Search tasks
- Filter tasks by status

Task management is handled using `TasksContext` and all data is persisted using AsyncStorage.

### Favorites
Users can bookmark important tasks.

Features:
- Add or remove favorites directly from task cards
- Dedicated favorites tab
- Separate persisted favorite IDs

Favorites are stored independently from task data.


### Profile Management
Florassence includes a complete profile customization experience.

Features:
- XP progress bar
- User level
- Study streak tracking
- Achievement badges
- Profile editing
- Profile image selection

Additional functionality:
- Camera and gallery image picker
- Permission handling
- Form validation using React Hook Form
- Offline save error handling
- Location support with reverse geocoding when online

### Settings
Users can customize application preferences.

Includes:
- Light/dark theme toggle
- Notification settings
- Sound settings
- Focus duration selection
- Break duration selection

All settings are persisted locally.

### Theme System
Florassence includes a custom theme architecture.

Implemented:
- Light theme
- Dark theme
- Persistent theme selection
- Dynamic navigation styling

Theme management is handled through a custom `useTheme()` hook.

### Offline Experience
The app provides offline awareness across the application.

Features:
- Global offline banner
- Network state detection
- Offline error messages
- Graceful fallback behavior

Users are immediately informed when the device loses connectivity.

## Tech Stack

Frontend:
- React Native
- Expo
- JavaScript
- React Navigation

State Management:
- React Context API
- Custom React Hooks

Storage:
- AsyncStorage

Forms:
- React Hook Form

APIs:
- REST API integration
- JSONPlaceholder

Device Features:
- Image Picker
- Camera permissions
- Location permissions
- Network detection

## Project Structure

src/
- components/ → Reusable UI components
- screens/ → Application screens
- navigation/ → Stack, Tab, and Drawer navigation
- context/ → Global state management
- constants/ → Theme and configuration
- services/ → Storage and API services
- hooks/ → Custom React hooks

## Explore the Project

Prerequisites:
- Node.js installed
- Expo CLI installed
- Android Studio or iOS Simulator

Installation:

Clone the repository:

git clone <repository-url>

Navigate into the project:

cd florassence

Install dependencies:

npm install

Start the Expo development server:

npx expo start

The application can run on:
- Android emulator
- iOS simulator
- Physical device using Expo Go

## Known Limitations

- Authentication is currently mocked and does not use a real backend.
- Task data is stored locally using AsyncStorage.
- Some screens have partial dark mode support and can be expanded further.

## Future Improvements


- **AI Study Assistant/ wellness companion** :
Integrate AI support to help users with study related doubts, provide explanations, generate summaries and offer personalized learning assistance. Also add an emotional support feature that can provide motivation and check-ins during study session.

- **Daily Rotating Study Tips**:
Display fresh study techniques, productivity tips and learning strategies that change every day.

- **Advanced Progress Analytics**:
Add detailed insights about study patterns, focus hours, completed tasks, streaks and productivity trends.

- **Personalized Study Recommendations**:
Suggest tasks, focus schedules and learning strategies based on user habits and goals.

- **Smart Reminders**:
Introduce intelligent notifications for upcoming tasks, study sessions, breaks and daily goals.

- **Cloud Synchronization**:
 Add backend integration for secure account management and syncing data across multiple devices.
