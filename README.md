SlowMotion is a modern web-based fitness tracking application specifically designed for strength training and workout management. It provides users with a comprehensive platform to log workouts, track progress over time, and analyze their fitness journey through detailed metrics and visualizations.

## Core Features & Functionalities

### Workout Logging

- **Exercise Management:**  
  Users can select from a built-in exercise library organized by muscle groups:
  - Chest
  - Back
  - Legs
  - Shoulders
  - Biceps
  - Triceps
  - Core
- **Custom Exercises:**  
  Ability to create and save custom exercises with specific muscle group categorizations.
- **Set Tracking:**  
  Log multiple sets with weight, reps, and custom metrics for each exercise.
- **Custom Trackers:**  
  Add personalized metrics beyond weight/reps (e.g., RPE, rest time, notes).
- **Date-based Sessions:**  
  Organize workouts by date with automatic timestamping.
- **Duplicate Sets:**  
  Quickly duplicate sets for efficiency during workout logging.

### 📊 Progress Visualization & Analytics

- **Interactive Charts:**  
  Multiple visualization options using the Recharts library:
  - Volume Load tracking (weight × reps)
  - Maximum weight progression
  - Estimated 1RM calculations
  - Total repetitions over time
- **Filtering Options:**  
  Progress analysis by specific exercises or muscle groups.
- **Historical Performance:**  
  Comprehensive view of workout history with expandable session details.
- **Summary Statistics:**  
  Quick overview of workout metrics including total sets, reps, and volume.

### 📱 User Experience Features

- **Responsive Design:**  
  Optimized for both desktop and mobile devices.
- **Dark/Light Mode Support:**  
  Theme switching capability using `next-themes`.
- **Intuitive Navigation:**  
  Three main sections:
  - Log Workout
  - History
  - Progress
- **Real-time Sync Status:**  
  Visual indicator showing online/offline status and sync health.
- **Manual Sync Option:**  
  Backup sync button for manual data synchronization.
- **Toast Notifications:**  
  User feedback for actions like saving workouts and sync status.

### 🔄 Data Persistence & Synchronization

- **Hybrid Storage System:**  
  Combination of local storage (offline-first) and cloud backup.
- **Device-based Authentication:**  
  Anonymous user system using unique device IDs.
- **Automatic Synchronization:**  
  Background sync every 30 seconds and on lifecycle events.
- **Offline Capability:**  
  Full functionality without internet connection.
- **Cross-device Data Access:**  
  Cloud storage enables data access across devices.
- **Error Recovery:**  
  Robust error handling with manual sync fallback options.

---

## Technology Stack

### Frontend Technologies

- **Framework:** React 18.3.1 with TypeScript for type safety
- **Build Tool:** Vite 5.4.1 for fast development and optimized builds
- **Styling:**
  - Tailwind CSS 3.4.11 for utility-first styling
  - shadcn/ui component library built on Radix UI primitives
  - Custom CSS variables for theming and design system
- **State Management:** Zustand 5.0.7 for lightweight, centralized state management
- **Routing:** React Router DOM 6.26.2 for navigation (single-page application)

### UI Components & Libraries

- **Component Library:** Comprehensive shadcn/ui implementation with 30+ Radix UI components
- **Icons:** Lucide React for consistent iconography
- **Charts:** Recharts 2.12.7 for data visualization
- **Date Handling:** date-fns 3.6.0 for date operations and formatting
- **Forms:** React Hook Form 7.53.0 with Zod 3.23.8 validation
- **Notifications:** Sonner 1.5.0 for toast notifications

### Backend & Database

- **Backend-as-a-Service:** Supabase integration
- **Database:** PostgreSQL with Row Level Security (RLS) policies
- **Real-time Features:** Supabase client for real-time data synchronization
- **Authentication:** Device-based anonymous authentication system

#### Database Schema

The application uses a well-structured relational database with the following key tables:

- `device_users`: Manages anonymous device-based users
- `exercise_library`: Built-in exercise database
- `user_exercises`: Custom user-created exercises
- `workout_sessions`: Individual workout sessions
- `workout_entries`: Exercise entries within sessions
- `user_custom_trackers`: Personalized tracking metrics

---

## Development & Quality Tools

- **Linting:** ESLint 9.9.0 with React-specific rules
- **Type Checking:** TypeScript 5.5.3 for static type analysis
- **Code Formatting:** Integrated with modern development workflows

---

## Architecture Highlights

### Local-First Design

The application prioritizes local storage for immediate responsiveness, with cloud synchronization as a backup and cross-device feature.

### Component-Based Architecture

Modular React components with clear separation of concerns:

- Layout components for navigation and structure
- Feature components for specific functionality (`LogWorkout`, `History`, `Progress`)
- Reusable UI components from shadcn/ui library

### Robust Error Handling

Comprehensive error handling throughout the sync process with user-friendly feedback and manual recovery options.

### Scalable State Management

Zustand-based state management with organized store structure for exercises, workout sessions, UI state, and synchronization status.

---

This application represents a modern, full-featured fitness tracking solution that balances simplicity with powerful analytics capabilities, making it suitable for both casual fitness enthusiasts and serious strength training athletes.