# Papers RAG Web Frontend

A TypeScript-based web application for interacting with the Papers RAG chatbot system. Features user authentication, chat interface, and admin user management.

## Features

- **User Authentication**: Login with email using JWT tokens
- **Chat Interface**: Send messages and receive responses from the Papers RAG agent
- **Session Management**: Maintains chat history for the current session
- **Admin Features**: Add new users with admin privileges (admin users only)
- **Responsive Design**: Bootstrap-based UI that works on desktop and mobile

## Prerequisites

- Node.js (v14 or higher)
- npm
- A running Papers RAG backend server

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API URL**:
   Edit `src/config.ts` and update the `API_BASE_URL` to point to your backend server:
   ```typescript
   export const API_BASE_URL = 'https://your-api-url';
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Serve the application**:
   ```bash
   npm run serve
   ```

   The application will be available at `http://localhost:3000`

## Development

- **Watch mode**: `npm run dev` - Automatically rebuilds TypeScript files on changes
- **Build**: `npm run build` - Compiles TypeScript to JavaScript in the `dist` folder
- **Serve**: `npm run serve` - Serves the built application on port 3000

## File Structure

```
src/
├── index.html          # Main HTML file with UI structure
├── main.ts            # Main application entry point
├── config.ts          # Configuration and type definitions
├── authService.ts     # Authentication service for login/logout
├── messageService.ts  # Message handling and chat history
└── userService.ts     # User management (add user functionality)
```

## Backend Integration

This frontend integrates with the Papers RAG backend through three main endpoints:

### 1. Authentication (`POST /login`)
- Authenticates users and provides JWT tokens
- Returns user permissions (admin status)

### 2. Messaging (`POST /message_to_agent`)
- Sends user messages to the RAG agent
- Maintains session context for conversations

### 3. User Management (`POST /add_user`)
- Allows admin users to add new users to the system
- Requires admin privileges and valid JWT token

## Usage

1. **Login**: Enter your email address on the login page
2. **Chat**: Type messages in the chat interface to interact with the Papers RAG agent
3. **Add Users** (Admin only): Click the "Add User" button to add new users to the system
4. **Logout**: Click the logout button to end your session

## Security Features

- JWT token-based authentication
- Automatic session restoration from localStorage
- Admin-only features protected by permission checks
- XSS protection through HTML escaping

## Browser Compatibility

- Modern browsers with ES2020 support
- Chrome 80+, Firefox 75+, Safari 14+, Edge 80+